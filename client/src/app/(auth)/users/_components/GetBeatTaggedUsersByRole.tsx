"use client";
import { ROLES_TYPE } from "@/common/constant.common";
import { beatTagUserPageIndex, beatTagUserPageSkip } from "@/common/constant_frontend.common";
import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { IUser, useBeatTaggedUsers } from "@/services/user.service";
import { ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";

export default function GetBeatTaggedUsersByRole({ id, role }: { id: string; role: ROLES_TYPE }) {
  const {
    data: taggedUsers,
    isFetching,
    isLoading,
    refetch,
  } = useBeatTaggedUsers({ id, role }, true, true, beatTagUserPageIndex, beatTagUserPageSkip);

  const processedData = useProcessData(taggedUsers);
  const loading = useLoading(isFetching, isLoading);

  const columns = useMemo(() => {
    let cols: ColumnDef<IUser>[] = [
      {
        header: "Name",
        accessorFn: (row) => row.name,
        id: "name",
      },
    ];

    // if (
    //   role === ROLES.NSM ||
    //   role === ROLES.ZSM ||
    //   role === ROLES.RSM ||
    //   role === ROLES.STATE_HEAD ||
    //   role === ROLES.ASM ||
    //   role === ROLES.ASE ||
    //   role === ROLES.SO ||
    //   role === ROLES.PSR
    // ) {
    //   cols.push({
    //     header: "Sales",
    //     cell: (row) => 0,
    //     id: "sales",
    //   });
    // }

    return cols;
  }, [role]);

  // if (!processedData.rows?.length) {
  //   return null;
  // }

  return (
    <div className="row ">
      <div className="col">
        <div className="global_shadow_border global_margin global_padding">
          <h5 className="mb-2">{role} By Tagged Beats:</h5>

          <CustomTable
            columns={columns}
            data={processedData.rows}
            reload={refetch}
            serverPagination
            totalCount={processedData.total}
            loading={loading}
            pageIndexKey={beatTagUserPageIndex}
            pageSizeKey={beatTagUserPageSkip}
          />
        </div>
      </div>
    </div>
  );
}
