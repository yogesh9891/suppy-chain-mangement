"use client";
import Link from "next/link";
import { Controller,  SubmitHandler, useForm } from "react-hook-form";
import { toastError, toastSuccess } from "@/utils/toast";
import { useNavigate } from "@/hooks/useNavigate";
import Select from "react-select";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import { useZodResolver } from "@/hooks/useZod";
import ErrorMessage from "@/components/ErrorMessage";
import { useCompany } from "@/services/company.service";
import { useCategory, useNestedCategory } from "@/services/category.service";
import { useBrand } from "@/services/brand.service";
import { IProductSingle, PartialProduct, useAddProduct, useProduct } from "@/services/product.service";
import React, { useEffect, useRef, useState } from "react";
import SetHeaderName from "@/components/SetHeaderName";
import { ICompanyOrderLogs, useAddCompanyOrder, useAddProductCompanyOrder, useCompanyOrderById, useUpdateCompanyOrder, useUpdateCompanyStatus } from "@/services/companyOrder.service";
import { useSearchParams } from "next/navigation";
import { useCurrentRole } from "@/customhooks/useCurrentRole";
import { ORDER_STATUS, PRODUCT_STATUS, ROLES } from "@/common/constant.common";
import { GoEye } from "react-icons/go";
import { FaPencil } from "react-icons/fa6";
import { Modal,Form } from "react-bootstrap";



type ProductType = {
  productId: string;
  price: number;
  msp: number;
  gst: number;
  barCode: string;
  totalItemInCarton: number;
  box: number;
  packet: number;
  quantity: number;
  totalTax: number;
  name: string;

};
export default function Page({ params }: { params: { id: string } }) {
  const orderId = params.id;
  const role = useCurrentRole();
  const [status, setStatus] = useState(`${PRODUCT_STATUS.TRANSIT}`);
  const navigate = useNavigate();
  const [showIndex, setShowIndex] = useState(-1);
  const [quantity, setQuantity] = useState(0);

  const [showProducts, setShowProducts] = useState(false);
  const [showWareHouse, setshowWareHouse] = useState(false);
  const [productArr, setProductArr] = useState<any[]>([]);
  const [productObj, setProductObj] = useState<ProductType | null>(null);

  const { data: products } = useProduct({ pageSize: 1000, pageIndex: 0 }, true);
  const processedProducts = useProcessData(products);

  const { mutateAsync } = useUpdateCompanyOrder();
  const { mutateAsync: addProductCompanyOrder } = useAddProductCompanyOrder();
  const { mutateAsync: updateStatus } = useUpdateCompanyStatus();

  const { data }: any = useCompanyOrderById(orderId, !!orderId);

  useEffect(() => {
    if (data?.orderStatus?.currentStatus) {
      setStatus(data?.orderStatus?.currentStatus);
    }
  }, [data]);

  const calculateTotalQuantity = () => {
    return data?.productsArr.reduce((acc: number, el: { quantity: any }) => acc + Number(el.quantity), 0).toFixed(0);
  };

  const calculateTotal = () => {
    return data?.productsArr
      .reduce(
        (acc: number, el: { quantity: any; box: any; packet: any; price: number; gst: any }) =>
          acc + Number(el.quantity) * Number(el.box) * Number(el.packet) * Number(el?.price),
        0,
      )
      .toFixed(2);
  };
  const calculateGrandTotal = () => {
    return Math.round(
      data?.productsArr.reduce(
        (acc: number, el: { quantity: any; box: any; packet: any; price: number; gst: any }) =>
          acc +
          Number(el.quantity) *
            Number(el.box) *
            Number(el.packet) *
            (Number(el?.price) + calculateGst(Number(el?.gst ? el.gst : 0), el?.price)),
        0,
      ),
    ).toFixed(2);
  };

  const calculateGst = (gtax: number, amount: number) => {
    return Number(Math.round((amount * gtax) / 100).toFixed(2));
  };

  const calculateTotalTax = () => {
    return data?.productsArr
      .reduce(
        (acc: number, el: { quantity: any; box: any; packet: any; gst: any; price: number }) =>
          acc +
          Number(el.quantity) *
            Number(el.box) *
            Number(el.packet) *
            calculateGst(Number(el?.gst ? el.gst : 0), el?.price),
        0,
      )
      .toFixed(0);
  };

  const handleShowModal = (p: ProductType) => {
    setProductObj(p);
    setShowProducts(!showProducts);
  };

    const handelWareHOuseModal = () => {
      setProductArr([]);
      setshowWareHouse(true);
    };

  const upadteOrderStatus = async () => {
    try {
      if (quantity <= 0) {
        toastError("Please Enter Quantity");
        return 0;
      }
      let obj = {
        productId: productObj?.productId,
        batchId: orderId,
        quantity,
        status: PRODUCT_STATUS.CANCELLED,
      };
      const { data: res } = await mutateAsync(obj);

      if (res.data) {
        toastSuccess(res.message);
        setShowProducts(false);
      }

      navigate("/company-order/" + orderId);
    } catch (error) {
      toastError(error);
      console.log(error);
    }
  };
    const handleValueChange = (index: number, value: number, key: string) => {
      if (!(value < 0)) {
        let tempArr: any = productArr;
        tempArr[index][key] = value;
        setProductArr([...tempArr]);
      }
    };

  const handleAllPorducts = async () => {
    try {
      if (productArr?.length == 0) {
        toastError("Please Add  Products");
        return 0;
      }
      let obj: any = {
        companyId:data?._id,
        productsArr: productArr,
        totalTax: parseFloat(calculateTotalTax()),
        subTotal: parseFloat(calculateTotal()),
        discountValue: 0,
        total: Number(calculateGrandTotal()),
      };
      console.log(obj);
      const res = await addProductCompanyOrder(obj);
      if (res.data.data) {
          setProductArr([]);
          setshowWareHouse(true);
        toastSuccess(res.data.message);
            
      }
      navigate("/company-order");
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

  return (
    <div className="row">
      <form className="col">
        <div className="global_shadow_border global_padding">
          <SetHeaderName name="View Order" />
          <div className="row ">
            <div className="col">
              <div className="d-flex align-items-center">
                <div className="flex-fill">{/* <h4 className="mb-0">Add Product</h4> */}</div>
                <div>
                  <Link href={`/company-order`} className="btn btn-maincolor">
                    View Purchased Order
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="row ">
            <div className="col-md-6">
              <p>Name: {data?.sellerDetails?.name}</p>
              <p>Email: {data?.sellerDetails?.email}</p>
              <p>Phone: {data?.sellerDetails?.phone}</p>
              <p>Address: {data?.sellerDetails?.address}</p>
            </div>
            <div className="col-md-6">
              <p>OrderId: {data?._id}</p>
              <p>Status: {data?.orderStatus?.currentStatus}</p>
              <p>Date: {new Date(data?.createdAt).toDateString()}</p>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-md-4 mt-4">
              <button type="button" className="btn btn-maincolor" onClick={() => handelWareHOuseModal()}>
                Add Products
              </button>
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
                        <th scope="col">No of Carton</th>
                        <th scope="col"> Packet X Box</th>
                        <th scope="col"> Total Packet Carton</th>
                        <th scope="col"> Pending Carton</th>
                        <th scope="col"> Price</th>
                        <th scope="col"> Status</th>

                        <th scope="col">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.productsArr &&
                        data?.productsArr.length > 0 &&
                        data?.productsArr.map((el: any, index: number) => {
                          return (
                            <React.Fragment key={index}>
                              <tr>
                                <th scope="row">{el.name}</th>
                                <td>{el?.quantity}</td>

                                <td>
                                  {Number(el?.packet)} X {Number(el?.box)}{" "}
                                </td>
                                <td> {Number(el?.packet) * Number(el?.box)}</td>
                                <td>{el.totalStock - el?.totalTransitItems - el.cancelledStock}</td>

                                <td>{el?.price}</td>
                                <td>
                                  {" "}
                                  <span
                                    className={`badge badge-${Number(el.totalStock - el?.totalTransitItems - el.cancelledStock) == 0 ? "complete" : "denied"}`}
                                  >
                                    {Number(el.totalStock - el?.totalTransitItems - el.cancelledStock) == 0
                                      ? `${ORDER_STATUS.DELIVERED}`
                                      : `${ORDER_STATUS.PENDING}`}
                                  </span>
                                </td>

                                <td>
                                  <FaPencil onClick={() => handleShowModal(el)} />{" "}
                                  <GoEye onClick={() => setShowIndex(index == showIndex ? -1 : index)} />
                                </td>
                              </tr>

                              {showIndex == index && el.orders?.length > 0 && (
                                <tr>
                                  <td colSpan={8}>
                                    <table className="table">
                                      <thead>
                                        <tr>
                                          <th scope="col" style={{ background: "#3a5743", color: "#fff" }}></th>
                                          <th scope="col" style={{ background: "#3a5743", color: "#fff" }}>
                                            Name
                                          </th>

                                          <th scope="col" style={{ background: "#3a5743", color: "#fff" }}>
                                            Recevied Quantity
                                          </th>
                                          <th scope="col" style={{ background: "#3a5743", color: "#fff" }}>
                                            Remaining Quantity
                                          </th>

                                          <th scope="col" style={{ background: "#3a5743", color: "#fff" }}>
                                            {" "}
                                            Date
                                          </th>
                                          <th scope="col" style={{ background: "#3a5743", color: "#fff" }}>
                                            Status
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {el.orders.map((order: ICompanyOrderLogs, innerIndex: number) => (
                                          <tr key={innerIndex}>
                                            <td></td>
                                            <td>{order.name}</td>
                                            <td>{order.quantity}</td>
                                            <td>{order.previousQuantity}</td>

                                            <td>{new Date(order.createdAt).toDateString()}</td>
                                            <td>{order.status}</td>
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
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
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
                </thead>
              </table>
            </div>
          </div>
        </div>
      </form>

      <Modal show={showProducts} onHide={() => setShowProducts(false)} centered>
        {productObj && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Update Stock</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="row">
                <div className="col-md-12">
                  <Form.Group className="mb-4 position-relative" controlId="name">
                    <Form.Label>Name : {productObj?.name}</Form.Label>
                    <Form.Label>Total Quantity : {productObj?.quantity}</Form.Label>
                  </Form.Group>
                  <Form.Group className="mb-4 position-relative" controlId="name">
                    <Form.Label>Quantity : </Form.Label>
                    <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                  </Form.Group>
                  {/* <Form.Group className="mb-4 position-relative" controlId="name">
                    <Form.Label>Status : </Form.Label>
                    <select className="form-control" value={status} onChange={(e) => setStatus(`${e.target.value}`)}>
                      {Object.values(PRODUCT_STATUS).map((el: string) => (
                        <option key={el} value={el}>
                          {el}
                        </option>
                      ))}
                    </select>
                  </Form.Group> */}

                  <button type="submit" className="btn btn-maincolor" onClick={() => upadteOrderStatus()}>
                    Submit
                  </button>
                </div>
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>

      <Modal show={showWareHouse} onHide={() => setshowWareHouse(false)} size="lg" centered>
        <>
          <Modal.Header closeButton>
            <Modal.Title>Add Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
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
                        };
                      }),
                    ]}
                    styles={styling}
                    isClearable={false}
                    value={productArr}
                    isMulti
                    onChange={(val: any) => setProductArr(val)}
                  />
                </Form.Group>
              </div>
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
              <div className="col-md-12">
                <button type="button" className="btn btn-maincolor" onClick={() => handleAllPorducts()}>
                  Add All Products
                </button>
              </div>
            </div>
          </Modal.Body>
        </>
      </Modal>
    </div>
  );
}
