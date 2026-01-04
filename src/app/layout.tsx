import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tutorio - Tutor Management Platform",
  description: "Manage students and assignments efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
