"use client";
import { ColumnDef } from "@tanstack/react-table";
import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { useMemo } from "react";
import { ICategory, useCategory, useDeleteCategory } from "@/services/category.service";
import Image from "next/image";
import { generateFilePath } from "@/services/url.service";
import Link from "next/link";
import { GoPencil, GoTrash } from "react-icons/go";
import { toastError, toastSuccess } from "@/utils/toast";

export default function ViewCategory() {
  const { data: category, isFetching, isLoading, refetch } = useCategory();
  const processedData = useProcessData(category);
  const loading = useLoading(isFetching, isLoading);

  const { mutateAsync: deleteCategory } = useDeleteCategory();

  //HANDLERS
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      if (!categoryId) return;

      if (!window.confirm("Are you sure you want to delete this category ? ")) return;

      const res = await deleteCategory(categoryId);
      if (res.data?.message) {
        toastSuccess(res.data?.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  const columns = useMemo(() => {
    let cols: ColumnDef<ICategory>[] = [
      {
        header: "Name",
        cell: ({ row: { original: row } }) => (
          <div>
            <Image
              alt="Thumbnail"
              src={row?.thumbnail ? generateFilePath(row.thumbnail) : require("@/assets/img/logo.png")}
              width={30}
              height={30}
              style={{ borderRadius: 50, objectFit: "contain" }}
            />
            {`  ${row.name}`}
          </div>
        ),
        id: "name",
      },
      {
        header: "Parent Category",
        cell: ({ row: { original: row } }) => (
          <>{row.parentCategory ? <div>{`  ${row.parentCategory?.name}`}</div> : <div>Nil</div>}</>
        ),
        id: "name",
      },
      {
        header: "",
        cell: ({ row: { original: row } }) => {
          return (
            <Link href={`/category?id=${row?._id}`}>
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
            <div role="button" onClick={() => handleDeleteCategory(row?._id)}>
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
          <h5 className="text-maincolor">View Category</h5>
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
