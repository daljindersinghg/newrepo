// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { PostHogProvider } from '@/providers/PostHogProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { AuthModal } from '@/components/auth/AuthModal'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getFullGiftCardText } from '@/lib/config/app-config'

const geistSans = Geist({ 
  variable: '--font-geist-sans', 
  subsets: ['latin'],
  display: 'swap'
})
const geistMono = Geist_Mono({ 
  variable: '--font-geist-mono', 
  subsets: ['latin'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: `DentalCare+ | Find & Book Dentist Appointments Online | ${getFullGiftCardText()}`,
  description:
    `Find and book dentist appointments online with DentalCare+. Get a ${getFullGiftCardText()} when you book. Compare verified dentists, read reviews, and book instantly.`,
  keywords: [
    'dentist',
    'dental appointment',
    'book dentist',
    'dental care',
    'gift card',
    'verified dentists',
  ],
  authors: [{ name: 'DentalCare+' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'DentalCare+ | Book Dentist Appointments Online',
    description:
      `Trusted dentists, instant booking & same-day availability. Get your ${getFullGiftCardText()} when you book.`,
    url: 'https://dentistnearme.ai',
    siteName: 'DentalCare+',
    images: [
      {
        url: 'https://dentistnearme.ai/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DentalCare+ | Book Dentist Appointments Online',
    description:
      `Trusted dentists, instant booking & same-day availability. Get your ${getFullGiftCardText()} when you book.`,
    images: ['https://dentistnearme.ai/twitter-image.jpg'],
  },
  // tell crawlers where to find your sitemap
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontClasses = `${geistSans.variable} ${geistMono.variable}`;
  
  return (
    <html lang="en" className={fontClasses}>
      <head>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'DentalCare+',
              description:
                'Online dental appointment booking platform with instant scheduling and same-day availability.',
              url: 'https://dentistnearme.ai',
              logo: 'https://dentistnearme.ai/logo.png',
              telephone: '+1-800-123-4567',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Vancouver',
                addressRegion: 'BC',
                postalCode: 'V5K0A1',
                addressCountry: 'CA',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '1250',
              },
            }),
          }}
        />
      </head>
      <body className="antialiased bg-white min-h-screen">
        <PostHogProvider>
          <AuthProvider>
            <AuthModal />
            {children}
            <Analytics />
            <SpeedInsights />
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
