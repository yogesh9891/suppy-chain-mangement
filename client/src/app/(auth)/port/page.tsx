"use client";
import React from "react";

import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";
import AddPort from "./_components/AddPort";
import ViewPort from "./_components/ViewPort";

export default function Page() {
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="Port" />
        <div className="row mt-3">
          <div className="col-4">
            <AddPort id={id} />
          </div>
          <div className="col-8">
            <ViewPort />
          </div>
        </div>
      </div>
    </div>
  );
}
