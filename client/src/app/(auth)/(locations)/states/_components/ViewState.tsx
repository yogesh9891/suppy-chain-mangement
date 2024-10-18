"use client";
import { ColumnDef } from "@tanstack/react-table";

import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { IState, useDeleteState, useStates } from "@/services/state.service";
import { useMemo } from "react";
import Link from "next/link";
import { GoPencil, GoTrash } from "react-icons/go";
import { toastError, toastSuccess } from "@/utils/toast";

export default function ViewState() {
  const { data: country, isFetching, isLoading, refetch } = useStates();
  const processedData = useProcessData(country);
  const loading = useLoading(isFetching, isLoading);

  const { mutateAsync: deleteState } = useDeleteState();

  //HANDLERS
  const handleDeleteState = async (stateId: string) => {
    try {
      if (!stateId) return;

      if (!window.confirm("Are you sure you want to delete this State ? ")) return;

      const res = await deleteState(stateId);
      if (res.data?.message) {
        toastSuccess(res.data?.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  const columns = useMemo(() => {
    let cols: ColumnDef<IState>[] = [
      {
        header: "Name",
        accessorFn: (row) => row.name,
        id: "name",
      },
      {
        header: "Country",
        accessorFn: (row) => row.countryName,
        id: "country",
      },
      {
        header: "",
        cell: ({ row: { original: row } }) => {
          return (
            <Link href={`/states?id=${row?._id}`}>
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
            <div role="button" onClick={() => handleDeleteState(row?._id)}>
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
          <h5 className="text-maincolor">View States</h5>
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
