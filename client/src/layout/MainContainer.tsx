import React from "react";

export default function MainContainer({ children }: { children: React.ReactNode }) {
  return <div className="container-fluid py-4">{children}</div>;
}
