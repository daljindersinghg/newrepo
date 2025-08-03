# Gift Card Configuration

This app has a centralized configuration system for the gift card feature that allows you to change the amount and text in one place.

## How to Change Gift Card Settings

### 📍 Location: `/app/lib/config/app-config.ts`

### ✏️ What to Change:

```typescript
// ===== CONFIGURABLE VARIABLES =====
export const GIFT_CARD_AMOUNT = 50;           // Change this number to update amount
export const GIFT_CARD_TEXT = "gift card";    // Change this text (e.g., "Amazon gift card", "gift card", etc.)
```

### 🔄 Examples:

**To change to $25 Amazon gift card:**
```typescript
export const GIFT_CARD_AMOUNT = 25;
export const GIFT_CARD_TEXT = "Amazon gift card";
```

**To change to $100 Visa gift card:**
```typescript
export const GIFT_CARD_AMOUNT = 100;
export const GIFT_CARD_TEXT = "Visa gift card";
```

### 📍 What Gets Updated Automatically:

When you change these two variables, the following will be updated throughout the entire app:

- All page titles and meta descriptions
- Email capture modals
- Landing page features and CTAs
- Footer text
- Authentication modals
- Clinic results pages
- Trust section testimonials

### 🛠️ How It Works:

The configuration uses these helper functions:
- `getGiftCardAmount()` - Returns "$50" format
- `getGiftCardText()` - Returns "gift card"
- `getFullGiftCardText()` - Returns "$50 gift card"
- `getGiftCardMessage(context)` - Returns contextual messages

### 🔧 For Developers:

To use in React components:
```typescript
import { useAppConfig } from '@/hooks/useAppConfig';

const { giftCard } = useAppConfig();
// giftCard.amount = "$50"
// giftCard.text = "gift card"  
// giftCard.full = "$50 gift card"
```

For non-React files:
```typescript
import { getFullGiftCardText } from '@/lib/config/app-config';
const text = getFullGiftCardText(); // "$50 gift card"
```
