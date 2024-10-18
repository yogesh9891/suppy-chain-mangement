"use client";
import Link from "next/link";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import CustomTable from "@/components/CustomTable";
import SetHeaderName from "@/components/SetHeaderName";
import { IProduct, IProductSingle, useProduct, useUpdateProductIsFocused } from "@/services/product.service";
import { toastError, toastSuccess } from "@/utils/toast";
import { GoPencil, GoTrash } from "react-icons/go";
import { FaEye } from "react-icons/fa";
import { useProfile } from "@/services/user.service";
import {
  useAddProductStock,
  useUpdateProductStock,
  IProductStock,
  useProductStock,
  useDeleteStock,
} from "@/services/productStock.service";
import { Form, Modal } from "react-bootstrap";
import Select from "react-select";
import { useCurrentRole } from "@/customhooks/useCurrentRole";
import { ROLES } from "@/common/constant.common";
import { useBrand } from "@/services/brand.service";
import { useColor } from "@/services/color.service";
import { useSize } from "@/services/size.service";

export default function Page() {
  const Item = "Product";
  const { data: profile } = useProfile();
  const role = useCurrentRole();

  const [sizeArr, setSizeArr] = useState<any>([]);
  const [colorArr, setColorArr] = useState<any>([]);
  const [brandArr, setBrandArr] = useState<any>([]);
  const [query, setQuery] = useState("");
  const searchObj = useMemo(() => {
    let obj: any = { stock: "all" };
    obj.orderedToId = profile?._id;
    obj.pageSize = 10;
    if (sizeArr && sizeArr?.length > 0) {
      obj.size = sizeArr.map((item: any) => item.value);
    }
    if (colorArr && colorArr?.length > 0) {
      obj.color = colorArr.map((item: any) => item.value);
    }
    if (brandArr && brandArr?.length > 0) {
      obj.brand = brandArr.map((item: any) => item.value);
    }
    return obj;
  }, [profile, sizeArr, colorArr, brandArr]);

  //DATA Products
  const {
    data: sellingOrders,
    isFetching: ordersIsFetching,
    isLoading: orderLoadingStatus,
    refetch: refetchOrders,
  } = useProductStock(searchObj, false);

  const { data: brands } = useBrand({ pageSize: 1000, pageIndex: 0 }, false);
  const processedBrandData = useProcessData(brands);

  const { data: colors } = useColor({ pageSize: 1000, pageIndex: 0 }, false);
  const processedColorData = useProcessData(colors);

  const { data: sizes } = useSize({ pageSize: 1000, pageIndex: 0 }, false);
  const processedSizeData = useProcessData(sizes);

  const processedOrders = useProcessData(sellingOrders);
  const ordersIsLoading = useLoading(ordersIsFetching, orderLoadingStatus);
  const [showProducts, setShowProducts] = useState(false);

  //MUTANTS
  const { mutateAsync: updateProductIsFocused } = useUpdateProductIsFocused();

  const [productArr, setProductArr] = useState<IProductSingle[]>([]);

  const { mutateAsync: addStock } = useAddProductStock();
  const { mutateAsync: updateStock } = useUpdateProductStock();
  const { mutateAsync: deleteStock } = useDeleteStock();

  //TABLE COLUMNS: Products
  const columns: ColumnDef<IProductStock>[] = [
    {
      header: "Name",
      accessorFn: (row) => row?.name,
      id: "SKU Code",
    },
    ...(role != ROLES.ADMIN
      ? [
          {
            header: "Min Stock",
            cell: ({ row: { original: row } }: any) => {
              return (
                <input
                  type="text"
                  value={row?.minStock}
                  onChange={(e) => updateMinStock(row?._id, Number(e.target.value))}
                />
              );
            },
            id: "total",
          },
          {
            header: "Pending Order",
            accessorFn: (row: any) => row.quantity,
            id: "ltotal",
          },
          {
            header: "Excess Order Stock",
            accessorFn: (row: any) =>
              Number(row?.totalTransitItems + row?.quantity) >= Number(row?.minStock)
                ? Number(row?.totalTransitItems + row?.quantity - row?.minStock)
                : 0,
            id: "extotal",
          },
          {
            header: "Final Order Stock",
            accessorFn: (row: any) =>
              Number(row?.totalTransitItems + row?.quantity) >= Number(row?.minStock)
                ? 0
                : Number(row?.minStock - (row?.totalTransitItems + row?.quantity)),
            id: "ototal",
          },
        ]
      : [
          {
            header: "Order Stock",
            accessorFn: (row: any) => row.orderStock,
            id: "total",
          },
          {
            header: "Pending Order",
            accessorFn: (row: any) => row.stock,
            id: "ltotal",
          },
          {
            header: "Excess Order Stock",
            accessorFn: (row: any) =>
              Number(row?.stock) > Number(row?.orderStock) ? Number(row?.orderStock - row?.stock) : 0,
            id: "extotal",
          },
          {
            header: "Final Order Stock",
            accessorFn: (row: any) =>
              Number(row?.stock) >= Number(row?.orderStock) ? 0 : Number(row?.orderStock - row?.stock),
            id: "ototal",
          },
          
        ]),

    // {
    //   header: "",
    //   cell: ({ row: { original: row } }) => {
    //     return (
    //       <div role="button" onClick={() => handleDeleteStock(row?._id)}>
    //         <GoTrash color="red" size={15} />
    //       </div>
    //     );
    //   },
    //   id: "action1",
    // },
    //   {
    //     header: "",
    //     cell: ({ row: { original: row } }) => {
    //       return (
    //         <Link role="button" href={`/product/update?id=${row?._id}`}>
    //           <GoPencil />
    //         </Link>
    //       );
    //     },
    //     id: "action",
    //   },
    //   {
    //     header: "",
    //     cell: ({ row: { original: row } }) => {
    //       return (
    //         <Link href={`/order/${row?._id}`}>
    //           <FaEye size={15} />
    //         </Link>
    //       );
    //     },
    //     id: "action1",
    //   },
  ];

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

  const updateMinStock = async (productId: string, stock: number) => {
    try {
      // if (!window.confirm(`Are you sure you want to update Order status to ${status} ?`)) return;

      console.log(stock, "stock");
      const response = await updateStock({ productStockId: productId, minStock: stock });
      // if (response?.data?.message) {
      //   toastSuccess(response?.data?.message);
      // }
    } catch (error) {
      toastError(error);
    }
  };

  const handleAdd = async () => {
    try {
      if (!productArr) {
        toastError("Please Select Product");
        return 0;
      }
      const response = await addStock({ orderedToId: profile?._id, productArr });
      if (response?.data?.message) {
        toastSuccess(response?.data?.message);
        setShowProducts(false);
        setProductArr([]);
      }
    } catch (error) {
      toastError(error);
    }
  };

  const handleDeleteStock = async (stockId: string) => {
    try {
      if (!stockId) return;

      if (!window.confirm("Are you sure you want to delete this stock ? ")) return;

      const res = await deleteStock(stockId);
      if (res.data?.message) {
        toastSuccess(res.data?.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  const styling = {
    control: (base: any) => ({
      ...base,
      border: "1px solid #D9D9D9 !important",
      boxShadow: "0 !important",
      position: "relative",
      padding: "6px 10px !important",

      "&:hover": {
        border: "1px solid #D9D9D9 !important",
      },
    }),

    option: (base: any, { isFocused, isSelected }: any) => ({
      ...base,
      color: "#09021C !important",
      fontSize: "14px !important",
      fontWeight: "400 !important",
      background: isFocused
        ? "rgba(237, 237, 237, 1) !important"
        : isSelected
          ? "rgba(237, 237, 237, 1) !important"
          : "white",
      cursor: "pointer !important",
    }),

    menu: (base: any) => ({
      ...base,
      zIndex: "2 !important",
      position: "absolute !important",
    }),
  };

  return (
    <div className="row">
      <div className="col">
        <div className="global_shadow_border global_padding">
          <div className="d-flex align-items-center mb-2">
            <SetHeaderName name={`${role == ROLES.ADMIN ? "Header Office" : "Branch"} Stock`} />
            <div className="flex-fill d-flex ">
              <h5 className="mt-2 me-4">Size: </h5>
              <Select
                instanceId={"sizeId"}
                options={processedSizeData.rows.map((el) => ({ label: el.name, value: el._id }))}
                isSearchable={true}
                isLoading={processedSizeData.rows.length === 0}
                isMulti
                value={sizeArr}
                onChange={(val) => setSizeArr(val)}
              />
            </div>

            <div className="flex-fill d-flex ">
              <h5 className="mt-2 me-4">Color: </h5>
              <Select
                instanceId={"colorId"}
                options={processedColorData.rows.map((el) => ({ label: el.name, value: el._id }))}
                isSearchable={true}
                isLoading={processedColorData.rows.length === 0}
                isMulti
                value={colorArr}
                onChange={(val) => setColorArr(val)}
              />
            </div>
            <div className="flex-fill d-flex ">
              <h5 className="mt-2 me-4">Brand: </h5>
              <Select
                instanceId={"brandId"}
                options={processedBrandData.rows.map((el) => ({ label: el.name, value: el._id }))}
                isSearchable={true}
                isLoading={processedBrandData.rows.length === 0}
                isMulti
                value={brandArr}
                onChange={(val) => setBrandArr(val)}
              />
            </div>
            <div>
              {role != ROLES.ADMIN && (
                <button className="btn btn-maincolor" onClick={() => setShowProducts(true)}>
                  Add +
                </button>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col">
              <CustomTable
                columns={columns}
                data={processedOrders.rows}
                reload={refetchOrders}
                totalCount={processedOrders.total}
                loading={ordersIsLoading}
                serverPagination
                
                
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
