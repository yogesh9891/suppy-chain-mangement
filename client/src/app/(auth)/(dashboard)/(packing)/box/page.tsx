"use client";
import React from "react";
import AddBox from "./_components/AddBox";
import ViewBox from "./_components/ViewBox";
import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";

export default function Page() {
  //IMPORTS
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="Box" />
        <div className="row mt-3">
          <div className="col-4">
            <AddBox id={id} />
          </div>
          <div className="col-8">
            <ViewBox />
          </div>
        </div>
      </div>
    </div>
  );
}
