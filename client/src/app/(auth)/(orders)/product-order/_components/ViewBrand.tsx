"use client";
import { ColumnDef } from "@tanstack/react-table";
import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { useMemo } from "react";
import { IBrand, useBrand, useDeleteBrand } from "@/services/brand.service";
import Link from "next/link";
import { GoPencil, GoTrash } from "react-icons/go";
import { toastError, toastSuccess } from "@/utils/toast";

export default function ViewBrand() {
  const { data: brand, isFetching, isLoading, refetch } = useBrand();
  const processedData = useProcessData(brand);
  const loading = useLoading(isFetching, isLoading);

  const { mutateAsync: deleteBrand } = useDeleteBrand();

  //HANDLERS
  const handleDeleteBrand = async (brandId: string) => {
    try {
      if (!brandId) return;

      if (!window.confirm("Are you sure you want to delete this brand ? ")) return;

      const res = await deleteBrand(brandId);
      if (res.data?.message) {
        toastSuccess(res.data?.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  const columns = useMemo(() => {
    let cols: ColumnDef<IBrand>[] = [
      {
        header: "Name",
        accessorFn: (row) => row.name,
        id: "name",
      },
      {
        header: "",
        cell: ({ row: { original: row } }) => {
          return (
            <Link href={`/brand?id=${row?._id}`}>
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
            <div role="button" onClick={() => handleDeleteBrand(row?._id)}>
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
          <h5 className="text-maincolor ">View Brands</h5>
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
