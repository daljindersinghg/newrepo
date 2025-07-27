import DentalQuestionnaire from '@/components/booking/questionaire';
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Find Your Perfect Dentist | DentalCare+ Questionnaire',
  description: 'Answer a few quick questions to find dentists that match your needs and preferences.',
};

export default function QuestionnairePage() {
  return (
    <div className="min-h-screen">
      <DentalQuestionnaire
       
      />
    </div>
  );
}
