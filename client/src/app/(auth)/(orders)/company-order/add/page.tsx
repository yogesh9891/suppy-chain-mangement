"use client";
import Link from "next/link";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toastError, toastSuccess } from "@/utils/toast";
import { useNavigate } from "@/hooks/useNavigate";
import Select from "react-select";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import { useZodResolver } from "@/hooks/useZod";
import ErrorMessage from "@/components/ErrorMessage";
import { useCompany } from "@/services/company.service";
import { useCategory, useNestedCategory } from "@/services/category.service";
import { useBrand } from "@/services/brand.service";
import {
  IProductSingle,
  PartialProduct,
  useAddProduct,
  useProduct,
  useGetProductWithAttribute,
} from "@/services/product.service";
import { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import SetHeaderName from "@/components/SetHeaderName";
import { HiOutlinePhotograph } from "react-icons/hi";
import Image from "next/image";
import { useAttribute, useGetAttributeWithValue } from "@/services/attribute.service";
import { useAddCompanyOrder } from "@/services/companyOrder.service";
import { useUser } from "@/services/user.service";
import { ORDER_STATUS, ROLES } from "@/common/constant.common";

export default function Page() {
  //IMPORTS
  const zodResolver: any = useZodResolver();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [ordernName, setOrderName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [isGst, setIsGst] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [gstNo, setGstNo] = useState("");
  const [productArr, setProductArr] = useState<IProductSingle[]>([]);
  const { mutateAsync } = useAddCompanyOrder();
  const { data: users } = useUser({ role: ROLES.VENDOR,isVendor:true });
  const processedUsers = useProcessData(users);
  const [user, setUser] = useState({
    label: "Please Search User",
    value: "",
  });
  //STATES

  const [isMounted, setIsMounted] = useState(false);

  //REF
  const imageErr = useRef<any>();
  const thumbnailErr = useRef<any>();

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
  const { data: products } = useProduct({ pageSize: 1000, pageIndex: 0 }, true);
  const processedProducts = useProcessData(products);
  useEffect(() => setIsMounted(true), []);

  const onSubmit = async () => {
    try {
      if (user?.value == "") {
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

        // if (isGst && gstNo == "") {
        //   toastError("Please Enter Your Gst No");
        //   return 0;
        // }
      }
      let obj: any = {
        name,
        phone,
        email,
        storeName,
        gstNo,
        address,
        ordernName,
        userId: user?.value,
        role: ROLES.VENDOR,
        status: ORDER_STATUS.TRANSIT,
        productsArr: productArr.map((el) => {
          let obj = {
            ...el,
            totalTax:
              Number(el.quantity) *
              Number(el.box) *
              Number(el.packet) *
              calculateGst(Number(isGst ? el?.gst : 0), el?.price),
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
      navigate("/company-order");
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

  const calculateTotal = () => {
    return productArr
      .reduce(
        (acc, el) =>
          acc +
          Number(el.quantity) *
            Number(el.box) *
            Number(el.packet) *
            (Number(el?.price) + calculateGst(Number(isGst ? el?.gst : 0), el?.price)),
        0,
      )
      .toFixed(2);
  };
  const calculateGrandTotal = () => {
    return Math.round(
      productArr.reduce(
        (acc, el) =>
          acc +
          Number(el.quantity) *
            Number(el.box) *
            Number(el.packet) *
            (Number(el?.price) + calculateGst(Number(isGst ? el?.gst : 0), el?.price)),
        0,
      ),
    ).toFixed(2);
  };

  const calculateGst = (gtax: number, amount: number) => {
    return Number(Math.round((amount * gtax) / 100).toFixed(2));
  };

  const calculateTotalTax = () => {
    return productArr
      .reduce(
        (acc, el) =>
          acc +
          Number(el.quantity) *
            Number(el.box) *
            Number(el.packet) *
            calculateGst(Number(isGst ? el?.gst : 0), el?.price),
        0,
      )
      .toFixed(0);
  };
  return (
    <div className="row">
      <form className="col" onSubmit={handleSubmit(onSubmit)}>
        <div className="global_shadow_border global_padding">
          <SetHeaderName name="Add Product" />
          <div className="row ">
            <div className="col">
              <div className="d-flex align-items-center">
                <div className="flex-fill">{/* <h4 className="mb-0">Add Product</h4> */}</div>
                <div>
                  <Link href={`/product-order`} className="btn btn-maincolor">
                    View Purchased Order
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
                      } else {
                        setIsGst(false);
                      }
                      console.log(val?.gstNo, "dsfsdfsfdfsd");

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
                    <input
                      checked={isGst}
                      type="checkbox"
                      onChange={(e) => {
                        setIsGst(!isGst);
                        setProductArr([]);
                      }}
                    />
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
          </div>
          <div className="row mt-5">
            <div className="col-md-4">
              <label>Order Name</label>
              <input className="form-control" value={ordernName} onChange={(e) => setOrderName(e.target.value)} />
            </div>
            <div className="col-md-12 mt-3">
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
                  Product Name
                </Form.Label>
                {isMounted && (
                  <Select
                    options={[
                      ...processedProducts.rows.map((el) => {
                        return {
                          ...el,
                          label: el.name,
                          value: el?._id,
                          productId: el?._id,
                          quantity: "",
                          price: "",
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
                                <input
                                  type="number"
                                  className="form-control"
                                  onChange={(e) => handleValueChange(index, Number(e.target.value), "price")}
                                  value={el?.price}
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
                  {/* <tr>
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
                  </tr> */}
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
