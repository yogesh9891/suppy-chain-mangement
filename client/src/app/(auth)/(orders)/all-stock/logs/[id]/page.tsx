"use client";
import Link from "next/link";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import CustomTable from "@/components/CustomTable";
import SetHeaderName from "@/components/SetHeaderName";
import { IProduct, useProduct, useUpdateProductIsFocused } from "@/services/product.service";
import { toastError, toastSuccess } from "@/utils/toast";
import { GoPencil } from "react-icons/go";
import { FaEye } from "react-icons/fa";
import { IProductOrder, useProductOrder } from "@/services/productOrder.service";
import { IOrder, useOrder } from "@/services/order.service";
import { ICompanyOrder, ICompanyOrderLogs, useOrderStockByProductId, useUpdateCompanyOrder, useUpdateCompanyStatus } from "@/services/companyOrder.service";
import { useNavigate } from "@/hooks/useNavigate";
import { PRODUCT_STATUS } from "@/common/constant.common";
import { Form, Modal } from "react-bootstrap";

export default function Page({ params }: { params: { id: string } }) {
  const Item = "Product"; 
  const productId = params.id;
  //DATA Products
  const { data: productStocks, refetch, isFetching, isLoading } = useOrderStockByProductId({ productId }, !!productId);
  const processedProducts = useProcessData(productStocks);

  const loading = useLoading(isFetching, isLoading);
    const [status, setStatus] = useState(`${PRODUCT_STATUS.TRANSIT}`);
    const navigate = useNavigate();
    const [showIndex, setShowIndex] = useState(-1);
    const [quantity, setQuantity] = useState(0);
  const [showProducts, setShowProducts] = useState(false);
  const [productObj, setProductObj] = useState<any>(null);
  const { mutateAsync: updateStatus } = useUpdateCompanyStatus();
  const { mutateAsync } = useUpdateCompanyOrder();

  const handleShowModal = (p: ICompanyOrder) => {
    setProductObj(p);
    setShowProducts(!showProducts);
  };
  const upadteOrderStatus = async () => {
    try {
      if (quantity <= 0) {
        toastError("Please Enter Quantity");
        return 0;
      }
      let obj = {
        productId: productId,
        batchId: productObj?._id,
        quantity,
        status,
      };

      const { data: res } = await mutateAsync(obj);

      if (res.message) {
        toastSuccess(res.message);
        setShowProducts(false);
        navigate("/all-stock/logs/"+productId);
      }

    } catch (error) {
      toastError(error);
      console.log(error);
    }
  };

  //MUTANTS
  const { mutateAsync: updateProductIsFocused } = useUpdateProductIsFocused();

  //TABLE COLUMNS: Products
  const columns = useMemo(() => {
    let cols: ColumnDef<ICompanyOrderLogs>[] = [
      {
        header: "Name",
        accessorFn: (row) => row.name,
        id: "name",
      },
      {
        header: "Price",
        accessorFn: (row) => row.price,
        id: "price",
      },
      {
        header: "PO Issued",
        accessorFn: (row: any) => row?.totalQuantity,
        id: "created",
      },
      {
        header: "PO Received",
        accessorFn: (row: any) => row?.totalStockItems,
        id: "received",
      },
      {
        header: "Date",
        accessorFn: (row: any) => new Date(row.createdAt).toDateString(),
        id: "PTS",
      },
      {
        header: "Action",
        cell: ({ row: { original: row } }: any) => {
          return (
            <button type="button" onClick={() => handleShowModal(row)} className="btn btn-maincolor">
              Update
            </button>
          );
        },
        id: "acr",
      },
    ];
    return cols;
  }, []);

  //HANDLERS

  return (
    <div className="row">
      <div className="col">
        <div className="global_shadow_border global_padding">
          <div className="d-flex align-items-center mb-2">
            <SetHeaderName name="Purchase Order" />
            {/* <div className="flex-fill">
              <h4 className="mb-0">Total Carton : 20</h4>
              <h4 className="mb-0">Penfing Carton : 10</h4>
            </div> */}
            <div></div>
          </div>
          <div className="row">
            <div className="col">
              <CustomTable
                columns={columns}
                data={processedProducts?.rows}
                reload={refetch}
                totalCount={processedProducts.total}
                loading={loading}
                serverPagination
                
                
              />
            </div>
          </div>
        </div>
      </div>

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
                    <Form.Label>Total Quantity : {productObj?.totalQuantity}</Form.Label>
                  </Form.Group>
                  <Form.Group className="mb-4 position-relative" controlId="name">
                    <Form.Label>Quantity : </Form.Label>
                    <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                  </Form.Group>
                  <Form.Group className="mb-4 position-relative" controlId="name">
                    <Form.Label>Status : </Form.Label>
                    <select className="form-control" value={status} onChange={(e) => setStatus(`${e.target.value}`)}>
                      {Object.values(PRODUCT_STATUS).map((el: string) => (
                        <option key={el} value={el}>
                          {el}
                        </option>
                      ))}
                    </select>
                  </Form.Group>

                  <button type="submit" className="btn btn-maincolor" onClick={() => upadteOrderStatus()}>
                    Submit
                  </button>
                </div>
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>
    </div>
  );
}
