"use client";
import React from "react";
import AddCountry from "./_components/AddCountry";
import ViewCountry from "./_components/ViewCountry";
import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";

export default function Page() {
  //IMPORTS
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="Country" />
        <div className="row mt-3">
          <div className="col-4">
            <AddCountry id={id} />
          </div>
          <div className="col-8">
            <ViewCountry />
          </div>
        </div>
      </div>
    </div>
  );
}
