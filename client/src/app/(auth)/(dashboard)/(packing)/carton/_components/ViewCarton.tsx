"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { ICartons, useCarton, useDeleteCarton } from "@/services/carton.service";
import CustomTable from "@/components/CustomTable";
import { GoPencil, GoTrash } from "react-icons/go";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { toastError, toastSuccess } from "@/utils/toast";
import Link from "next/link";

export default function ViewCarton() {
  //DATA
  const { data: carton, isFetching, isLoading, refetch } = useCarton();
  const processedData = useProcessData(carton);
  const loading = useLoading(isFetching, isLoading);

  //MUTANTS
  const { mutateAsync: deleteCarton } = useDeleteCarton();

  //HANDLERS
  const handleDeleteCarton = async (cartonId: string) => {
    try {
      if (!cartonId) return;

      if (!window.confirm("Are you sure you want to delete this carton ? ")) return;

      const res = await deleteCarton(cartonId);
      if (res.data?.message) {
        toastSuccess(res.data?.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  //COLUMNS
  const columns = [
      {
        header: "Name",
        accessorFn: (row: { name: any; }) => row.name,
        id: "name",
      },
      {
        header: "",
        cell: ({ row: { original: row } }:any) => {
          return (
            <Link href={`/carton?id=${row?._id}`}>
              <GoPencil size={15} />
            </Link>
          );
        },
        id: "action2",
      },
      {
        header: "",
        cell: ({ row: { original: row } }:any) => {
          return (
            <div role="button" onClick={() => handleDeleteCarton(row?._id)}>
              <GoTrash color="red" size={15} />
            </div>
          );
        },
        id: "action1",
      },
    ];


  return (
    <div className="row ">
      <div className="col">
        <div className=" global_shadow_border global_padding">
          <h5 className="text-maincolor">View Cartoons</h5>
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
