"use client";
import { ColumnDef } from "@tanstack/react-table";
import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { useMemo } from "react";
import { ICompany, useCompany } from "@/services/company.service";

export default function ViewCompany() {
  const { data: company, isFetching, isLoading, refetch } = useCompany();
  const processedData = useProcessData(company);
  const loading = useLoading(isFetching, isLoading);

  const columns = useMemo(() => {
    let cols: ColumnDef<ICompany>[] = [
      {
        header: "Name",
        accessorFn: (row) => row.name,
        id: "name",
      },
    ];
    return cols;
  }, []);

  return (
    <div className="row">
      <div className="col">
        <div className="global_shadow_border global_padding">
          <h5 className="text-maincolor ">View Companies</h5>
          <CustomTable
            columns={columns}
            data={processedData.rows}
            reload={refetch}
            serverPagination
            totalCount={processedData.total}
            loading={loading}
            pageIndexKey="companyIndexKey"
            pageSizeKey="companySizeKey"
          />
        </div>
      </div>
    </div>
  );
}
