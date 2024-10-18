"use client";
import Link from "next/link";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import CustomTable from "@/components/CustomTable";
import SetHeaderName from "@/components/SetHeaderName";
import { IProduct, useProduct, useUpdateProductIsFocused } from "@/services/product.service";
import { toastError, toastSuccess } from "@/utils/toast";
import { GoPencil } from "react-icons/go";
import { FaEye } from "react-icons/fa";
import { IProductOrder, useProductOrder } from "@/services/productOrder.service";
import { IOrder, useOrder } from "@/services/order.service";
import {
  ICompanyOrder,
  ICompanyOrderLogs,
  useOrderStockByProductId,
  useUpdateCompanyOrder,
  useUpdateCompanyStatus,
} from "@/services/companyOrder.service";
import { useNavigate } from "@/hooks/useNavigate";
import { PRODUCT_STATUS } from "@/common/constant.common";
import { Form, Modal } from "react-bootstrap";
import { useWareHouseStockLogs } from "@/services/container.service";

export default function Page({ params }: { params: { id: string } }) {
  const Item = "Product";
  const productId = params.id;
  //DATA Products
  const { data: productStocks, refetch, isFetching, isLoading } = useWareHouseStockLogs({ productId }, !!productId);
  const processedProducts = useProcessData(productStocks);

  const loading = useLoading(isFetching, isLoading);

  //TABLE COLUMNS: Products
  const columns = useMemo(() => {
    let cols: ColumnDef<ICompanyOrderLogs>[] = [
      {
        header: "Name",
        accessorFn: (row) => row.name,
        id: "name",
      },
      {
        header: "Quantity",
        accessorFn: (row) => row.quantity,
        id: "quantity",
      },
      {
        header: "Status",
        accessorFn: (row) => row.status,
        id: "price",
      },

      {
        header: "Date",
        accessorFn: (row: any) => new Date(row.createdAt).toDateString(),
        id: "PTS",
      },
    ];
    return cols;
  }, []);

  //HANDLERS

  return (
    <div className="row">
      <div className="col">
        <div className="global_shadow_border global_padding">
          <div className="d-flex align-items-center mb-2">
            <SetHeaderName name="WareHouse Logs" />
            {/* <div className="flex-fill">
              <h4 className="mb-0">Total Carton : 20</h4>
              <h4 className="mb-0">Penfing Carton : 10</h4>
            </div> */}
            <div></div>
          </div>
          <div className="row">
            <div className="col">
              <CustomTable
                columns={columns}
                data={processedProducts?.rows}
                reload={refetch}
                totalCount={processedProducts.total}
                loading={loading}
                serverPagination
                
                
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
