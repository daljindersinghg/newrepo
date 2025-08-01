'use client';

export function ClinicPatientsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Database</h2>
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Patient Database</h3>
          <p className="text-gray-600">Patient management system coming soon...</p>
        </div>
      </div>
    </div>
  );
}