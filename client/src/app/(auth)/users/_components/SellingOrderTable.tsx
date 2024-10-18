import { ORDER_STATUS, ROLES } from "@/common/constant.common";
import CustomModal from "@/components/CustomModal";
import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { IOrder, useOrder, useUpdateOrder } from "@/services/order.service";
import { toastError, toastSuccess } from "@/utils/toast";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import { GoPencil } from "react-icons/go";

function SellingOrdersTable({ userData }: { userData: any }) {
  //CONSTANT
  const userRole = userData?.role;

  //STATES - show, orderIdToUpdate
  const [show, setShow] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState<any>(null);

  //DATAS - Selling order
  const {
    data: sellingOrders,
    isFetching: ordersIsFetching,
    isLoading: orderLoadingStatus,
    refetch: refetchOrders,
  } = useOrder({ storeId: userData?._id }, false);
  const processedOrders = useProcessData(sellingOrders);
  const ordersIsLoading = useLoading(ordersIsFetching, orderLoadingStatus);

  //TABLE COLUMNS - Selling-Order-Columns,
  const columns = useMemo(() => {
    let cols: ColumnDef<IOrder>[] = [
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
        header: "Buyer",
        accessorFn: (row: any) => row?.buyerDetails?.name,
        id: "buyerName",
      },
      {
        header: "Total",
        accessorFn: (row: any) => row?.total,
        id: "total",
      },

      {
        header: "Status",
        accessorFn: (row) => row.orderStatus.currentStatus,
        id: "orderStatus",
      },
      {
        header: "",
        cell: ({ row: { original: row } }) => {
          return (
            <Link href={`/order/${row?._id}`}>
              <FaEye size={15} />
            </Link>
          );
        },
        id: "action1",
      },
    ];
    return cols;
  }, []);

  //ACTION HANDLERS - updateOrder,
  const handleModalShow = (order: IOrder) => {
    try {
      setOrderToUpdate(order);
      setShow(true);
    } catch (error) {
      toastError(error);
    }
  };

  const { mutateAsync } = useUpdateOrder();

  const handleUpdate = async (status: string) => {
    try {
      if (!window.confirm(`Are you sure you want to update Order status to ${status} ?`)) return;
      const response = await mutateAsync({ id: orderToUpdate?._id, status });
      if (response?.data?.message) {
        toastSuccess(response?.data?.message);
        setShow(false);
        setOrderToUpdate(null);
      }
    } catch (error) {
      toastError(error);
    }
  };
  return (
    <div className="global_shadow_border global_padding">
      <div className="row">
        <div className="col">
          <div className="d-flex align-items-center mb-2">
            <div className="flex-fill d-flex">
              <h5 className="mb-0">Selling Orders: </h5>
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

export default SellingOrdersTable;
