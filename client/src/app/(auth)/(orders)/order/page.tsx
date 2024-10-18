"use client";
import Link from "next/link";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import CustomTable from "@/components/CustomTable";
import SetHeaderName from "@/components/SetHeaderName";
import { IProduct, useProduct, useUpdateProductIsFocused } from "@/services/product.service";
import { toastError, toastSuccess } from "@/utils/toast";
import { GoPencil } from "react-icons/go";
import { FaEye } from "react-icons/fa";
import { IProductOrder, useProductOrder } from "@/services/productOrder.service";
import { IOrder, useOrder } from "@/services/order.service";

export default function Page() {
  const Item = "Product";

  //DATA Products
  const { data: products, isFetching, isLoading, refetch } = useOrder({}, true);
  const processedProducts = useProcessData(products);
  const loading = useLoading(isFetching, isLoading);

  //MUTANTS
  const { mutateAsync: updateProductIsFocused } = useUpdateProductIsFocused();

  //TABLE COLUMNS: Products
  const columns = useMemo(() => {
    let cols: ColumnDef<IOrder>[] = [
      {
        header: "OrderId",
        accessorFn: (row) => row?._id,
        id: "SKU Code",
      },
      {
        header: "Total",
        accessorFn: (row) => row?.total,
        id: "name",
      },
      {
        header: "createdBy",
        accessorFn: (row) => row?.createdBy.name,
        id: "created",
      },
      {
        header: "Status",
        accessorFn: (row) => row?.orderStatus.currentStatus,
        id: "PTS",
      },

      // {
      //   header: "",
      //   cell: ({ row: { original: row } }) => {
      //     return (
      //       <Link role="button" href={`/product/update?id=${row?._id}`}>
      //         <GoPencil />
      //       </Link>
      //     );
      //   },
      //   id: "action",
      // },
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

  //HANDLERS
  const handleIsFocuseToggle = async (productId: string, e: any) => {
    try {
      const res = await updateProductIsFocused({ productId, isFocused: e.target.checked });
      if (res?.data) {
        toastSuccess(res.data.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <div className="row">
      <div className="col">
        <div className="global_shadow_border global_padding">
          <div className="d-flex align-items-center mb-2">
            <SetHeaderName name="Sales Order" />
            <div className="flex-fill">{/* <h4 className="mb-0">{Item}</h4> */}</div>
            <div>
              <Link href={`/order/add`} className="btn btn-maincolor">
                Add Sales
              </Link>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <CustomTable
                columns={columns}
                data={processedProducts.rows}
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
