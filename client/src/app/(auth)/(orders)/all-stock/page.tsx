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
import { PRODUCT_STATUS, ROLES } from "@/common/constant.common";
import { useBrand } from "@/services/brand.service";
import { useColor } from "@/services/color.service";
import { useSize } from "@/services/size.service";
import { ICompanyOrderLogs, useCompanyProductStock, useGetStockByProductId } from "@/services/companyOrder.service";

export default function Page() {
  const Item = "Product";
  const { data: profile } = useProfile();
  const role = useCurrentRole();

  const [sizeArr, setSizeArr] = useState<any>([]);
  const [colorArr, setColorArr] = useState<any>([]);
  const [brandArr, setBrandArr] = useState<any>([]);
  const [query, setQuery] = useState("");
  const [productId, setProductId] = useState("");

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
  } = useCompanyProductStock(searchObj, false);

  const { data: brands } = useBrand({ pageSize: 1000, pageIndex: 0 }, false);
  const processedBrandData = useProcessData(brands);

  const { data: colors } = useColor({ pageSize: 1000, pageIndex: 0 }, false);
  const processedColorData = useProcessData(colors);

  const { data: sizes } = useSize({ pageSize: 1000, pageIndex: 0 }, false);
  const processedSizeData = useProcessData(sizes);

  const processedOrders = useProcessData(sellingOrders);
  const ordersIsLoading = useLoading(ordersIsFetching, orderLoadingStatus);
  const [showProducts, setShowProducts] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  //MUTANTS
  const { data: productStocks, refetch } = useGetStockByProductId(productId, !!productId);

  const { data: productds } = useProduct({ pageSize: 1000, pageIndex: 1 }, true);
  const processedProducts = useProcessData(productds);
  const [productArr, setProductArr] = useState<IProductSingle[]>([]);


  const [orders, setOrders] = useState([]);

  //TABLE COLUMNS: Products
  const columns: ColumnDef<IProductStock>[] = [
    {
      header: "Name",
      accessorFn: (row) => row?.name,
      id: "SKU Code",
    },

    {
      header: "PO. Issued",
      accessorFn: (row: any) => row.totalQuantity,
      id: "total",
    },
    {
      header: "Received Order ",
      accessorFn: (row: any) => row.totalTransitItems,
      id: "ltotal",
    },
    {
      header: "Pending Order",
      accessorFn: (row: any) => Number(row?.totalQuantity - row?.totalTransitItems),
      id: "ttotal",
    },

    {
      header: "",
      cell: ({ row: { original: row } }: any) => {
        return (
          <>
            <FaEye size={15} onClick={() => handleGetStockByProductId(row?.productId)} />{" "}
            <Link role="button" href={`/all-stock/logs/${row?.productId}`}>
              <GoPencil />{" "}
            </Link>
          </>
        );   
      },
      id: "action",
    },


    // {
    //   header: "Excess Order Stock",
    //   accessorFn: (row: any) =>
    //     Number(row?.totalTransitItems + row?.quantity) >= Number(row?.minStock)
    //       ? Number(row?.totalTransitItems + row?.quantity - row?.minStock)
    //       : 0,
    //   id: "extotal",
    // },
    // {
    //   header: "Pending Order",
    //   accessorFn: (row: any) =>
    //     Number(row?.totalTransitItems + row?.quantity) >= Number(row?.minStock)
    //       ? 0
    //       : Number(row?.minStock - (row?.totalTransitItems + row?.quantity)),
    //   id: "ototal",
    // },

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

 

  const handleGetStockByProductId = async (stockId: string) => {
    setProductId(stockId);
    refetch()
    setShowOrders(true);
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
            <SetHeaderName name={`${role == ROLES.ADMIN ? "International" : "Branch"} Stock`} />
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

        <Modal show={showOrders} onHide={() => setShowOrders(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Orders</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-12">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col" style={{ background: "#3a5743", color: "#fff" }}></th>
                      <th scope="col" style={{ background: "#3a5743", color: "#fff" }}>
                        PO Id
                      </th>

                      <th scope="col" style={{ background: "#3a5743", color: "#fff" }}>
                        Recevied
                      </th>
                      <th scope="col" style={{ background: "#3a5743", color: "#fff" }}>
                        Remaining
                      </th>
                      <th scope="col" style={{ background: "#3a5743", color: "#fff" }}>
                        Status
                      </th>

                      <th scope="col" style={{ background: "#3a5743", color: "#fff" }}>
                        {" "}
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {productStocks &&
                      productStocks?.length > 0 &&
                      productStocks.map((order: ICompanyOrderLogs, innerIndex: number) => (
                        <tr key={innerIndex}>
                          <td></td>
                          <td>{order.name}</td>
                          <td>{order.quantity}</td>
                          <td>{order.previousQuantity}</td>
                          <td style={{ background:order.status ==PRODUCT_STATUS.CANCELLED ? "red" :""}}>{order.status}</td>
                          <td>{new Date(order.createdAt).toDateString()}</td>
                        </tr>
                      ))}
                    {/* <tr>
                                          <td></td>
                                          <td>Total Quantity</td>
                                          <td>{el.quantity}</td>
                                          <td>Remainig Quantity</td>
                                          <td>{el.quantity}</td>
                                        </tr> */}
                  </tbody>
                </table>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
