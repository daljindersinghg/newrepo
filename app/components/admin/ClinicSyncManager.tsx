// components/admin/ClinicSyncManager.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface SyncResult {
  success: number;
  failed: number;
  errors: string[];
}

export function ClinicSyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleBulkSync = async () => {
    setIsSyncing(true);
    setMessage(null);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/clinics/bulk-sync`);
      
      if (response.data.success) {
        setLastResult(response.data.data);
        setMessage(`Sync completed: ${response.data.data.success} clinics updated, ${response.data.data.failed} failed`);
      }
    } catch (error: any) {
      setMessage(`Sync failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Google Places Sync</h3>
          <p className="text-gray-600">Keep clinic information up-to-date with Google Places</p>
        </div>
        
        <Button
          onClick={handleBulkSync}
          disabled={isSyncing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSyncing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Syncing...
            </>
          ) : (
            'Sync All Clinics'
          )}
        </Button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.includes('failed') 
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          {message}
        </div>
      )}

      {/* Last Sync Results */}
      {lastResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{lastResult.success}</div>
              <div className="text-sm text-green-600">Clinics Updated</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{lastResult.failed}</div>
              <div className="text-sm text-red-600">Failed to Update</div>
            </div>
          </div>

          {/* Error Details */}
          {lastResult.errors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Sync Errors:</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                {lastResult.errors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">What gets synced:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Operating hours</li>
          <li>• Phone numbers and websites</li>
          <li>• Photos and ratings</li>
          <li>• Business status</li>
        </ul>
        <p className="text-xs text-blue-700 mt-2">
          Automatic sync runs daily at 2 AM
        </p>
      </div>
    </div>
  );
}