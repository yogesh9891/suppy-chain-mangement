"use client";
import Link from "next/link";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toastError, toastSuccess } from "@/utils/toast";
import { useNavigate } from "@/hooks/useNavigate";
import Select from "react-select";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import { useZodResolver } from "@/hooks/useZod";
import { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import SetHeaderName from "@/components/SetHeaderName";

import { useAddOrder } from "@/services/order.service";
import { BARCODE_TYPE, ORDER_STATUS, ROLES } from "@/common/constant.common";
import { useUser } from "@/services/user.service";
import { FaInfoCircle } from "react-icons/fa";
import { IBarCodesStock, useBarCodeWithProduct } from "@/services/barcode.service";
import { useAddInHouseProductOrder, useAddProductOrder } from "@/services/productOrder.service";
import { useCurrentRole } from "@/customhooks/useCurrentRole";
import {  getStockProduct, IProductStock, useProductStock } from "@/services/productStock.service";
export default function Page() {
  //IMPORTS
  const zodResolver: any = useZodResolver();
  const role = useCurrentRole();

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [isGst, setIsGst] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [gstNo, setGstNo] = useState("");
  const [productArr, setProductArr] = useState<IProductStock[]>([]);
  const [allProductArr, setAllProductArr] = useState<IProductStock[]>([]);
    const { mutateAsync } = useAddProductOrder();
  const { data: users } = useUser({ role: ROLES.STORE, storeId: "storeId" });
  const processedUsers = useProcessData(users);
  const [user, setUser] = useState({
    label: "Please Search User",
    value: "",
  });

  //STATES

  const [isMounted, setIsMounted] = useState(false);

  //HOOK_FORM
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setError,
    reset,
  } = useForm();

  //DATA

  useEffect(() => setIsMounted(true), []);


  const getProductStock = async (storId: string) => {
      setProductArr([]);
    const { data: res } = await getStockProduct(`pageSize=1000&pageIndex=0&orderedToId=${storId}`);
    if (res?.data) {
      setAllProductArr(res?.data);
    }
  }

  useEffect(() => {
    if (user && user?.value) {
          getProductStock(user?.value);
    }
  }, [user]);

  const onSubmit = async () => {
    try {
    

      // if (!productArr.every((el) => Number(el.price) >= Number(el.msp))) {
      //   toastError("Price must be More Than Msp");
      //   return 0;
      // }

      let obj: any = {
        orderedToId: user?.value,
        productsArr: productArr.map((el) => {
          let obj = {
            ...el,
            totalTax: Number(el.quantity) * Number(el.box) * Number(el.packet) * el?.price,
          };
          return obj;
        }),
        totalTax: parseFloat(calculateTotalTax()),
        subTotal: parseFloat(calculateTotal()),
        discountValue: 0,
        total: Number(calculateGrandTotal()),
      };
      console.log(obj);
      const res = await mutateAsync(obj);
      if (res.data.data) {
        toastSuccess(res.data.message);
      }
      navigate("/inhouse-order/" + res.data.data?._id);
      reset();
    } catch (error) {
      toastError(error);
    }
  };

  //STYLE
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
  const handleValueChange = (index: number, value: number, key: string) => {
    if (!(value < 0)) {
      let tempArr: any = productArr;
      tempArr[index][key] = value;
      setProductArr([...tempArr]);
    }
  };

  const calculateTotalQuantity = () => {
    return productArr.reduce((acc, el) => acc + Number(el.quantity), 0).toFixed(0);
  };

  const calculateTotalTax = () => {
    return productArr
      .reduce((acc, el) => acc + Number(el.quantity) * Number(el.box) * Number(el.packet) * el.price, 0)
      .toFixed(0);
  };

  const calculateTotal = () => {
    return productArr
      .reduce((acc, el) => acc + Number(el.quantity) * Number(el.box) * Number(el.packet) * el.price, 0)
      .toFixed(2);
  };
  const calculateGrandTotal = () => {
    return Math.round(
      productArr.reduce((acc, el) => acc + Number(el.quantity) * Number(el.box) * Number(el.packet) * el.price, 0),
    ).toFixed(2);
  };

  const calculateGst = (gtax: number, amount: number) => {
    return Number(Math.round((amount * gtax) / 100).toFixed(2));
  };

  const getNumberOfItemFromType = (obj: IBarCodesStock) => {
    if (obj.barCodeType == BARCODE_TYPE.CARTON) {
      return Number(obj.packet * obj.box);
    } else if (obj.barCodeType == BARCODE_TYPE.BOX) {
      return Number(obj.packet);
    } else {
      return 1;
    }
  };

  const [barcodeInput, setbarcodeInput] = useState("");
  // const handelBarCode = (e: any) => {
  //   if (e?.keyCode === 13) {
  //     let porductObj = processedProducts.rows.find((el) => el.barCode == barcodeInput);
  //     console.log(porductObj, "porductObjporductObjporductObjporductObjporductObjporductObj", barcodeInput);
  //     if (porductObj && porductObj?.barCode) {
  //       let porductBarIndex = productArr.findIndex((el) => el.barCode == barcodeInput);
  //       if (porductBarIndex > -1) {
  //         let tempArr = [...productArr];
  //         tempArr[porductBarIndex].quantity = tempArr[porductBarIndex].quantity + 1;
  //         setProductArr(tempArr);
  //       } else {
  //         let tempArr = [...productArr];
  //         tempArr.push({
  //           ...porductObj,
  //           quantity: 1,
  //           price: 0,
  //           gst: isGst ? porductObj.gst : 0,
  //         });
  //         setProductArr(tempArr);
  //       }

  //       setbarcodeInput("");
  //     }
  //   }
  // };
  return (
    <div className="row">
      <form className="col" onSubmit={handleSubmit(onSubmit)}>
        <div className="global_shadow_border global_padding">
          <SetHeaderName name="Add Inhouse Order" />
          <div className="row ">
            <div className="col">
              <div className="d-flex align-items-center">
                <div className="flex-fill">{/* <h4 className="mb-0">Add Product</h4> */}</div>
                <div>
                  <Link href={`/inhouse-order`} className="btn btn-maincolor">
                    View {role == ROLES.ADMIN ? "Branch" : "Inhouse"} Order
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">
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
                  Store
                </Form.Label>
                {isMounted && (
                  <Select
                    options={[
                      ...processedUsers.rows.map((el) => {
                        return {
                          ...el,
                          label: `${el.name} - ${el.storeName} - ${el.phone}`,
                          value: el?._id,
                        };
                      }),
                    ]}
                    styles={styling}
                    isClearable={false}
                    value={user}
                    onChange={(val: any) => {
                      if (val?.gstNo) {
                        setIsGst(true);
                      }

                      setUser(val);
                    }}
                  />
                )}
              </Form.Group>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-md-6">
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
                {isMounted && (
                  <Select
                    options={[
                      ...allProductArr.map((el) => {
                        return {
                          ...el,
                          label: el.name,
                          value: el?.productId,
                          prodcutId: el?.productId,
                          quantity: 0,
                          gst: isGst ? el.gst : 0,
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
            </div>
            <div className="col-md-12">
              <hr />
              <div className="row">
                <div className="col-12">
                  <h5 className="blue-1 m-0">Selected Product List</h5>
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col"> Packet X Box</th>
                        <th scope="col"> Total Packet Carton</th>
                        <th scope="col">No of Carton</th>
                        <th scope="col">Price</th>
                        <th scope="col">Total </th>
                      </tr>
                    </thead>
                    <tbody>
                      {productArr &&
                        productArr.length > 0 &&
                        productArr.map((el, index) => {
                          return (
                            <tr key={index}>
                              <th scope="row">{el.name}</th>
                              <td>
                                {Number(el?.packet)} X {Number(el?.box)}{" "}
                              </td>
                              <td> {Number(el?.packet) * Number(el?.box)}</td>

                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  onChange={(e) => handleValueChange(index, Number(e.target.value), "quantity")}
                                  value={el?.quantity}
                                />
                              </td>
                              <td>
                                {el.price}
                              </td>

                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={(
                                    Number(el.box) *
                                    Number(el.packet) *
                                    Number(el.quantity) *
                                    (Number(el?.price))
                                  ).toFixed(2)}
                                  disabled
                                />
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="col-8"></div>
            <div className="col-4" style={{ borderLeft: "solid 1px rgba(0,0,0,0.1)" }}>
              <h5 className="blue-1 m-0">Summary</h5>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Total Carton</th>
                    <th scope="col">{calculateTotalQuantity()}</th>
                  </tr>
                  <tr>
                    <th scope="col">Sub Total </th>
                    <th scope="col">{calculateTotal()}</th>
                  </tr>
                  <tr>
                    <th scope="col">TAX </th>
                    <th scope="col">{calculateTotalTax()}</th>
                  </tr>
                  <tr>
                    <th scope="col"> Total </th>
                    <th scope="col">{calculateGrandTotal()}</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="row mt-3">
              <div className="col">
                <button type="submit" className="btn btn-maincolor">
                  {!isSubmitting ? "Submit" : "Loading..."}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
