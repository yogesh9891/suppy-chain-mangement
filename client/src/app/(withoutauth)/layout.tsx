import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/nextAuthOptions";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (session) {
    const headersList = headers();
    const domain = headersList.get("x-forwarded-host") || "";
    const protocol = headersList.get("x-forwarded-proto") || "";
    // const pathname = headersList.get("x-invoke-path") || "";

    const pathname = headersList.get("next-url");
    let url = "/";
    if (pathname) {
      url = url + "?" + encodeURIComponent(pathname);
    }
    redirect(url);
  }

  return <>{children}</>;
}
