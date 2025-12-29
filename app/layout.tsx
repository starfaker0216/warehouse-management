import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import Header from "../components/Header";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Tý Táo Store",
  description:
    "Hệ thống quản lý và thống kê kho hàng điện thoại của Tý Táo Store",
  manifest: "/manifest.json",
  themeColor: "#000000",
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tý Táo Store"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Header />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              success: {
                iconTheme: {
                  primary: "#fff",
                  secondary: "#10b981"
                }
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
