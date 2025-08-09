// App Configuration
// CHANGE THESE TWO VALUES TO UPDATE THROUGHOUT THE ENTIRE APP

// ===== CONFIGURABLE VARIABLES =====
export const GIFT_CARD_AMOUNT = 50;           // Change this number to update amount
export const GIFT_CARD_TEXT = "gift card";    // Change this text (e.g., "Amazon gift card", "gift card", etc.)

// ===== NOTIFICATION SETTINGS =====
export const AUTO_ENABLE_CLINIC_NOTIFICATIONS = false;  // DISABLED - Auto-enable notifications for clinics
export const AUTO_ENABLE_PATIENT_NOTIFICATIONS = false; // DISABLED - Auto-enable notifications for patients

// ===== AUTO-GENERATED VALUES (Don't change these) =====
export const getGiftCardAmount = () => `$${GIFT_CARD_AMOUNT}`;
export const getGiftCardText = () => GIFT_CARD_TEXT;
export const getFullGiftCardText = () => `${getGiftCardAmount()} ${getGiftCardText()}`;

// Helper functions for different contexts
export const getGiftCardMessage = (context: 'signup' | 'booking' | 'general' = 'general') => {
  const amount = getGiftCardAmount();
  const cardText = getGiftCardText();
  
  switch (context) {
    case 'signup':
      return `Get ${amount} ${cardText} after your first appointment`;
    case 'booking':
      return `Receive a ${amount} ${cardText} after your first appointment when you book through our platform`;
    case 'general':
    default:
      return `${amount} ${cardText}`;
  }
};
