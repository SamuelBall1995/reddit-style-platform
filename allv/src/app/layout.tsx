import "./globals.css";
import { Inter } from "next/font/google";
import AppHeader from "@/components/AppHeader";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <AppHeader />
        <main className="container mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
