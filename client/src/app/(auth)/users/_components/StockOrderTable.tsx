import { ORDER_STATUS, ROLES } from "@/common/constant.common";
import CustomModal from "@/components/CustomModal";
import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { IProductStock, useProductStock } from "@/services/productOrder.service";
import { useProductOrder } from "@/services/productOrder.service";
import { toastError, toastSuccess } from "@/utils/toast";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import { GoPencil } from "react-icons/go";

function StockOrderTable({ userData }: { userData: any }) {
  //CONSTANT
  const userRole = userData?.role;

  //DATAS - Selling order
  const {
    data: sellingOrders,
    isFetching: ordersIsFetching,
    isLoading: orderLoadingStatus,
    refetch: refetchOrders,
  } = useProductStock({ orderedToId: userData?._id }, false);
  const processedOrders = useProcessData(sellingOrders);
  const ordersIsLoading = useLoading(ordersIsFetching, orderLoadingStatus);

  //TABLE COLUMNS - Selling-Order-Columns,
  const columns = useMemo(() => {
    let cols: ColumnDef<IProductStock>[] = [
      {
        header: "ID",
        accessorFn: (row) => row._id,
        id: "orderId",
      },
      {
        header: "Created On",
        accessorFn: (row) => moment(row.createdAt).format("DD/MM/YY-h:mm A"),
        id: "orderOn",
      },
      {
        header: "Name",
        accessorFn: (row: any) => row?.name,
        id: "buyerName",
      },
      {
        header: "Total Stock",
        accessorFn: (row: any) => row?.totalItems,
        id: "total",
      },
      {
        header: "Left Stock",
        accessorFn: (row: any) => row?.leftItems,
        id: "total",
      },
  
    ];
    return cols;
  }, []);

  return (
    <div className="global_shadow_border global_padding">
      <div className="row">
        <div className="col">
          <div className="d-flex align-items-center mb-2">
            <div className="flex-fill d-flex">
              <h5 className="mb-0">Store Stock: </h5>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <CustomTable
                columns={columns}
                data={processedOrders.rows}
                reload={refetchOrders}
                serverPagination
                totalCount={processedOrders.total}
                loading={ordersIsLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockOrderTable;
