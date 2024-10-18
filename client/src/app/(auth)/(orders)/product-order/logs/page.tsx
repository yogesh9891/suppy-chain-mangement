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

export default function Page({ params }: { params: { id: string } }) {
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
        header: "Name",
        accessorFn: (row) => "5 CRYSTAL AA 500",
        id: "name",
      },
      {
        header: "carton Recevied",
        accessorFn: (row) => 10,
        id: "created",
      },
      {
        header: "Status",
        accessorFn: (row) => "23-07-2024",
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
            <SetHeaderName name="Sales Order" />
            <div className="flex-fill">{/* <h4 className="mb-0">{Item}</h4> */}</div>
            <div></div>
          </div>
          <div className="row">
            <div className="col">
              <CustomTable
                columns={columns}
                data={[1]}
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
