"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { IBarCodes, useBarCode, useDeleteBarCode } from "@/services/barcode.service";
import CustomTable from "@/components/CustomTable";
import { GoPencil, GoTrash } from "react-icons/go";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { toastError, toastSuccess } from "@/utils/toast";
import Link from "next/link";
import { FaDownload } from "react-icons/fa";
import { Modal } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function ViewBarCode() {
  //DATA
  const { data: barcode, isFetching, isLoading, refetch } = useBarCode();
  const processedData = useProcessData(barcode);
  const router = useRouter();
  const loading = useLoading(isFetching, isLoading);
  const [show, setShow] = useState(false);
  const [noOfBarCode, setnoOfBarCode] = useState(0);
  const [name, setName] = useState("");
  const [barCode, setbarCode] = useState<IBarCodes>();
  const handleClose = () => setShow(false);
  const handleShow = (row: IBarCodes) => {
    setShow(true);
    setbarCode(row)
    setName(row?.name)
  };

  //MUTANTS
  const { mutateAsync: deleteBarCode } = useDeleteBarCode();

  //HANDLERS
  const handleDeleteBarCode = async (barcodeId: string) => {
    try {
      if (!barcodeId) return;

      if (!window.confirm("Are you sure you want to delete this barcode ? ")) return;

      const res = await deleteBarCode(barcodeId);
      if (res.data?.message) {
        toastSuccess(res.data?.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  const handlePrint = () => {
    window.localStorage.setItem("barncode", `${barCode?.barCode}`);
    window.localStorage.setItem("barncodename", `${barCode?.barCode}`);
    window.localStorage.setItem("nobarncode", `${noOfBarCode}`);
    window.open("/print", "_blank");
  };

  //COLUMNS
  const columns = [
      {
        header: "Name",
        accessorFn: (row: { name: any; }) => row.name,
        id: "description",
      },
      {
        header: "TYPE",
        accessorFn: (row: { barCodeType: any; }) => row.barCodeType,
        id: "amount",
      },
      {
        header: "",
        cell: ({ row: { original: row } }:any) => {
          return (
            <div role="button" onClick={() => handleShow(row)}>
              Print
            </div>
          );
        },
        id: "action2",
      },
      {
        header: "",
        cell: ({ row: { original: row } }:any) => {
          return (
            <div role="button" onClick={() => handleDeleteBarCode(row?._id)}>
              <GoTrash color="red" size={15} />
            </div>
          );
        },
        id: "action1",
      },
    ];
 

  return (
    <div className="row ">
      <div className="col">
        <div className=" global_shadow_border global_padding">
          <h5 className="text-maincolor">View BarCode</h5>
          <CustomTable
            columns={columns}
            data={processedData.rows}
            reload={refetch}
            serverPagination
            totalCount={processedData.total}
            loading={loading}
          />
        </div>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Print :{name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4 position-relative">
            <label
              htmlFor="name"
              className="form-label"
              style={{
                position: "absolute",
                zIndex: "1",
                background: "#fff",
                top: "-13px",
                left: "12px",
                padding: "0px 5px",
              }}
            >
              Enter Number of BarCode
            </label>
            <input
              type="number"
              className="form-control"
              id="name"
              aria-describedby="box name"
              style={{ position: "relative" }}
              value={noOfBarCode}
              onChange={(e) => setnoOfBarCode(Number(e.target.value))}
            />
          </div>

          <button type="submit" className="btn btn-maincolor" onClick={() => handlePrint()}>
            Print
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
}
