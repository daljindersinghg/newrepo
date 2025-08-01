// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DentalCare+ | Find & Book Dentist Appointments Online | $50 Gift Card",
  description: "Find and book dentist appointments online with DentalCare+. Get a $50 gift card when you book. Compare verified dentists, read reviews, and book instantly.",
  keywords: ["dentist", "dental appointment", "book dentist", "dental care", "gift card", "verified dentists"],
  authors: [{ name: "DentalCare+" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PostHogProvider>
          <AuthProvider>
            {children}
            <AuthModal />
            <Analytics />
            <SpeedInsights/>
            {/* <LocalStorageDebug /> */}
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}