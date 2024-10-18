"use client";
import React from "react";
import AddExpense from "./_components/AddExpense";
import ViewExpense from "./_components/ViewExpense";
import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";

export default function Page() {
  //IMPORTS
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="Expense" />
        <div className="row mt-3">
          <div className="col-4">
            <AddExpense id={id} />
          </div>
          <div className="col-8">
            <ViewExpense />
          </div>
        </div>
      </div>
    </div>
  );
}
