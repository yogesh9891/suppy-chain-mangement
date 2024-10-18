"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { ICountries, useCountry, useDeleteCountry } from "@/services/country.service";
import CustomTable from "@/components/CustomTable";
import { GoPencil, GoTrash } from "react-icons/go";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { toastError, toastSuccess } from "@/utils/toast";
import Link from "next/link";

export default function ViewCountry() {
  //DATA
  const { data: country, isFetching, isLoading, refetch } = useCountry();
  const processedData = useProcessData(country);
  const loading = useLoading(isFetching, isLoading);

  //MUTANTS
  const { mutateAsync: deleteCountry } = useDeleteCountry();

  //HANDLERS
  const handleDeleteCountry = async (countryId: string) => {
    try {
      if (!countryId) return;

      if (!window.confirm("Are you sure you want to delete this country ? ")) return;

      const res = await deleteCountry(countryId);
      if (res.data?.message) {
        toastSuccess(res.data?.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  //COLUMNS
  const columns = useMemo(() => {
    let cols: ColumnDef<ICountries>[] = [
      {
        header: "Name",
        accessorFn: (row) => row.name,
        id: "name",
      },
      {
        header: "",
        cell: ({ row: { original: row } }) => {
          return (
            <Link href={`/countries?id=${row?._id}`}>
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
            <div role="button" onClick={() => handleDeleteCountry(row?._id)}>
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
    <div className="row ">
      <div className="col">
        <div className=" global_shadow_border global_padding">
          <h5 className="text-maincolor">View Countries</h5>
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
