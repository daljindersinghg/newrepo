// app/results/page.tsx
import { Metadata } from 'next';
import { ClinicResults } from '@/components/results/ClinicResults';

export const metadata: Metadata = {
  title: 'Find Dental Clinics Near You | DentalCare+',
  description: 'Browse verified dental clinics in your area with instant booking.',
};

export default function ResultsPage() {
  return <ClinicResults />;
}