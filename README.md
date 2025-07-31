# DentalCare+ Platform

A comprehensive dental care platform with 2-step OTP authentication, clinic search, and appointment booking.

## Features

- 🔐 **Secure Authentication**: 2-step OTP-based signup and login (no Google auth)
- 🔍 **Smart Search**: Location-based dentist search with search history
- 📱 **User-Friendly Interface**: Translucent modals with glassmorphism design
- 🗄️ **Data Persistence**: Smart localStorage management for user data and search history
- 🚀 **Modern Tech Stack**: Next.js 15, React 19, TypeScript, Express.js, MongoDB

## LocalStorage Data Management

This application uses localStorage to enhance user experience by persisting data across sessions. Below is a comprehensive documentation of all localStorage keys and their usage:

### 🔐 Authentication Data

#### `patientInfo`
**Purpose**: Stores authenticated patient information
**Structure**:
```typescript
interface PatientInfo {
  name: string;           // Patient's full name
  email: string;          // Patient's email address
  phone: string;          // Patient's phone number
  isAuthenticated: boolean; // Authentication status
  signupCompletedAt?: string; // ISO timestamp of signup completion
  loginDate?: string;     // ISO timestamp of last login
}
```

**When set**: 
- After successful signup (step 2 completion)
- After successful login (step 2 completion)

**When cleared**: 
- On user logout
- On authentication errors

**Usage locations**:
- `usePatientAuth` hook for state management
- Header component for displaying user profile
- Authentication forms for post-auth actions

---

### 🔍 Search & Location Data

#### `searchHistory`
**Purpose**: Stores user's search history for dentist locations
**Structure**:
```typescript
interface SearchHistory {
  locations: SearchLocation[];  // Array of past searches (max 10)
  lastSearch?: SearchLocation;  // Most recent search
}

interface SearchLocation {
  address: string;        // Full formatted address
  lat: number;           // Latitude coordinate
  lng: number;           // Longitude coordinate
  searchDate: string;    // ISO timestamp of search
  place_id?: string;     // Google Places ID (optional)
}
```

**When set**: 
- Every time user performs a new location search
- Automatically migrates from legacy `searchLocation` format

**When cleared**: 
- User manually clears search history
- On data corruption/parsing errors

**Usage locations**:
- `useSearchHistory` hook for search management
- `EnhancedSearchHero` component for recent searches display
- Results page for "return to search" functionality

#### `searchLocation` (Legacy - maintained for compatibility)
**Purpose**: Current/active search location for results page
**Structure**:
```typescript
interface LegacySearchLocation {
  address: string;  // Full formatted address
  lat: number;     // Latitude coordinate
  lng: number;     // Longitude coordinate
}
```

**When set**: 
- On new search (automatically synced with searchHistory)
- When returning to previous search

**When cleared**: 
- When returning to search page
- Automatically migrated to new searchHistory format

**Usage locations**:
- `ClinicResults` component for loading search context
- Backward compatibility with existing search flow

---

### 🛠️ Technical Implementation

#### LocalStorage Hooks

**`usePatientAuth`**
- Manages patient authentication state
- Handles login/logout operations
- Syncs with HTTP-only cookies for security
- Auto-clears on storage corruption

**`useSearchHistory`**
- Manages search history and recent searches
- Limits storage to 10 recent searches
- Handles legacy data migration
- Provides utility functions for search management

#### Data Persistence Strategy

1. **Authentication Data**: 
   - Stored only after successful authentication
   - Cleared on logout for security
   - Synced with server-side JWT cookies

2. **Search Data**: 
   - Persisted for improved UX
   - Limited to prevent storage bloat
   - Gracefully handles data corruption

3. **Error Handling**: 
   - Try-catch blocks around all localStorage operations
   - Automatic cleanup of corrupted data
   - Fallback to default states on errors

#### Browser Compatibility

- Uses standard `localStorage` API (supported in all modern browsers)
- Graceful degradation when localStorage is unavailable
- No critical functionality depends solely on localStorage

---

### 🔧 Development Notes

#### Adding New LocalStorage Data

When adding new localStorage keys:

1. **Define TypeScript interface** for type safety
2. **Create dedicated hook** for state management  
3. **Add error handling** for data corruption
4. **Update this documentation** with new key details
5. **Consider data migration** for existing users

#### Testing LocalStorage

```typescript
// Example test utilities
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});
```

#### Security Considerations

- **Sensitive data**: Never store passwords, tokens, or PII beyond what's necessary
- **Data validation**: Always validate localStorage data before using
- **Cleanup**: Clear sensitive data on logout/errors
- **Size limits**: Monitor localStorage usage to prevent quota exceeded errors

---

### 📊 Current Storage Usage

| Key | Type | Max Size | Cleanup Strategy |
|-----|------|----------|------------------|
| `patientInfo` | Object | ~500B | On logout |
| `searchHistory` | Object | ~2KB | 10 item limit |
| `searchLocation` | Object | ~200B | Legacy migration |

**Total estimated usage**: ~3KB (well within typical 5-10MB localStorage limits)

---

### 🚀 Future Enhancements

Planned improvements for localStorage usage:

- [ ] Encrypted storage for sensitive data
- [ ] Compression for large datasets
- [ ] Background sync with server
- [ ] Offline-first capabilities
- [ ] Cross-tab state synchronization

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Google Places API key (for location services)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd newrepo
```

2. **Install dependencies**
```bash
# Backend
cd api && npm install

# Frontend
cd ../app && npm install
```

3. **Environment Setup**
```bash
# Backend (.env)
DATABASE_URL=mongodb://localhost:27017/dentalcare
JWT_SECRET=your-jwt-secret
GOOGLE_PLACES_API_KEY=your-google-places-api-key

# Frontend (.env)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

4. **Start the applications**
```bash
# Backend (port 3001)
cd api && npm run dev

# Frontend (port 3000)
cd app && npm run dev
```

### Usage

1. **User Registration**: 2-step process with email + OTP verification
2. **Location Search**: Enter address to find nearby dentists
3. **Browse Results**: View dentist profiles and availability
4. **Book Appointments**: Secure booking with authenticated users

---

## Architecture

- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with HTTP-only cookies
- **API Communication**: Axios with centralized configuration
- **State Management**: React hooks with localStorage persistence

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow TypeScript and React best practices
4. Update localStorage documentation for any new data storage
5. Test localStorage functionality across browser sessions
6. Submit a pull request

---

## License

This project is licensed under the MIT License.
