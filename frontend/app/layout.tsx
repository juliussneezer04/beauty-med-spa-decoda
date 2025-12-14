import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Topbar } from "@/components/topbar";
import { Footer } from "@/components/footer";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beauty Med Spa Dashboard",
  description: "Patient management and analytics dashboard",
  generator: "Vishnu Sundaresan",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans antialiased min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col`}
      >
        {/* Background gradients inspired by Decoda Health Site */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 opacity-10 z-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.3), rgba(168, 85, 247, 0.3), rgba(78, 128, 238, 0.3), transparent 60%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-5 z-0"
              style={{
                background:
                  "linear-gradient(120deg, #0ea5e9, #a855f7, #4e80ee, #0ea5e9)",
                backgroundSize: "300% 300%",
              }}
            />
          </div>
        </div>

        {/* Topbar */}
        <Topbar />

        {/* Main content area */}
        <main className="pt-16 flex-1 p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>

        <Footer />

        <Analytics />
      </body>
    </html>
  );
}
