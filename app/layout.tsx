import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] })


export const metadata: Metadata = {
  title: "LMS- Learn by doing project",
  description: "Learning platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
    >
      <ClerkProvider>

        <body className={inter.className}>{children}</body>
      </ClerkProvider>
    </html>
  );
}
