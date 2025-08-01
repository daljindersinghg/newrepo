'use client';

import { useState, useEffect } from 'react';
import { PendingAuthClinics } from './PendingAuthClinics';
import { AuthenticatedClinics } from './AuthenticatedClinics';

type TabType = 'pending' | 'authenticated';

export function ClinicAuthManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Clinic Authentication Management
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage clinic authentication setup and credentials
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('pending')}
              className={`${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
            >
              Pending Authentication
            </button>
            <button
              onClick={() => setActiveTab('authenticated')}
              className={`${
                activeTab === 'authenticated'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
            >
              Authenticated Clinics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'pending' && <PendingAuthClinics />}
          {activeTab === 'authenticated' && <AuthenticatedClinics />}
        </div>
      </div>
    </div>
  );
}
