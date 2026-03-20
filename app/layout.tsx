import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppToaster } from "@/components/providers/app-toaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FastInBox",
  description: "FastInBox SaaS MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
