"use client";
import React from "react";
import AddPayment from "./_components/AddPayment";
import ViewPayment from "./_components/ViewPayment";
import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";

export default function Page() {
  //IMPORTS
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="Payment" />
        <div className="row mt-3">
          <div className="col-4">
            <AddPayment id={id} />
          </div>
          <div className="col-8">
            <ViewPayment />
          </div>
        </div>
      </div>
    </div>
  );
}
