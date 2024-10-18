"use client";
import { ColumnDef } from "@tanstack/react-table";
import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { useMemo } from "react";
import { IPort, usePort, useDeletePort } from "@/services/port.service";
import Link from "next/link";
import { GoPencil, GoTrash } from "react-icons/go";
import { toastError, toastSuccess } from "@/utils/toast";

export default function ViewPort() {
  const { data: port, isFetching, isLoading, refetch } = usePort();
  const processedData = useProcessData(port);
  const loading = useLoading(isFetching, isLoading);

  const { mutateAsync: deletePort } = useDeletePort();

  //HANDLERS
  const handleDeletePort = async (portId: string) => {
    try {
      if (!portId) return;

      if (!window.confirm("Are you sure you want to delete this port ? ")) return;

      const res = await deletePort(portId);
      if (res.data?.message) {
        toastSuccess(res.data?.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  const columns = useMemo(() => {
    let cols: ColumnDef<IPort>[] = [
      {
        header: "Name",
        accessorFn: (row) => row.name,
        id: "name",
      },
      {
        header: "Address",
        accessorFn: (row) => row.address,
        id: "address",
      },
      {
        header: "",
        cell: ({ row: { original: row } }) => {
          return (
            <Link href={`/port?id=${row?._id}`}>
              <GoPencil size={15} />
            </Link>
          );
        },
        id: "action2",
      },
      {
        header: "",
        cell: ({ row: { original: row } }) => {
          return (
            <div role="button" onClick={() => handleDeletePort(row?._id)}>
              <GoTrash color="red" size={15} />
            </div>
          );
        },
        id: "action1",
      },
    ];
    return cols;
  }, []);

  return (
    <div className="row">
      <div className="col">
        <div className="global_shadow_border global_padding">
          <h5 className="text-mainport ">View Ports</h5>
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
    </div>
  );
}
