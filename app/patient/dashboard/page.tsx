'use client';

import { useState } from 'react';
import { PatientDashboardLayout } from '@/components/patient/PatientDashboardLayout';
import { OverviewTab } from '@/components/patient/OverviewTab';
import { AppointmentsTab } from '@/components/patient/AppointmentsTab';
import { FindClinicsTab } from '@/components/patient/FindClinicsTab';

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'appointments':
        return <AppointmentsTab />;
      case 'find-clinics':
        return <FindClinicsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <PatientDashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </PatientDashboardLayout>
  );
}