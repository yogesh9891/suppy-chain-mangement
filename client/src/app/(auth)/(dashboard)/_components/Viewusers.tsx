"use client";
import { ROLES, ROLES_TYPE } from "@/common/constant.common";
import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { IUser, useProfile, useTaggedUsers, useUser } from "@/services/user.service";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";
import style from "@/app/(auth)/(dashboard)/dashboard.module.scss";

export function ViewSalesTeam({ role }: { role: ROLES_TYPE }) {
  const { data: userData } = useProfile();
  const userRole = userData?.role;
  const isAdmin = userRole === ROLES.ADMIN || userRole === ROLES.SUBADMIN;

  const { data: users } = useUser({ role: role, getCountOnly: true }, false, !!userData);

  const { data: taggedUsers } = useTaggedUsers({ role: role, getCountOnly: true }, false, !!userData);

  const data = isAdmin ? users : taggedUsers;

  const processedData = useProcessData(data);

  if (!processedData.total) {
    return null;
  }

  return (
    <div className="row flex-grow-1 ">
      <div className="col">
        <div
          className={`global_margin global_padding ${style.sales_table} d-flex justify-content-between align-items-center`}
        >
          <h5 className={`text-maincolor ${style.head_text} m-0 pe-1`}>{role}</h5>
          <h5 className={`text-maincolor ${style.head_text} m-0 ps-1`}>{processedData.total}</h5>
        </div>
      </div>
    </div>
  );
}

export function ViewUsers({ role }: { role: ROLES_TYPE }) {
  const { data: users } = useUser({ role: role }, false);
  const processedData = useProcessData(users);
  if (!processedData?.total) {
    return null;
  }

  return (
    <div className="col-3">
      <div
        className={`global_margin global_padding ${style.sales_table} d-flex justify-content-between align-items-center`}
      >
        <h5 className={`text-maincolor ${style.head_text} m-0 pe-1`}>{role}</h5>
        <h5 className={`text-maincolor ${style.head_text} m-0 ps-1`}>{processedData.total}</h5>
      </div>
    </div>
  );
}
