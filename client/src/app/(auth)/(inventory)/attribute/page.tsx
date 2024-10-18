"use client";
import React from "react";
import AddAttribute from "./_components/AddAttribute";
import ViewAttribute from "./_components/ViewAttribute";
import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const param = useSearchParams();
  const id = param.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="Attribute" />
        <div className="row mt-3">
          <div className="col-4">
            <AddAttribute id={id} />
          </div>
          <div className="col-8">
            <ViewAttribute />
          </div>
        </div>
      </div>
    </div>
  );
}
