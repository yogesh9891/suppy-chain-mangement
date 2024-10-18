"use client";
import React from "react";
import AddArea from "./_components/AddArea";
import ViewArea from "./_components/ViewArea";
import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";

export default function Page() {
  //IMPORTS
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="Areas" />
        <div className="row mt-3">
          <div className="col-4">
            <AddArea id={id} />
          </div>
          <div className="col-8">
            <ViewArea />
          </div>
        </div>
      </div>
    </div>
  );
}
