"use client";
import React from "react";
import AddCategory from "./_components/AddCategory";
import ViewCategory from "./_components/ViewCategory";
import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const params = useSearchParams();
  const id = params.get("id");
  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="Category" />
        <div className="row mt-3">
          <div className="col-4">
            <AddCategory id={id} />
          </div>
          <div className="col-8">
            <ViewCategory />
          </div>
        </div>
      </div>
    </div>
  );
}
