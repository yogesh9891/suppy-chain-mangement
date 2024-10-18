"use client";
import { ColumnDef } from "@tanstack/react-table";

import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { ICity, useDeleteCity, useCity } from "@/services/city.service";
import { useMemo } from "react";
import { toastError, toastSuccess } from "@/utils/toast";
import Link from "next/link";
import { GoPencil, GoTrash } from "react-icons/go";

export default function ViewCity() {
  const { data: country, isFetching, isLoading, refetch } = useCity();
  const processedData = useProcessData(country);
  const loading = useLoading(isFetching, isLoading);

  //MUTANT
  const { mutateAsync: deleteCity } = useDeleteCity();

  //HANDLERS
  const handleDeleteCity = async (cityId: string) => {
    try {
      if (!cityId) return;

      if (!window.confirm("Are you sure you want to delete this City ? ")) return;

      const res = await deleteCity(cityId);
      if (res.data?.message) {
        toastSuccess(res.data?.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  const columns = useMemo(() => {
    let cols: ColumnDef<ICity>[] = [
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
        header: "",
        cell: ({ row: { original: row } }) => {
          return (
            <Link href={`/city?id=${row?._id}`}>
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
            <div role="button" onClick={() => handleDeleteCity(row?._id)}>
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
          <h5 className="text-maincolor">View Cities</h5>
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
