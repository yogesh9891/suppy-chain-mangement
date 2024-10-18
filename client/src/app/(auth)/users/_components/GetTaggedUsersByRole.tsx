"use client";
import { ROLES_TYPE } from "@/common/constant.common";
import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { IUser, useTaggedUsers } from "@/services/user.service";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";

export default function GetTaggedUsersByRole({ id, role }: { id: string; role: ROLES_TYPE }) {
  const { data: taggedUsers, isFetching, isLoading, refetch } = useTaggedUsers({ id, role }, false);

  const processedData = useProcessData(taggedUsers);
  const loading = useLoading(isFetching, isLoading);

  const columns = useMemo(() => {
    let cols: ColumnDef<IUser>[] = [
      {
        header: "Name",
        accessorFn: (row) => row.name,
        cell: ({ row: { original: row } }) => <Link href={` /users/details/${row._id}`}>{row.name}</Link>,
        id: "name",
      },
    ];

    // if (
    //   role === ROLES.NSM ||
    //   role === ROLES.ZSM ||
    //   role === ROLES.RSM ||
    //   role === ROLES.STATE_HEAD ||
    //   role === ROLES.ASM ||
    //   role === ROLES.ASE ||
    //   role === ROLES.SO ||
    //   role === ROLES.PSR
    // ) {
    //   cols.push({
    //     header: "Sales",
    //     cell: (row) => 0,
    //     id: "sales",
    //   });
    // }

    return cols;
  }, [role]);

  if (!processedData.rows?.length) {
    return null;
  }

  return (
  
      <div className="col-3">

        <div className="global_shadow_border global_margin global_padding" style={{borderRadius:'4px',boxShadow:'none',border:'1px solid #ccc'}}>

          <h6>{role}:</h6>

          <CustomTable
            columns={columns}
            data={processedData.rows}
            reload={refetch}
            totalCount={processedData.total}
            loading={loading}
          />

        </div>
      </div>
  
  );
}
