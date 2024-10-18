"use client";
import React from "react";
import AddState from "./_components/AddState";
import ViewState from "./_components/ViewState";
import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";

export default function Page() {
  //IMPORTS
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="State" />
        <div className="row mt-3">
          <div className="col-4">
            <AddState id={id} />
          </div>
          <div className="col-8">
            <ViewState />
          </div>
        </div>
      </div>
    </div>
  );
}
