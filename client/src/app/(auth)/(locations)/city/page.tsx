"use client";
import React from "react";
import AddCity from "./_components/AddCity";
import ViewCity from "./_components/ViewCity";
import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";

export default function Page() {
  //IMPORTS
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="Citys" />
        <div className="row mt-3">
          <div className="col-4">
            <AddCity id={id} />
          </div>
          <div className="col-8">
            <ViewCity />
          </div>
        </div>
      </div>
    </div>
  );
}
