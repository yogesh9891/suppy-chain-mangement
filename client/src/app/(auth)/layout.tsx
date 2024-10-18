import Sidebar from "@/layout/Sidebar";
import { getSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/nextAuthOptions";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Header from "@/layout/header";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    const headersList = headers();
    const domain = headersList.get("x-forwarded-host") || "";
    const protocol = headersList.get("x-forwarded-proto") || "";
    // const pathname = headersList.get("x-invoke-path") || "";

    const pathname = headersList.get("next-url");
    let url = "/login";
    if (pathname) {
      url = url + "?" + encodeURIComponent(pathname);
    }
    redirect(url);

    return null;
  }

  return (
    <div className="d-flex " style={{ backgroundColor: "white", height: "100dvh" }}>
      <div>
        <Sidebar />
      </div>
      <div className="flex-fill px-4" style={{ backgroundColor: "#eef2f6", height: " 100dvh", overflowY: "scroll" }}>
        <Header />
        <div className="py-4">{children}</div>
      </div>
    </div>
  );
}
