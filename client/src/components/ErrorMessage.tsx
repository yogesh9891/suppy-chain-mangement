import React from "react";
import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

export default function ErrorMessage({
  field,
}: {
  field: FieldError | undefined | string | Merge<FieldError, FieldErrorsImpl<any>>;
}) {
  let error: any = "";

  if (typeof field === "string") {
    error = field;
  } else if (field?.message) {
    error = field?.message;
  }

  if (!error) {
    return null;
  }

  return <div className="my-1 text-danger">{error}</div>;
}
