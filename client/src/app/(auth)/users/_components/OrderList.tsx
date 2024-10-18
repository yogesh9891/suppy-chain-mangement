import React from "react";
import { rolesForBuyingOrderList, rolesForSellingOrderList } from "../_users.utils/RolePermissions";
import SellingOrdersTable from "./SellingOrderTable";
import BuyerOrderTable from "./BuyerOrderTable";
import { ROLES } from "@/common/constant.common";

function OrdersList({ userData }: { userData: any }) {
  const userRole = userData?.role;

  return (
    <>
      {userRole == ROLES.ADMIN && (
        <div className="row mt-3">
          <div className="col">
            <SellingOrdersTable userData={userData} />
          </div>
        </div>
      )}

      <div className="row mt-3">
        <div className="col">
          <BuyerOrderTable userData={userData} />
        </div>
      </div>

      {/* <div className="row mt-3">
        {rolesForBuyingOrderList?.includes(userRole) && (
          <div className="col">
            <BuyingOrdersTable userData={userData} />
          </div>
        )}
      </div>
      <div className="row mt-3">
        {rolesForSellingOrderList?.includes(userRole) && (
          <div className="col">
            <ReturnOrdersTableForSellers userData={userData} />
          </div>
        )}
      </div>
      <div className="row mt-3">
        {rolesForBuyingOrderList?.includes(userRole) && (
          <div className="col">
            <ReturnOrdersTableForBuyers userData={userData} />
          </div>
        )}
      </div> */}
    </>
  );
}

export default OrdersList;
