"use client";
import React from "react";
import AddBarCode from "./_components/AddBarCode";
import ViewBarCode from "./_components/ViewBarCode";
import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";

export default function Page() {
  //IMPORTS
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="BarCode" />
        <div className="row mt-3">
          <div className="col-4">
            <AddBarCode id={id} />
          </div>
          <div className="col-8">
            <ViewBarCode />
          </div>
        </div>
      </div>
    </div>
  );
}
