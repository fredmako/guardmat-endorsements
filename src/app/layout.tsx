import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Guardmat Community School Feeding Initiative",
  description: "Support school feeding programs for primary school pupils in Kisii County. Endorse the Guardmat initiative today.",
  openGraph: {
    title: "Guardmat Community School Feeding Initiative",
    description: "Support school feeding programs for primary school pupils in Kisii County.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
