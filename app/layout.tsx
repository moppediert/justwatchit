import type { Metadata } from "next";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

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
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_OAUTH2_CLIENT_ID as string}
    >
      <html lang="en" className="h-full dark overscroll-none">
        <body className="h-full py-8 overscroll-none">{children}</body>
      </html>
    </GoogleOAuthProvider>
  );
}
