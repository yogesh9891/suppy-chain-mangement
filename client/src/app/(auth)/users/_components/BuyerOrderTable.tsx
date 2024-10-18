import { ORDER_STATUS, ROLES } from "@/common/constant.common";
import CustomModal from "@/components/CustomModal";
import CustomTable from "@/components/CustomTable";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { IProductSingle, useProduct } from "@/services/product.service";
import { IProductStock, useAddProductStock, useProductStock, useUpdateProductStock } from "@/services/productStock.service";
import { useProductOrder } from "@/services/productOrder.service";
import { toastError, toastSuccess } from "@/utils/toast";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import { GoPencil } from "react-icons/go";
import Select from 'react-select';
import { useCurrentRole } from "@/customhooks/useCurrentRole";
import { useProfile } from "@/services/user.service";
import { useBrand } from "@/services/brand.service";
import { useColor } from "@/services/color.service";
import { useSize } from "@/services/size.service";
// Define the shape of the options
interface OptionType {
  value: string;
  label: string;
}

function BuyerOrderTable({ userData }: { userData: any }) {
  //CONSTANT
  const userRole = userData?.role;
  const { data: profile } = useProfile();
  const [sizeArr, setSizeArr] = useState<any>([]);
  const [colorArr, setColorArr] = useState<any>([]);
  const [brandArr, setBrandArr] = useState<any>([]);


  //STATES - show, orderIdToUpdate
  const [show, setShow] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState<any>(null);
  const [showProducts, setShowProducts] = useState(false);
  //DATAS - Selling order
     const [query, setQuery] = useState("");
     const searchObj = useMemo(() => {
       let obj: any = {};
       obj.orderedToId = userData?._id;
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
     }, [userData,sizeArr,colorArr,brandArr]);
  
  const {
    data: sellingOrders,
    isFetching: ordersIsFetching,
    isLoading: orderLoadingStatus,
    refetch: refetchOrders,
  } = useProductStock(searchObj, false);







  const processedOrders = useProcessData(sellingOrders);
  const ordersIsLoading = useLoading(ordersIsFetching, orderLoadingStatus);
  const { data: products,refetch } = useProduct({ pageSize: 1000, pageIndex: 0 }, true);
  const processedProducts = useProcessData(products);
  const [productArr, setProductArr] = useState<IProductSingle[]>([]);

  const { mutateAsync: addStock } = useAddProductStock();
  const { mutateAsync: updateStock } = useUpdateProductStock();

  const { data: brands } = useBrand({ pageSize: 1000, pageIndex: 0 }, false);
  const processedBrandData = useProcessData(brands);

  const { data: colors } = useColor({ pageSize: 1000, pageIndex: 0 }, false);
  const processedColorData = useProcessData(colors);

  const { data: sizes } = useSize({ pageSize: 1000, pageIndex: 0 }, false);
  const processedSizeData = useProcessData(sizes);

  useEffect(() => {
    refetchOrders();
    refetch()
  }, [profile,sizeArr, colorArr, brandArr]);

  //TABLE COLUMNS - Selling-Order-Columns,
  const columns = useMemo(() => {
    let cols: ColumnDef<IProductStock>[] = [
      {
        header: "Name",
        accessorFn: (row: any) => row?.name,
        id: "buyerName",
      },
      // {
      //   header: "Total Stock",
      //   accessorFn: (row: any) => row?.totalItems,
      //   id: "total",
      // },
      {
        header: "Min Stock",
        cell: ({ row: { original: row } }: any) => {
          return (
            <input
              type="text"
              value={row?.minStock}
              disabled={
                !(
                  profile?.role == ROLES.ADMIN ||
                  (profile && profile?.role == ROLES.STORE && userData?._id == profile._id)
                )
              }
              onChange={(e) => updateMinStock(row?._id, Number(e.target.value))}
            />
          );
        },
        id: "total",
      },
      {
        header: "Stock In Hand",
        accessorFn: (row: any) => row.quantity ,
        id: "ltotal",
      },
      {
        header: "Transit Stock",
        accessorFn: (row: any) => row.totalTransitItems,
        id: "ttotal",
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
        header: "Order Stock",
        accessorFn: (row: any) =>
          Number(row?.totalTransitItems + row?.quantity) >= Number(row?.minStock)
            ? 0
            : Number(row?.minStock - (row?.totalTransitItems + row?.quantity)),
        id: "ototal",
      },
      // {
      //   header: "Status",
      //   accessorFn: (row) => row.orderStatus.currentStatus,
      //   id: "orderStatus",
      // },
      // {
      //   header: "",
      //   cell: ({ row: { original: row } }) => {
      //     return (
      //       <Link href={`/order/${row?._id}`}>
      //         <FaEye size={15} />
      //       </Link>
      //     );
      //   },
      //   id: "action1",
      // },
    ];
    return cols;
  }, []);

  //ACTION HANDLERS - updateOrder,
  // const handleModalShow = (order: IOrder) => {
  //   try {
  //     setOrderToUpdate(order);
  //     setShow(true);
  //   } catch (error) {
  //     toastError(error);
  //   }
  // };


    const updateMinStock = async (productId:string,stock:number) => {
      try {
        // if (!window.confirm(`Are you sure you want to update Order status to ${status} ?`)) return;

      console.log(stock, "stock", productId, "productIdproductId");
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
      const response = await addStock({ orderedToId: userData?._id, productArr });
      if (response?.data?.message) {
        toastSuccess(response?.data?.message);
        setShowProducts(false);
        setProductArr([])
        setOrderToUpdate(null);
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
    <div className="global_shadow_border global_padding">
      <div className="row">
        <div className="col">
          <div className="d-flex align-items-center mb-2">
            <div className="flex-fill d-flex">
              <h5 className="mb-0">Product Store: </h5>
            </div>
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
            {(profile?.role == ROLES.ADMIN || (profile && profile?.role == ROLES.STORE && userData?._id == profile._id)) && (
              <button className="btn btn-maincolor" onClick={() => setShowProducts(true)}>
                Add +
              </button>
            )}
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

          <Modal show={showProducts} onHide={() => setShowProducts(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Add Product</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="row mt-5">
                <div className="col-md-12">
                  <Form.Group className="mb-4 position-relative" controlId="name">
                    <Form.Label
                      style={{
                        position: "absolute",
                        zIndex: "1",
                        background: "#fff",
                        top: "-13px",
                        left: "12px",
                        padding: "0px 5px",
                      }}
                    >
                      Name
                    </Form.Label>
                    {showProducts && (
                      <Select
                        options={[
                          ...processedProducts.rows.map((el) => {
                            return {
                              ...el,
                              label: el.name,
                              value: el?._id,
                              productId: el?._id,
                            };
                          }),
                        ]}
                        styles={styling}
                        isClearable={false}
                        value={productArr}
                        isMulti
                        onChange={(val: any) => setProductArr(val)}
                      />
                    )}
                  </Form.Group>
                  <button type="submit" className="btn btn-maincolor" onClick={() => handleAdd()}>
                    Submit
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default BuyerOrderTable;
