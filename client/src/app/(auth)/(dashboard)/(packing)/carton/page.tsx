"use client";
import React from "react";
import AddCarton from "./_components/AddCarton";
import ViewCarton from "./_components/ViewCarton";
import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";

export default function Page() {
  //IMPORTS
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="Carton" />
        <div className="row mt-3">
          <div className="col-4">
            <AddCarton id={id} />
          </div>
          <div className="col-8">
            <ViewCarton />
          </div>
        </div>
      </div>
    </div>
  );
}
