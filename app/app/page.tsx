import { Header } from '@/components/landing/Header';
import { EnhancedSearchHero } from '@/components/landing/EnhancedSearchHero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { SimpleTracker } from '@/components/SimpleSideTracker';
import { SharedHeader } from '@/components/shared/SharedHeader';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Use SharedHeader for consistency across all pages */}
      <div className="hidden md:block">
        <SharedHeader 
          showDentistLogin={true} 
          showPatientAuth={true}
          className="sticky top-0 z-50" 
        />
      </div>
      
      {/* Mobile Header - Keep the custom one for landing page */}
      <div className="md:hidden">
        <Header />
      </div>
      
      <EnhancedSearchHero />
      <HowItWorks rewardAmount="50" />
      <CTASection />
      <Footer />
      <SimpleTracker />
    </div>
  );
}