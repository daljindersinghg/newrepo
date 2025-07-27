# Mongoose Schemas for DentistMe API

This directory contains all the Mongoose schemas for the DentistMe application. The schemas are designed using TypeScript interfaces and follow a clean separation between different user types.

## Models Overview

### Core User Models
- **Patient.ts** - Patient users who book appointments
- **Doctor.ts** - Dentist users who provide services
- **Admin.ts** - Administrative users who manage the system

### Supporting Models
- **Clinic.ts** - Dental clinics/practices
- **Appointment.ts** - Scheduled appointments
- **Treatment.ts** - Treatment records and procedures
- **Review.ts** - Patient reviews and ratings

## Usage Examples

### Importing Models

```typescript
import { Patient, Doctor, Admin, Clinic, Appointment } from './models';

// Or import specific interfaces
import { IPatient, IDoctor } from './models';
```

### Creating a New Patient

```typescript
import { Patient } from './models';

const newPatient = new Patient({
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'hashedPassword123',
  phone: '+1234567890',
  address: '123 Main St, City, State',
  insurance: {
    provider: 'Blue Cross',
    policyNumber: 'BC123456'
  },
  referralCode: 'JOHN2024'
});

await newPatient.save();
```

### Creating a Doctor

```typescript
import { Doctor } from './models';

const newDoctor = new Doctor({
  name: 'Dr. Jane Smith',
  email: 'dr.smith@dentist.com',
  password: 'hashedPassword123',
  specialties: ['General Dentistry', 'Cosmetic Dentistry'],
  acceptedInsurance: ['Blue Cross', 'Aetna', 'Cigna'],
  location: {
    type: 'Point',
    coordinates: [-74.0059, 40.7128] // [longitude, latitude] for NYC
  },
  hours: {
    monday: '9:00 AM - 5:00 PM',
    tuesday: '9:00 AM - 5:00 PM',
    wednesday: '9:00 AM - 5:00 PM',
    thursday: '9:00 AM - 5:00 PM',
    friday: '9:00 AM - 3:00 PM'
  }
});

await newDoctor.save();
```

### Creating an Appointment

```typescript
import { Appointment } from './models';

const appointment = new Appointment({
  patient: patientId,
  doctor: doctorId,
  clinic: clinicId,
  appointmentDate: new Date('2024-12-25T10:00:00Z'),
  duration: 60, // 60 minutes
  type: 'consultation',
  reason: 'Regular checkup',
  estimatedCost: 150
});

await appointment.save();
```

### Querying with Population

```typescript
// Get appointments with patient and doctor details
const appointments = await Appointment.find({ clinic: clinicId })
  .populate('patient', 'name email phone')
  .populate('doctor', 'name specialties')
  .populate('clinic', 'name address')
  .sort({ appointmentDate: 1 });

// Find doctors near a location
const nearbyDoctors = await Doctor.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [-74.0059, 40.7128] // [lng, lat]
      },
      $maxDistance: 10000 // 10km in meters
    }
  }
});
```

### Creating Reviews

```typescript
import { Review } from './models';

const review = new Review({
  patient: patientId,
  doctor: doctorId,
  clinic: clinicId,
  appointment: appointmentId,
  rating: 5,
  title: 'Excellent service!',
  comment: 'Dr. Smith was very professional and thorough.',
  categories: {
    cleanliness: 5,
    staff: 5,
    waitTime: 4,
    treatment: 5,
    value: 4
  },
  isAnonymous: false,
  isPublic: true
});

await review.save();
```

## Features

### 1. Geospatial Indexing
Both `Doctor` and `Clinic` models include location fields with 2dsphere indexing for efficient location-based queries.

### 2. Automatic Timestamps
All models automatically update the `updatedAt` field when saved using Mongoose pre-save hooks.

### 3. Referential Integrity
Models use ObjectId references with proper `ref` attributes for population.

### 4. Comprehensive Indexing
Strategic indexes are created for frequently queried fields to optimize performance.

### 5. TypeScript Support
Full TypeScript interfaces provide type safety and better development experience.

## Environment Setup

Make sure your `.env` file includes:

```env
MONGODB_URI=mongodb://localhost:27017/dentistme
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dentistme
```

## Next Steps

1. **Authentication**: Implement JWT or session-based authentication
2. **Validation**: Add Zod schemas for request validation
3. **API Routes**: Create Express routes for CRUD operations
4. **Middleware**: Add authentication and authorization middleware
5. **Testing**: Write unit and integration tests for models
