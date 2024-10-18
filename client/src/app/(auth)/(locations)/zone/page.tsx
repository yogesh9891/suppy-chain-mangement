"use client";
import React from "react";
import AddZone from "./_components/AddZone";
import ViewZone from "./_components/ViewZone";
import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";

export default function Page() {
  //IMPORTS
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="Zone" />
        <div className="row mt-3">
          <div className="col-4">
            <AddZone id={id} />
          </div>
          <div className="col-8">
            <ViewZone />
          </div>
        </div>
      </div>
    </div>
  );
}
