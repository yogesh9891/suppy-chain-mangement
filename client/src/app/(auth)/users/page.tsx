"use client";
import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { IUser, useUser } from "@/services/user.service";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { GoEye } from "react-icons/go";
import { useRedirectIfNoValidRole, useRoleFromParams } from "./_users.utils/hooks";
import SetHeaderName from "@/components/SetHeaderName";
import { ROLE_STATUS, ROLES, ROLES_TYPE } from "@/common/constant.common";
import { Modal } from "react-bootstrap";
import { rolesForBeatTagging } from "./_users.utils/RolePermissions";
import { useCurrentRole } from "@/customhooks/useCurrentRole";

export default function Page() {
  const role = useRoleFromParams();
  useRedirectIfNoValidRole();
  const adminRole = useCurrentRole();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [showBeatTag, setShowBeatTag] = useState(false);
  const handleBeatTagClose = () => setShowBeatTag(false);
  const handleBeatTagShow = () => setShowBeatTag(true);

  const storId = adminRole != ROLES.ADMIN ? 1 : 0;
  const { data: users, isFetching, isLoading, refetch } = useUser({ role: role });
  const processedData = useProcessData(users);
  const loading = useLoading(isFetching, isLoading);

  const columns = useMemo(() => {
    let cols: ColumnDef<IUser>[] = [
      {
        header: "Name",
        accessorFn: (row) => row.name,
        id: "name",
      },
      {
        header: "Phone",
        accessorFn: (row) => row.phone,
        id: "Phone",
      },
      {
        header: "Email",
        accessorFn: (row) => row.email,
        id: "Email",
      },
      {
        header: "Actions",
        cell: ({ row: { original: row } }) => {
          return (
            <Link className="btn" href={`/users/details/${row._id}`}>
              <GoEye />
            </Link>
          );
        },

        id: "actions",
      },
    ];
    return cols;
  }, []);
  return (
    <div className="row">
      <SetHeaderName name={`${role}`} />
      <div className="col">
        <div className="global_shadow_border global_padding">
          <div className="d-flex align-items-center mb-2">
            <div className="flex-fill">{/* <h4 className="mb-0">{role}</h4> */}</div>
            <div className="d-flex justify-content-end">
              {rolesForBeatTagging.includes(role as ROLES_TYPE) && (
                <button className="btn btn-maincolor me-2" onClick={handleBeatTagShow}>
                  Upload Beat Tagging
                </button>
              )}

              {role != ROLES.STORE && (
                <Link href={`/users/add?role=${role}`} className="btn btn-maincolor">
                  Add {role} +
                </Link>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col">
              <CustomTable
                columns={columns}
                data={processedData.rows}
                reload={refetch}
                serverPagination
                totalCount={processedData.total}
                loading={loading}
              />
            </div>
          </div>

          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Upload:</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* {show && (
                <>
                  {role === ROLES.PSR && <UploadUserExcel onSubmitSuccess={handleClose} />}
                  {(role === ROLES.DISTRIBUTOR ||
                    role === ROLES.SUPERSTOCKIEST ||
                    role === ROLES.EMPLOYEE ||
                    role === ROLES.STORE) && <UploadDealerExcel onSubmitSuccess={handleClose} role={role} />}
                </>
              )} */}
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
}
