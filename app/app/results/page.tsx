// app/results/page.tsx
import { Metadata } from 'next';
import { DoctorResults } from '@/components/results/DoctorResults';

export const metadata: Metadata = {
  title: 'Find Dentists Near You | DentalCare+',
  description: 'Browse verified dentists in your area with instant booking.',
};

export default function ResultsPage() {
  return <DoctorResults />;
}