import { Header } from '@/components/landing/Header';
import { EnhancedSearchHero } from '@/components/landing/EnhancedSearchHero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { SimpleTracker } from '@/components/SimpleSideTracker';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <EnhancedSearchHero />
      <HowItWorks rewardAmount="50" />
      <CTASection />
      <Footer />
      <SimpleTracker />
    </div>
  );
}