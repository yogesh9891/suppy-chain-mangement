"use client";
import { useHeaderName, useSetHeaderName } from "@/customhooks/useHeaderName";
import { useEffect } from "react";

export default function SetHeaderName({ name }: { name: string }) {
  const headerName = useHeaderName();
  const setHeaderName = useSetHeaderName();
  useEffect(() => {
    if (headerName !== name) {
      setHeaderName(name);
    }
  }, [name, headerName]);

  return null;
}
