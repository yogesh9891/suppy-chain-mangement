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
import { IProductSingle, PartialProduct, useAddProduct, useProduct } from "@/services/product.service";
import { useEffect, useRef, useState } from "react";
import SetHeaderName from "@/components/SetHeaderName";
import { useAddProductOrder, useProductOrderById, useUpdateProductOrder } from "@/services/productOrder.service";
import { useSearchParams } from "next/navigation";
import { useCurrentRole } from "@/customhooks/useCurrentRole";
import { ORDER_STATUS, ROLES } from "@/common/constant.common";
import { GoEye } from "react-icons/go";

export default function Page({ params }: { params: { id: string } }) {
  const orderId = params.id;
  const role = useCurrentRole();
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const { mutateAsync } = useUpdateProductOrder();

  const { data }: any = useProductOrderById(orderId, !!orderId);

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
            (Number(el?.price) + calculateGst(Number(el?.gst ?el.gst:0), el?.price)),
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
          acc + Number(el.quantity) * Number(el.box) * Number(el.packet) * calculateGst(Number(el?.gst ? el.gst :0), el?.price),
        0,
      )
      .toFixed(0);
  };

  const upadteOrderStatus = async () => {
    try {
      let obj = {
        productId: data?._id,
        status,
      };
      const res = await mutateAsync(obj);

      if (res.data.data) {
        toastSuccess(res.data.message);
      }

      navigate("/product-order");
    } catch (error) {
      console.log(error);
    }
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
                  <Link href={`/product-order`} className="btn btn-maincolor">
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
                        <th scope="col">Carton Received</th>
                        <th scope="col">Pending Carton</th>

                        <th scope="col"> Packet X Box</th>
                        <th scope="col"> Total Packet Carton</th>
                        <th scope="col"> Price</th>
                        <th scope="col">GST</th>
                        <th scope="col">Total Price</th>
                        <th scope="col">Status</th>
                        <th scope="col">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.productsArr &&
                        data?.productsArr.length > 0 &&
                        data?.productsArr.map((el: any, index: number) => {
                          return (
                            <tr key={index}>
                              <th scope="row">{el.name}</th>
                              <td>{el?.quantity}</td>
                              <td>
                                <input type="text" value={el?.quantity / 2} />
                              </td>
                              <td>{el?.quantity - el?.quantity/2}</td>

                              <td>
                                {Number(el?.packet)} X {Number(el?.box)}{" "}
                              </td>
                              <td> {Number(el?.packet) * Number(el?.box)}</td>

                              <td>{el?.price}</td>
                              <td>{calculateGst(Number(el?.gst ? el?.gst : 0), el?.price)}%</td>
                              <td>
                                {(
                                  Number(el.box) *
                                  Number(el.packet) *
                                  Number(el.quantity) *
                                  (Number(el?.price) + calculateGst(Number(el?.gst ? el?.gst : 0), el?.price))
                                ).toFixed(2)}
                              </td>
                              <td>
                                {" "}
                                <select
                                  className="form-control"
                                  value={status}
                                  onChange={(e) => setStatus(e.target.value)}
                                >
                                  {Object.values(ORDER_STATUS).map((el: string) => (
                                    <option key={el}>{el}</option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                {" "}
                                <Link role="button" href={`/product-order/logs/${el?._id}`}>
                                  <GoEye />
                                </Link>
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
            {data?.orderStatus?.currentStatus != ORDER_STATUS.DELIVERED && (
              <div className="row mt-3">
                <div className="col -md-6">
                  <label>Status</label>
                  <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                    {Object.values(ORDER_STATUS).map((el: string) => (
                      <option key={el}>{el}</option>
                    ))}
                  </select>

                  <button type="button" className="btn btn-maincolor" onClick={() => upadteOrderStatus()}>
                    Update
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
