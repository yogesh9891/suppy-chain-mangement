import RootProvider from "@/providers/providers";
import type { Metadata } from "next";
import "./globals.scss";
import Script from "next/script";
import { Inter } from "next/font/google";

const main = Inter({
  subsets: ["latin"],
  // display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Blessing Admin",
  description: "Blessing",
};

export default function RootLayout({ children, session }:  any ) {
  return (
    <html lang="en">
      <body className={main.className}>
        <RootProvider session={session}>{children}</RootProvider>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
          crossOrigin="anonymous"
        ></Script>
      </body>
    </html>
  );
}
