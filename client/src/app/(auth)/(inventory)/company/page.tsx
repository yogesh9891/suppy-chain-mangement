import React from "react";
import AddCompany from "./_components/AddCompany";
import ViewCompany from "./_components/ViewCompany";
import SetHeaderName from "@/components/SetHeaderName";

export default function Page() {
  return (
    <div className="row">
      <div className="col">
        <SetHeaderName name="Company" />
        <div className="row mt-3">
          <div className="col-4">
            <AddCompany />
          </div>
          <div className="col-8">
            <ViewCompany />
          </div>
        </div>
      </div>
    </div>
  );
}
