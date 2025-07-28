import { Header } from '@/components/landing/Header';
import { EnhancedSearchHero } from '@/components/landing/EnhancedSearchHero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { TrustSection } from '@/components/landing/TrustSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

import type { Metadata } from 'next';
import { SimpleTracker } from '@/components/SimpleSideTracker';

export const metadata: Metadata = {
  title: "DentalCare+ | Find & Book Dentist Appointments Online | $50 Gift Card",
  description: "Find and book dentist appointments online with DentalCare+. Get a $50 gift card when you book. Compare verified dentists, read reviews, and book instantly.",
  // ... your existing metadata
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <EnhancedSearchHero />
      <HowItWorks />
      <Features />
      <TrustSection />
      <CTASection />
      <Footer />
      
      {/* Simple client-side tracker - doesn't affect SEO */}
      <SimpleTracker />
    </div>
  );
}