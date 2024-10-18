"use client";
import { SessionProvider } from "next-auth/react";
import React from "react";

export default function NextAuthSessionWrapper(params: { children?: React.ReactNode; session: any }) {
  return <SessionProvider session={params.session}>{params.children}</SessionProvider>;
}
