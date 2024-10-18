"use client";
import { ColumnDef } from "@tanstack/react-table";
import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { useMemo } from "react";
import { IAttributeValue, useAttributeValue, useDeleteAttributeValue } from "@/services/attributeValue.service";
import Link from "next/link";
import { GoPencil, GoTrash } from "react-icons/go";
import { toastError, toastSuccess } from "@/utils/toast";
import { useAttributeById } from "@/services/attribute.service";

export default function ViewAttributeValue({ attributeId }: { attributeId: string }) {
  const {
    data: attributeValue,
    isFetching,
    isLoading,
    refetch,
  } = useAttributeValue({ attributeId }, false, !!attributeId);
  const processedData = useProcessData(attributeValue);
  const loading = useLoading(isFetching, isLoading);
  const { data: attribute } = useAttributeById(attributeId, !!attributeId);

  const { mutateAsync: deleteAttributeValue } = useDeleteAttributeValue();

  //HANDLERS
  const handleDeleteAttributeValue = async (attributeValueId: string) => {
    try {
      if (!attributeValueId) return;

      if (!window.confirm("Are you sure you want to delete this attributeValue ? ")) return;

      const res = await deleteAttributeValue(attributeValueId);
      if (res.data?.message) {
        toastSuccess(res.data?.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  const columns = useMemo(() => {
    let cols: ColumnDef<IAttributeValue>[] = [
      {
        header: "Name",
        accessorFn: (row) => row.name,
        id: "name",
      },
      {
        header: "",
        cell: ({ row: { original: row } }) => {
          return (
            <Link href={`/attributeValue?id=${row?._id}`}>
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
            <div role="button" onClick={() => handleDeleteAttributeValue(row?._id)}>
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
          <h5 className="text-maincolor ">View {attribute?.name} Attribute Values</h5>
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
