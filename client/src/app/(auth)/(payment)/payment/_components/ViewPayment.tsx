"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { IPayments, usePayment, useDeletePayment } from "@/services/payment.service";
import CustomTable from "@/components/CustomTable";
import { GoPencil, GoTrash } from "react-icons/go";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { toastError, toastSuccess } from "@/utils/toast";
import Link from "next/link";
import { FaDownload } from "react-icons/fa";
import { Modal } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function ViewPayment() {
  //DATA
  const { data: payments, isFetching, isLoading, refetch } = usePayment();
  const processedData = useProcessData(payments);
  const router = useRouter();
  const loading = useLoading(isFetching, isLoading);
  const [show, setShow] = useState(false);
  const [noOfPayment, setnoOfPayment] = useState(0);
  const [name, setName] = useState("");
  const [payment, setpayment] = useState<IPayments>();


  //MUTANTS
  const { mutateAsync: deletePayment } = useDeletePayment();

  //HANDLERS
  const handleDeletePayment = async (paymentId: string) => {
    try {
      if (!paymentId) return;

      if (!window.confirm("Are you sure you want to delete this payment ? ")) return;

      const res = await deletePayment(paymentId);
      if (res.data?.message) {
        toastSuccess(res.data?.message);
      }
    } catch (error) {
      toastError(error);
    }
  };


  //COLUMNS
  const columns = useMemo(() => {
    let cols: ColumnDef<IPayments>[] = [
      {
        header: "Name",
        accessorFn: (row) => row?.customer?.name,
        id: "name",
      },
      {
        header: "Store",
        accessorFn: (row) => row?.store?.name,
        id: "store",
      },
      {
        header: "Recieved",
        accessorFn: (row) => row?.createdUser?.name,
        id: "createdUser",
      },
      {
        header: "Amount",
        accessorFn: (row) => row?.amount,
        id: "amount",
      },
      {
        header: "Description",
        accessorFn: (row) => row?.description,
        id: "description",
      },

      {
        header: "",
        cell: ({ row: { original: row } }) => {
          return (
            <div role="button" onClick={() => handleDeletePayment(row?._id)}>
              <GoTrash color="red" size={15} />
            </div>
          );
        },
        id: "action1",
      },
    ];
    return cols;
  }, []);

  return (
    <div className="row ">
      <div className="col">
        <div className=" global_shadow_border global_padding">
          <h5 className="text-maincolor">View Payment</h5>
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
    </div>
  );
}
