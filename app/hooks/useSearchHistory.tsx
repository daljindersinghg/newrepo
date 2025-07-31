'use client';

import { useState, useEffect } from 'react';

interface SearchLocation {
  address: string;
  lat: number;
  lng: number;
  searchDate: string;
  place_id?: string;
}

interface SearchHistory {
  locations: SearchLocation[];
  lastSearch?: SearchLocation;
}

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistory>({ locations: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load search history from localStorage on mount
    const loadSearchHistory = () => {
      try {
        const stored = localStorage.getItem('searchHistory');
        if (stored) {
          const parsed = JSON.parse(stored);
          setSearchHistory(parsed);
        }

        // Also check for legacy searchLocation format
        const legacySearch = localStorage.getItem('searchLocation');
        if (legacySearch) {
          const legacyData = JSON.parse(legacySearch);
          const migrated: SearchHistory = {
            locations: [{
              address: legacyData.address,
              lat: legacyData.lat,
              lng: legacyData.lng,
              searchDate: new Date().toISOString()
            }],
            lastSearch: {
              address: legacyData.address,
              lat: legacyData.lat,
              lng: legacyData.lng,
              searchDate: new Date().toISOString()
            }
          };
          setSearchHistory(migrated);
          saveSearchHistory(migrated);
          localStorage.removeItem('searchLocation'); // Clean up legacy
        }
      } catch (error) {
        console.error('Error loading search history:', error);
        localStorage.removeItem('searchHistory');
        localStorage.removeItem('searchLocation');
      } finally {
        setIsLoading(false);
      }
    };

    loadSearchHistory();
  }, []);

  const saveSearchHistory = (history: SearchHistory) => {
    try {
      localStorage.setItem('searchHistory', JSON.stringify(history));
      setSearchHistory(history);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const addSearch = (location: Omit<SearchLocation, 'searchDate'>) => {
    const newSearch: SearchLocation = {
      ...location,
      searchDate: new Date().toISOString()
    };

    const updatedHistory: SearchHistory = {
      locations: [
        newSearch,
        ...searchHistory.locations.filter(l => 
          l.address !== newSearch.address || 
          Math.abs(l.lat - newSearch.lat) > 0.001 || 
          Math.abs(l.lng - newSearch.lng) > 0.001
        )
      ].slice(0, 10), // Keep only last 10 searches
      lastSearch: newSearch
    };

    saveSearchHistory(updatedHistory);
    
    // Also maintain the legacy searchLocation for compatibility
    localStorage.setItem('searchLocation', JSON.stringify({
      address: newSearch.address,
      lat: newSearch.lat,
      lng: newSearch.lng
    }));

    return newSearch;
  };

  const clearSearchHistory = () => {
    localStorage.removeItem('searchHistory');
    localStorage.removeItem('searchLocation');
    setSearchHistory({ locations: [] });
  };

  const getLastSearch = (): SearchLocation | null => {
    return searchHistory.lastSearch || null;
  };

  const hasSearchHistory = (): boolean => {
    return searchHistory.locations.length > 0;
  };

  const getRecentSearches = (limit: number = 5): SearchLocation[] => {
    return searchHistory.locations.slice(0, limit);
  };

  return {
    searchHistory,
    isLoading,
    addSearch,
    clearSearchHistory,
    getLastSearch,
    hasSearchHistory,
    getRecentSearches
  };
}
