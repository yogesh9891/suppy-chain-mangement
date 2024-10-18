"use client";
import Link from "next/link";
import { toastError, toastSuccess } from "@/utils/toast";
import Select from "react-select";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import { useEffect, useRef, useState } from "react";
import SetHeaderName from "@/components/SetHeaderName";
import { useAddContainer, useContainerById, useUpdateContainer } from "@/services/container.service";
import { useCurrentRole } from "@/customhooks/useCurrentRole";
import { ORDER_STATUS, ROLES } from "@/common/constant.common";
import { Form } from "react-bootstrap";
import { usePort } from "@/services/port.service";

export default function Page({ params }: { params: { id: string } }) {
  const orderId = params.id;
  const role = useCurrentRole();
  const [status, setStatus] = useState("");
  const [port, setPort] = useState<any>({
    label: "Please Select Port",
    value:""
  });
  
  const { data: ports } = usePort({}, false);

  const processedPortData = useProcessData(ports);


  const { mutateAsync } = useUpdateContainer();

  const { data }: any = useContainerById(orderId, !!orderId);

  useEffect(() => {
    if (data?.orderStatus?.currentStatus) {
      setStatus(data?.orderStatus?.currentStatus);
    }
  }, [data]);

  const calculateTotalQuantity = () => {
    return data?.productsArr.reduce((acc: number, el: { quantity: any }) => acc + Number(el.quantity), 0).toFixed(0);
  };

  const upadteOrderStatus = async () => {
    try {
      let obj: any = {
        batchId: data?._id,
        status: ORDER_STATUS.DELIVERED,
      };
      if (port?.value!="") {
        obj.portId = port?.value;
        obj.portName = port?.label;
      }
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
          <SetHeaderName name={`Container / WareHouse`} />
          <div className="row ">
            <div className="col">
              <div className="d-flex align-items-center">
                <div className="flex-fill">{/* <h4 className="mb-0">Add Product</h4> */}</div>
                <div>
                  {/* <Link href={`/container`} className="btn btn-maincolor">
                    {`View Container`}
                  </Link> */}
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
              <p>Container Name: {data?.name}</p>
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
                        <th scope="col">No of Carton</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.productsArr &&
                        data?.productsArr.length > 0 &&
                        data?.productsArr.map((el: any, index: number) => {
                          return (
                            <tr key={index}>
                              <th scope="row">{el.name}</th>
                              <td>
                                {Number(el?.packet)} X {Number(el?.box)}{" "}
                              </td>
                              <td> {Number(el?.packet) * Number(el?.box)}</td>

                              <td>{el?.quantity}</td>
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
                </thead>
              </table>
            </div>
            {data && data?.type == "CONTAINER" && (
              <div className="row mt-3">
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
                      Port
                    </Form.Label>
                    <Select
                      instanceId={"portId"}
                      options={processedPortData.rows.map((el) => ({ label: el.name, value: el._id }))}
                      isSearchable={true}
                      isLoading={processedPortData.rows.length === 0}
                      value={port}
                      onChange={(val) => setPort(val)}
                    />
                  </Form.Group>
                </div>
                <div className="col -md-6">
                  <button type="button" className="btn btn-maincolor" onClick={() => upadteOrderStatus()}>
                    Reached
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
