import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Comprehensive logout utility that clears all authentication and user data
 * Use this function to ensure complete security on logout
 */
export function clearAllAuthData() {
  // Authentication-related keys to clear
  const authKeys = [
    'patientInfo',
    'clinicToken', 
    'clinicData',
    'adminToken',
    'adminData',
    'accessToken',
    'refreshToken',
    'authToken',
    'sessionToken'
  ];

  // User data keys to clear
  const userDataKeys = [
    'searchHistory',
    'searchLocation'
  ];

  // Clear all authentication data
  authKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
    }
  });

  // Clear all user data
  userDataKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
    }
  });

  console.log('All authentication and user data cleared from localStorage');
}

/**
 * Emergency logout function that clears everything and redirects to home
 */
export function emergencyLogout() {
  clearAllAuthData();
  window.location.href = '/';
}
