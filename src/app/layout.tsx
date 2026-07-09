import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "ErrorNest — Error monitoring that doesn't get in your way",
    template: "%s · ErrorNest",
  },
  description:
    "Catch, group, and triage production errors before your users have to tell you about them.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
