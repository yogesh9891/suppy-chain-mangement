"use client";
import { ColumnDef } from "@tanstack/react-table";

import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { IArea, useArea, useDeleteArea } from "@/services/area.service";
import { useMemo } from "react";
import { toastError, toastSuccess } from "@/utils/toast";
import Link from "next/link";
import { GoPencil, GoTrash } from "react-icons/go";

export default function ViewArea() {
  const { data: area, isFetching, isLoading, refetch } = useArea();
  const processedData = useProcessData(area);
  const loading = useLoading(isFetching, isLoading);

  const { mutateAsync: deleteArea } = useDeleteArea();

  //HANDLERS
  const handleDeleteArea = async (areaId: string) => {
    try {
      if (!areaId) return;

      if (!window.confirm("Are you sure you want to delete this Region ? ")) return;

      const res = await deleteArea(areaId);
      if (res.data?.message) {
        toastSuccess(res.data?.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  const columns = useMemo(() => {
    let cols: ColumnDef<IArea>[] = [
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
        header: "State",
        accessorFn: (row) => row.stateName,
        id: "state",
      },
      {
        header: "City",
        accessorFn: (row) => row.cityName,
        id: "city",
      },
      {
        header: "",
        cell: ({ row: { original: row } }) => {
          return (
            <Link href={`/area?id=${row?._id}`}>
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
            <div role="button" onClick={() => handleDeleteArea(row?._id)}>
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
          <h5 className="text-maincolor">View Areas</h5>
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
