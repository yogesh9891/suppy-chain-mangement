"use client";
import { ColumnDef } from "@tanstack/react-table";
import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { useMemo } from "react";
import { IAttribute, useAttribute, useDeleteAttribute } from "@/services/attribute.service";
import Link from "next/link";
import { GoPencil, GoTrash } from "react-icons/go";
import { toastError, toastSuccess } from "@/utils/toast";
import { FaEye } from "react-icons/fa";

export default function ViewAttribute() {
  const { data: attribute, isFetching, isLoading, refetch } = useAttribute();
  const processedData = useProcessData(attribute);
  const loading = useLoading(isFetching, isLoading);

  const { mutateAsync: deleteAttribute } = useDeleteAttribute();

  //HANDLERS
  const handleDeleteAttribute = async (attributeId: string) => {
    try {
      if (!attributeId) return;

      if (!window.confirm("Are you sure you want to delete this attribute ? ")) return;

      const res = await deleteAttribute(attributeId);
      if (res.data?.message) {
        toastSuccess(res.data?.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  const columns = useMemo(() => {
    let cols: ColumnDef<IAttribute>[] = [
      {
        header: "Name",
        accessorFn: (row) => row.name,
        id: "name",
      },
      {
        header: "",
        cell: ({ row: { original: row } }) => {
          return (
            <Link href={`/attribute?id=${row?._id}`}>
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
            <div role="button" onClick={() => handleDeleteAttribute(row?._id)}>
              <GoTrash color="red" size={15} />
            </div>
          );
        },
        id: "action1",
      },
      {
        header: "",
        cell: ({ row: { original: row } }) => {
          return (
            <Link href={`/attribute/${row?._id}`}>
              <FaEye size={15} />
            </Link>
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
          <h5 className="text-maincolor ">View Attributes</h5>
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
