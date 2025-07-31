'use client';

import { useSearchHistory } from '@/hooks/useSearchHistory';
import { usePatientAuth } from '@/hooks/usePatientAuth';

export function LocalStorageDebug() {
  const { searchHistory, clearSearchHistory, hasSearchHistory, getRecentSearches } = useSearchHistory();
  const { patientInfo, isAuthenticated } = usePatientAuth();

  const clearAllData = () => {
    clearSearchHistory();
    localStorage.removeItem('patientInfo');
    window.location.reload();
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-xs z-50">
      <h3 className="font-bold text-sm mb-3">LocalStorage Debug</h3>
      
      <div className="space-y-3 text-xs">
        {/* Authentication Status */}
        <div>
          <strong>Auth Status:</strong>
          <div className="bg-gray-100 p-2 rounded mt-1">
            {isAuthenticated ? (
              <div>
                <div>✅ Authenticated</div>
                <div>Name: {patientInfo?.name}</div>
                <div>Email: {patientInfo?.email}</div>
              </div>
            ) : (
              <div>❌ Not authenticated</div>
            )}
          </div>
        </div>

        {/* Search History */}
        <div>
          <strong>Search History:</strong>
          <div className="bg-gray-100 p-2 rounded mt-1">
            {hasSearchHistory() ? (
              <div>
                <div>📍 {searchHistory.locations.length} searches</div>
                <div className="mt-1">
                  {getRecentSearches(2).map((search, i) => (
                    <div key={i} className="text-xs truncate">
                      • {search.address.substring(0, 30)}...
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>📍 No searches</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={clearSearchHistory}
            className="px-2 py-1 bg-yellow-500 text-white text-xs rounded"
            disabled={!hasSearchHistory()}
          >
            Clear Searches
          </button>
          <button
            onClick={clearAllData}
            className="px-2 py-1 bg-red-500 text-white text-xs rounded"
          >
            Clear All
          </button>
        </div>

        {/* Storage Size */}
        <div className="text-xs text-gray-500">
          {/* Storage: {JSON.stringify(localStorage).length} bytes */}
        </div>
      </div>
    </div>
  );
}
