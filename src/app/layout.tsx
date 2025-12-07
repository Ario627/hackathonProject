import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {AuthProvider} from "@/providers/AuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import React from "react";
import { validateEnvVars } from "@/config";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UMKM",
  description: "AI Consultant for UMKM Business",
}

export default function RootLAyout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}