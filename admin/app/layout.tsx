import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ElecProDeals — Admin",
  description: "Backoffice administration ElecProDeals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} h-full antialiased bg-zinc-950 text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}
