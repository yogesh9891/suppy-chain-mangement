"use client";
import React from "react";

import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";
import AddColor from "./_components/AddColor";
import ViewColor from "./_components/ViewColor";

export default function Page() {
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="Color" />
        <div className="row mt-3">
          <div className="col-4">
            <AddColor id={id} />
          </div>
          <div className="col-8">
            <ViewColor />
          </div>
        </div>
      </div>
    </div>
  );
}
