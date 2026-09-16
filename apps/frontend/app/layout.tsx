import type { Metadata } from "next";
import { Inter, Share_Tech_Mono, Rajdhani } from "next/font/google";
import GameEndWatcher from "@/components/ui/GameEndWatcher";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap" 
});

const shareTechMono = Share_Tech_Mono({ 
  weight: "400", 
  subsets: ["latin"], 
  variable: "--font-share-tech-mono",
  display: "swap" 
});

const rajdhani = Rajdhani({ 
  weight: ["500", "600", "700"], 
  subsets: ["latin"], 
  variable: "--font-rajdhani",
  display: "swap" 
});

export const metadata: Metadata = {
  title: "OPERATION THE EXTRACTION — Classified Cyber Warfare CTF",
  description: "Tactical Interactive Cyber-Warfare & Cryptographic Extraction Operation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${shareTechMono.variable} ${rajdhani.variable}`}>
      <body className="bg-[#050506] text-[#f1f5f9] antialiased min-h-screen relative font-sans">
        <div className="telemetry-grid" aria-hidden="true" />
        <div className="scanline-overlay" aria-hidden="true" />
        <div className="blood-corner-tl" aria-hidden="true" />
        <div className="blood-corner-br" aria-hidden="true" />
        <div className="crt-vignette" aria-hidden="true" />
        <GameEndWatcher />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
