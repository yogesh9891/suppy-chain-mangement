"use client";
import React from "react";
import AddAttributeValue from "./_components/AddAttributeValue";
import ViewAttributeValue from "./_components/ViewAttributeValue";
import SetHeaderName from "@/components/SetHeaderName";
import { useSearchParams } from "next/navigation";

export default function Page({ params }: { params: { id: string } }) {
  const param = useSearchParams();
  const attributeId = param.get("id");

  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="AttributeValue" />
        <div className="row mt-3">
          <div className="col-4">
            <AddAttributeValue id={attributeId} attributeId={params.id} />
          </div>
          <div className="col-8">
            <ViewAttributeValue attributeId={params.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
