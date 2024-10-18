"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { ICountries, useZone, useDeleteZone } from "@/services/zone.service";
import CustomTable from "@/components/CustomTable";
import { GoPencil, GoTrash } from "react-icons/go";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { toastError, toastSuccess } from "@/utils/toast";
import Link from "next/link";

export default function ViewZone() {
  //DATA
  const { data: zone, isFetching, isLoading, refetch } = useZone();
  const processedData = useProcessData(zone);
  const loading = useLoading(isFetching, isLoading);

  //MUTANTS
  const { mutateAsync: deleteZone } = useDeleteZone();

  //HANDLERS
  const handleDeleteZone = async (zoneId: string) => {
    try {
      if (!zoneId) return;

      if (!window.confirm("Are you sure you want to delete this zone ? ")) return;

      const res = await deleteZone(zoneId);
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
            <div role="button" onClick={() => handleDeleteZone(row?._id)}>
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
