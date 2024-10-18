"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { IExpenses, useExpense, useDeleteExpense } from "@/services/expense.service";
import CustomTable from "@/components/CustomTable";
import { GoPencil, GoTrash } from "react-icons/go";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { toastError, toastSuccess } from "@/utils/toast";
import Link from "next/link";

export default function ViewExpense() {
  //DATA
  const { data: expense, isFetching, isLoading, refetch } = useExpense();
  const processedData = useProcessData(expense);
  const loading = useLoading(isFetching, isLoading);

  //MUTANTS
  const { mutateAsync: deleteExpense } = useDeleteExpense();

  //HANDLERS
  const handleDeleteExpense = async (expenseId: string) => {
    try {
      if (!expenseId) return;

      if (!window.confirm("Are you sure you want to delete this expense ? ")) return;

      const res = await deleteExpense(expenseId);
      if (res.data?.message) {
        toastSuccess(res.data?.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  //COLUMNS
  const columns =  [
      {
        header: "Category",
        accessorFn: (row: { expenseCategoryName: any; }) => row.expenseCategoryName,
        id: "category",
      },
      {
        header: "Description",
        accessorFn: (row: { description: any; }) => row.description,
        id: "description",
      },
      {
        header: "Amount",
        accessorFn: (row: { amount: any; }) => row.amount,
        id: "amount",
      },
      {
        header: "",
        cell: ({ row: { original: row } }:any) => {
          return (
            <Link href={`/expense?id=${row?._id}`}>
              <GoPencil size={15} />
            </Link>
          );
        },
        id: "action2",
      },
      {
        header: "",
        cell: ({ row: { original: row } }:any) => {
          return (
            <div role="button" onClick={() => handleDeleteExpense(row?._id)}>
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
          <h5 className="text-maincolor">View Expense</h5>
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
