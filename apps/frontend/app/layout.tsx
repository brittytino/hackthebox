import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Operation Cipher Strike",
  description: "Interactive Cyber-Thriller Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full w-full overflow-hidden">
      <body className={`${inter.className} bg-black text-white antialiased h-full w-full overflow-hidden select-none`}>
        {children}
      </body>
    </html>
  );
}
