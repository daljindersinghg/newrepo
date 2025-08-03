// Hook for using app configuration in React components
'use client';

import { 
  getGiftCardAmount,
  getGiftCardText, 
  getFullGiftCardText,
  getGiftCardMessage 
} from '@/lib/config/app-config';

export const useAppConfig = () => {
  return {
    // Simple gift card functions
    giftCard: {
      amount: getGiftCardAmount(),        // Returns "$50"
      text: getGiftCardText(),           // Returns "gift card"
      full: getFullGiftCardText(),       // Returns "$50 gift card"
      getMessage: getGiftCardMessage,    // Function for different contexts
    },
  };
};
