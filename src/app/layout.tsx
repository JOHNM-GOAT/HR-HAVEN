import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WellnessProvider } from "../context/WellnessContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AxionHR Haven - Workplace Well-Being Platform",
  description: "AI-powered workplace well-being platform helping employees prevent burnout with continuous privacy-first insights, physical guidance, and peer recognition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-100 text-slate-900 antialiased min-h-screen selection:bg-blue-600 selection:text-white`}>
        <WellnessProvider>
          {children}
        </WellnessProvider>
      </body>
    </html>
  );
}
