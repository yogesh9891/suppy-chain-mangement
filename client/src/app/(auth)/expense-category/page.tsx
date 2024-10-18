"use client";
import React from "react";
import AddExpenseCategory from "./_components/AddExpenseCategory";
import ViewExpenseCategory from "./_components/ViewExpenseCategory";
import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="ExpenseCategory" />
        <div className="row mt-3">
          <div className="col-4">
            <AddExpenseCategory id={id} />
          </div>
          <div className="col-8">
            <ViewExpenseCategory />
          </div>
        </div>
      </div>
    </div>
  );
}
