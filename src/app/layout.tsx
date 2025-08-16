import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HeroUIProvider } from "@heroui/react";
import ConditionalNavigation from "../components/ConditionalNavigation";
import BackgroundProvider from "./BackgroundProvider";
import ToastNotificationProvider from "../components/ToastNotificationProvider";
import ClientAuthWrapper from "../components/ClientAuthWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Storage System",
  description: "Inventory Management System",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HeroUIProvider>
          <BackgroundProvider>
            <ToastNotificationProvider>
              <ClientAuthWrapper>
                <ConditionalNavigation />
                {children}
              </ClientAuthWrapper>
            </ToastNotificationProvider>
          </BackgroundProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}
