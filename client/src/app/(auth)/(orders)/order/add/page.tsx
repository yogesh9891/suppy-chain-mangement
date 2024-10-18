"use client";
import Link from "next/link";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toastError, toastSuccess } from "@/utils/toast";
import { useNavigate } from "@/hooks/useNavigate";
import Select from "react-select";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import { useZodResolver } from "@/hooks/useZod";

import { IProductSingle, PartialProduct, useAddProduct, useProduct } from "@/services/product.service";
import { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import SetHeaderName from "@/components/SetHeaderName";
import { HiOutlinePhotograph } from "react-icons/hi";
import Image from "next/image";
import { useAttribute, useGetAttributeWithValue } from "@/services/attribute.service";
import { IProductStock, useAddProductOrder, useProductStock } from "@/services/productOrder.service";
import { useAddOrder } from "@/services/order.service";
import { BARCODE_TYPE, ORDER_STATUS, ROLES } from "@/common/constant.common";
import { useUser } from "@/services/user.service";
import { FaInfoCircle } from "react-icons/fa";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { getBarCodeWithProduct, IBarCodesStock, useBarCodeWithProduct } from "@/services/barcode.service";
export default function Page() {
  //IMPORTS
  const zodResolver: any = useZodResolver();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [isGst, setIsGst] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [gstNo, setGstNo] = useState("");
  const [productArr, setProductArr] = useState<IBarCodesStock[]>([]);
    const [allProductArr, setAllProductArr] = useState<IBarCodesStock[]>([]);
  const { mutateAsync } = useAddOrder();
  const { data: users } = useUser({ role: ROLES.USER, storeId: "storeId" });
  const processedUsers = useProcessData(users);

    const { data: stores } = useUser({ role: ROLES.STORE, storeId: "storeId" });
    const processedStores = useProcessData(stores);



  const [user, setUser] = useState({
    label: "Please Search User",
    value: "",
  });

   const [store, setStore] = useState({
     label: "Please Search Store",
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
    getValues,
    setError,
    reset,
  } = useForm();

  //DATA
  const { data: products } = useBarCodeWithProduct({ pageSize: 1000, pageIndex: 0 }, true);
  const processedProducts = useProcessData(products);
  useEffect(() => setIsMounted(true), []);

    const getProductStock = async (storeId: string) => {
      setProductArr([]);
      const { data: res } = await getBarCodeWithProduct({ pageSize: 1000, pageIndex: 0 }, { storeId });
      if (res?.data) {
        setAllProductArr(res?.data);
      }
    };

    useEffect(() => {
      if (store && store?.value) {
        getProductStock(store?.value);
      }
    }, [store]);

  const onSubmit = async () => {
    try {
      if (isUser && user?.value == "") {
        if (!name || name == "") {
          toastError("Please Enter Your Name");
          return 0;
        }

        if (!email || email == "") {
          toastError("Please Enter Your Email");

          return 0;
        }

        if (!phone || phone == "") {
          toastError("Please Enter Your phone");
          return 0;
        }

        if (isGst && gstNo == "") {
          toastError("Please Enter Your Gst No");
          return 0;
        }
      }
      if (!isUser && user?.value == "") {
             toastError("Please Select User");
             return 0;
      }
      
       if (store?.value == "") {
         toastError("Please Select Store");
         return 0;
       }
      if (!productArr || productArr?.length == 0) {
           toastError("Please Select Product");
           return 0;
      }



        
      if (!productArr.every((el) => Number(el.sellingPrice) >= Number(el.msp))) {
        toastError("Price must be More Than Msp");
        return 0;
      }

      let obj: any = {
        name,
        phone,
        email,
        storeName,
        gstNo,
        address,
        userId: user?.value,
        storeId: store?.value,
        status:ORDER_STATUS.ACCEPTED,
        productsArr: productArr.map((el) => {
          let obj = {
            ...el,
            totalQunatity: Number(el?.quantity) * getNumberOfItemFromType(el),
            subTotal:
              (Number(el?.sellingPrice) + calculateGst(Number(isGst ? el?.gst : 0), el?.sellingPrice)) *
              Number(el.quantity) *
              getNumberOfItemFromType(el),
          };
          return obj;
        }),
        subTotal: parseFloat(calculateTotal()),
        totalItem: parseFloat(calculateTotalQuantity()),
        totalTax: parseFloat(calculateTotalTax()),
        discountValue: 0,
        total: Number(calculateGrandTotal()),
      };
      console.log(obj);
      const res = await mutateAsync(obj);
      if (res.data.data) {
        toastSuccess(res.data.message);
      }
      navigate("/order/" + res.data.data?._id);
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
      .reduce(
        (acc, el) =>
          acc +
          Number(el.quantity) *
            getNumberOfItemFromType(el) *
            calculateGst(Number(isGst ? el?.gst : 0), el?.sellingPrice),
        0,
      )
      .toFixed(0);
  };

  const calculateTotal = () => {
    return productArr
      .reduce((acc, el) => acc + Number(el.quantity) * getNumberOfItemFromType(el) * Number(el?.sellingPrice), 0)
      .toFixed(2);
  };
  const calculateGrandTotal = () => {
    return Math.round(
      productArr.reduce(
        (acc, el) =>
          acc +
          Number(el.quantity) *
            getNumberOfItemFromType(el) *
            (Number(el?.sellingPrice) + calculateGst(Number(isGst ? el?.gst : 0), el?.sellingPrice)),
        0,
      ),
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
  const handelBarCode = (e: any) => {
    if (e?.keyCode === 13) {
      let porductObj = processedProducts.rows.find((el) => el.barCode == barcodeInput);
      console.log(porductObj, "porductObjporductObjporductObjporductObjporductObjporductObj", barcodeInput);
      if (porductObj && porductObj?.barCode) {
        let porductBarIndex = productArr.findIndex((el) => el.barCode == barcodeInput);
        if (porductBarIndex > -1) {
          let tempArr = [...productArr];
          tempArr[porductBarIndex].quantity = tempArr[porductBarIndex].quantity + 1;
          setProductArr(tempArr);
        } else {
          let tempArr = [...productArr];
          tempArr.push({
            ...porductObj,
            quantity: 1,
            sellingPrice: 0,
            gst: isGst ? porductObj.gst : 0,
          });
          setProductArr(tempArr);
        }

        setbarcodeInput("");
      }
    }
  };
  return (
    <div className="row">
      <form className="col">
        <div className="global_shadow_border global_padding">
          <SetHeaderName name="Add Sales Order" />
          <div className="row ">
            <div className="col">
              <div className="d-flex align-items-center">
                <div className="flex-fill">{/* <h4 className="mb-0">Add Product</h4> */}</div>
                <div>
                  <Link href={`/order`} className="btn btn-maincolor">
                    View Sales Order
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
                  User
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

            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-maincolor"
                onClick={() => {
                  setIsUser(!isUser);
                  setProductArr([]);
                }}
              >
                Create
              </button>
            </div>
            {isUser && (
              <>
                <div className="col-md-4">
                  <label>Name</label>
                  <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label>Phone</label>
                  <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label>Email</label>
                  <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="col-md-4">
                  <label>Company Name</label>
                  <input className="form-control" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                </div>

                <div className="col-md-4">
                  <label>Address</label>
                  <input className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label>
                    Is Gst Applicable &nbsp;&nbsp;&nbsp;
                    <input checked={isGst} type="checkbox" onChange={(e) => setIsGst(!isGst)} />
                  </label>
                  {isGst && (
                    <input
                      className="form-control"
                      value={gstNo}
                      type="text"
                      placeholder="Enter Gst No."
                      onChange={(e) => setGstNo(e.target.value)}
                    />
                  )}
                </div>
              </>
            )}
            <div className="col-md-8 mt-5">
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
                      ...processedStores.rows.map((el) => {
                        return {
                          ...el,
                          label: `${el.name} - ${el.storeName} - ${el.phone}`,
                          value: el?._id,
                        };
                      }),
                    ]}
                    styles={styling}
                    isClearable={false}
                    value={store}
                    onChange={(val: any) => {
                      setStore(val);
                    }}
                  />
                )}
              </Form.Group>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-md-6">
              <input
                type="text"
                autoFocus
                className="form-control"
                value={barcodeInput}
                onChange={(e) => setbarcodeInput(e.target.value)}
                onKeyUp={(e) => handelBarCode(e)}
              />
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
                          label: el.name + " - " + el.barCodeType,
                          value: el?.barCode,
                          prodcutId: el?.productId,
                          quantity: 0,
                          sellingPrice: 0,
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
                        <th scope="col"> No of Item</th>
                        <th scope="col"> Price</th>
                        <th scope="col"> GST</th>
                        <th scope="col">Quantity</th>
                        <th scope="col"> Tax</th>

                        <th scope="col">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productArr &&
                        productArr.length > 0 &&
                        productArr.map((el, index) => {
                          return (
                            <tr key={index}>
                              <th scope="row">
                                {el.name} - {el.barCodeType}
                                <span className="pricepopover">
                                  {" "}
                                  <FaInfoCircle />
                                  <span>(MSP -{el.msp})</span>
                                </span>
                              </th>
                              <td>{getNumberOfItemFromType(el)}</td>

                              <td>
                                {" "}
                                <input
                                  type="number"
                                  className="form-control"
                                  onChange={(e) => handleValueChange(index, Number(e.target.value), "sellingPrice")}
                                  value={el?.sellingPrice}
                                />
                              </td>
                              <td>{el.gst}</td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  onChange={(e) => handleValueChange(index, Number(e.target.value), "quantity")}
                                  value={el?.quantity}
                                />
                              </td>
                              <td>
                                {calculateGst(Number(isGst ? el?.gst : 0), el?.sellingPrice) *
                                  Number(el?.quantity) *
                                  getNumberOfItemFromType(el)}
                              </td>

                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={
                                    (Number(el?.sellingPrice) +
                                      calculateGst(Number(isGst ? el?.gst : 0), el?.sellingPrice)) *
                                    Number(el.quantity) *
                                    getNumberOfItemFromType(el)
                                  }
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
                    <th scope="col">Total Item</th>
                    <th scope="col">{calculateTotalQuantity()}</th>
                  </tr>
                  <tr>
                    <th scope="col">Total Tax</th>
                    <th scope="col">{calculateTotalTax()}</th>
                  </tr>
                  <tr>
                    <th scope="col">Sub Total </th>
                    <th scope="col">{calculateTotal()}</th>
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
                <button type="button" className="btn btn-maincolor" onClick={() => onSubmit()}>
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
