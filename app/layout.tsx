import type { Metadata } from "next";
import { IBM_Plex_Sans, Inter, Space_Grotesk } from "next/font/google";
import { AppToaster } from "@/components/providers/app-toaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
      <body className={`${inter.variable} ${ibmPlexSans.variable} ${spaceGrotesk.variable} antialiased`}>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
