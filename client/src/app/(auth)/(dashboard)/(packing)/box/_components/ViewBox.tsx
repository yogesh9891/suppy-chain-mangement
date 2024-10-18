"use client";
import { ColumnDef } from "@tanstack/react-table";

import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { IBox, useDeleteBox, useBoxs } from "@/services/box.service";
import { useMemo } from "react";
import Link from "next/link";
import { GoPencil, GoTrash } from "react-icons/go";
import { toastError, toastSuccess } from "@/utils/toast";

export default function ViewBox() {
  const { data: carton, isFetching, isLoading, refetch } = useBoxs();
  const processedData = useProcessData(carton);
  const loading = useLoading(isFetching, isLoading);

  const { mutateAsync: deleteBox } = useDeleteBox();

  //HANDLERS
  const handleDeleteBox = async (boxId: string) => {
    try {
      if (!boxId) return;

      if (!window.confirm("Are you sure you want to delete this Box ? ")) return;

      const res = await deleteBox(boxId);
      if (res.data?.message) {
        toastSuccess(res.data?.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  const columns = [
      {
        header: "Name",
        accessorFn: (row: { name: any; }) => row.name,
        id: "name",
      },
      {
        header: "Carton",
        accessorFn: (row: { cartonName: any; }) => row.cartonName,
        id: "carton",
      },
      {
        header: "",
        cell: ({ row: { original: row } }:any) => {
          return (
            <Link href={`/box?id=${row?._id}`}>
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
            <div role="button" onClick={() => handleDeleteBox(row?._id)}>
              <GoTrash color="red" size={15} />
            </div>
          );
        },
        id: "action1",
      },
    ];


  return (
    <div className="row">
      <div className="col">
        <div className="global_shadow_border global_padding">
          <h5 className="text-maincolor">View Boxs</h5>
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
