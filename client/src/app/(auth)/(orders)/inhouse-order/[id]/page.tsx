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
import { useOrderById } from "@/services/order.service";

export default function Page({ params }: { params: { id: string } }) {
  const orderId = params.id;
  const role = useCurrentRole();
  const [status, setStatus] = useState("");

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
  const calculateTotalTax = () => {
    return data?.productsArr
      .reduce((acc: number, el: { quantity: any; price: any; tax: any }) => acc + Number(el.tax), 0)
      .toFixed(0);
  };

  const calculateTotal = () => {
    return data?.productsArr
      .reduce(
        (acc: number, el: { quantity: any; price: any}) =>
          acc + Number(el.quantity) * Number(el.price),
        0,
      )
      .toFixed(2);
  };
  const calculateGrandTotal = () => {
    return Math.round(
      data?.productsArr.reduce(
        (acc: number, el: { quantity: any; price: any }) =>
          acc + Number(el.quantity) * Number(el.price),
        0,
      ),
    ).toFixed(2);
  };

  const calculateGst = (gtax: number, amount: number) => {
    return Number(Math.round((amount * gtax) / 100).toFixed(2));
  };

  const upadteOrderStatus = async () => {
    try {
      let obj = {
        productId: data?._id,
        status,
      };
      const res = await mutateAsync(obj);

      if (res.data  ) {
        toastSuccess(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="row">
      <form className="col">
        <div className="global_shadow_border global_padding">
          <SetHeaderName name={`${role == ROLES.ADMIN ? "Branch" : "Inhouse"} Order`} />
          <div className="row ">
            <div className="col">
              <div className="d-flex align-items-center">
                <div className="flex-fill">{/* <h4 className="mb-0">Add Product</h4> */}</div>
                <div>
                  <Link href={`/inhouse-order`} className="btn btn-maincolor">
                    {`${role == ROLES.ADMIN ? "Branch" : "Inhouse"} Order`}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="row ">
            <div className="col-md-6">
              <p>Name: {data?.buyerDetails?.name}</p>
              <p>Email: {data?.buyerDetails?.email}</p>
              <p>Phone: {data?.buyerDetails?.phone}</p>
              <p>Address: {data?.buyerDetails?.address}</p>
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
                        <th scope="col"> Packet X Box</th>
                        <th scope="col"> Total Packet Carton</th>
                        <th scope="col"> Price</th>
                        <th scope="col">No of Carton</th>

                        <th scope="col">Total Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.productsArr &&
                        data?.productsArr.length > 0 &&
                        data?.productsArr.map((el: any, index: number) => {
                          return (
                            <tr key={index}>
                              <th scope="row">
                                {el.name} 
                              </th>
                              <td>
                                {Number(el?.packet)} X {Number(el?.box)}{" "}
                              </td>
                              <td> {Number(el?.packet) * Number(el?.box)}</td>

                              <td>{el?.price}</td>
                              <td>{el?.quantity}</td>
                              <td>
                                {(Number(el.box) * Number(el.packet) * Number(el.price) * Number(el?.quantity)).toFixed(
                                  2,
                                )}
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
                    <th scope="col">Sub Total </th>
                    <th scope="col">{data?.subTotal}</th>
                  </tr>

                  <tr>
                    <th scope="col"> Total </th>
                    <th scope="col">{data?.total}</th>
                  </tr>
                </thead>
              </table>
            </div>
            {role == ROLES.ADMIN && (
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
