"use client";
import React from "react";
import AddBrand from "./_components/AddSize";
import ViewBrand from "./_components/ViewSize";
import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="Brand" />
        <div className="row mt-3">
          <div className="col-4">
            <AddBrand id={id} />
          </div>
          <div className="col-8">
            <ViewBrand />
          </div>
        </div>
      </div>
    </div>
  );
}
