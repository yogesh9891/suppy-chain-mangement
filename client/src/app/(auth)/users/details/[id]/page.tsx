"use client";
import React from "react";
import UserInfo from "../../_components/UserInfo";
import { useUserById } from "@/services/user.service";
import { ROLES } from "@/common/constant.common";
import GetUsersByRole from "../../_components/GetUsersByRole";
import { rolesForUsers } from "../../_users.utils/RolePermissions";
import SetHeaderName from "@/components/SetHeaderName";
import { useCurrentRole } from "@/customhooks/useCurrentRole";
import OrdersList from "../../_components/OrderList";

export default function Page({ params }: { params: { id: string } }) {
  //DATA - User
  const { data: userData } = useUserById(params.id);

  //CONSTS
  const userRole: any = userData?.role;
  const id = params?.id;
  const role = useCurrentRole();

  return (
    <div className="row">
      <SetHeaderName name={`${userRole ?? "USER"} DETAILS`} />
      <div className="col">
        <div className="row">
          <div className="col">
            <div className="auto_grid">
              <div>
                <UserInfo id={id} />
              </div>
              {/* {userRole === ROLES.EMPLOYEE && (
                <div>
                  <EMPLOYEEPaymentCollection user={userData} />
                </div>
              )} */}
            </div>
          </div>
        </div>

        <div className="row my-2">
          <div className="col">
            <div className="global_shadow_border global_padding">
              {rolesForUsers.includes(userRole) && <h5>Employees:</h5>}
              <div className="d-flex flex-wrap">
                <GetUsersByRole id={id} role={ROLES.EMPLOYEE} />
              </div>
            </div>
          </div>
        </div>

      
          <div className="row my-2">
            <div className="col">
              <OrdersList userData={userData} />
            </div>
          </div>
      
      </div>
    </div>
  );
}
