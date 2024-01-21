import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Just Watch It",
  description: "Search and Watch YouTube videos. No more. No less.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <body className="h-full py-8">{children}</body>
    </html>
  );
}
