# Database Schema Documentation

## 1. Admin Schema

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `_id` | ObjectId | Auto | Auto-generated | - | Unique identifier |
| `name` | String | ✅ | - | - | Admin's full name |
| `email` | String | ✅ | - | Unique, Email format | Admin login email |
| `phone` | String | ❌ | - | - | Contact phone number |
| `password` | String | ✅ | - | Hashed with bcrypt | Login password |
| `roles` | String[] | ❌ | - | Enum: ['superadmin', 'staff'] | Admin role permissions |
| `createdAt` | Date | Auto | Date.now | - | Creation timestamp |
| `updatedAt` | Date | Auto | Date.now | Auto-update on save | Last update timestamp |

**Indexes:**
- `email`: Unique index for login

**Methods:**
- `comparePassword(password: string): Promise<boolean>`
- `getJWTToken(): string`

---

## 2. Clinic Schema

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `_id` | ObjectId | Auto | Auto-generated | - | Unique identifier |
| `name` | String | ✅ | - | Trimmed | Clinic business name |
| `address` | String | ✅ | - | Trimmed | Full street address |
| `phone` | String | ✅ | - | Trimmed | Primary contact number |
| `email` | String | ✅ | - | Unique, Lowercase, Trimmed | Business email |
| `website` | String | ❌ | - | Trimmed | Website URL |
| `services` | String[] | ✅ | - | Min length: 1 | Available dental services |
| `location` | GeoJSON | ❌ | - | Point coordinates [lng, lat] | GPS coordinates (future use) |
| `createdAt` | Date | Auto | Date.now | - | Creation timestamp |
| `updatedAt` | Date | Auto | Date.now | Auto-update on save | Last update timestamp |

**Indexes:**
- `email`: Unique index
- `location`: 2dsphere index (for geo queries)

**Sample Services:**
- General Dentistry, Teeth Cleaning, Fillings, Extractions, Crowns, Root Canal, Orthodontics, Cosmetic Dentistry

---

## 3. Doctor Schema

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `_id` | ObjectId | Auto | Auto-generated | - | Unique identifier |
| `name` | String | ✅ | - | Trimmed | Doctor's full name |
| `email` | String | ✅ | - | Unique, Lowercase, Trimmed | Login email |
| `phone` | String | ✅ | - | Trimmed | Contact number |
| `password` | String | ✅ | - | Min 6 chars, Hashed | Login password |
| `clinic` | ObjectId | ✅ | - | References Clinic | Associated clinic |
| `specialties` | String[] | ✅ | - | Min length: 1 | Medical specialties |
| `bio` | String | ❌ | - | Trimmed | Professional biography |
| `status` | String | ❌ | 'pending' | Enum: ['active', 'pending', 'suspended'] | Account status |
| `verified` | Boolean | ❌ | false | - | Professional verification |
| `createdAt` | Date | Auto | Date.now | - | Creation timestamp |
| `updatedAt` | Date | Auto | Date.now | Auto-update on save | Last update timestamp |

**Indexes:**
- `email`: Unique index
- `clinic`: Index for clinic queries
- `status`: Index for status filtering

**Methods:**
- `comparePassword(password: string): Promise<boolean>`

**Sample Specialties:**
- General Dentistry, Orthodontics, Oral Surgery, Periodontics, Endodontics, Pediatric Dentistry, Cosmetic Dentistry, Prosthodontics

---

## 4. Patient Schema

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `_id` | ObjectId | Auto | Auto-generated | - | Unique identifier |
| `name` | String | ✅ | - | - | Patient's full name |
| `email` | String | ✅ | - | Unique | Contact email |
| `phone` | String | ❌ | - | - | Contact phone |
| `password` | String | ✅ | - | - | Login password |
| `address` | String | ❌ | - | - | Home address |
| `insurance` | Object | ❌ | - | - | Insurance information |
| `insurance.provider` | String | ❌ | - | - | Insurance company |
| `insurance.policyNumber` | String | ❌ | - | - | Policy ID number |
| `referralCode` | String | ❌ | - | Unique | Patient's referral code |
| `referredBy` | String | ❌ | - | - | Referrer's code |
| `createdAt` | Date | Auto | Date.now | - | Creation timestamp |
| `updatedAt` | Date | Auto | Date.now | Auto-update on save | Last update timestamp |

**Indexes:**
- `email`: Unique index
- `referralCode`: Unique index (if provided)

---

## 5. Appointment Schema

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `_id` | ObjectId | Auto | Auto-generated | - | Unique identifier |
| `patient` | ObjectId | ✅ | - | References Patient | Patient booking |
| `doctor` | ObjectId | ✅ | - | References Doctor | Assigned doctor |
| `clinic` | ObjectId | ✅ | - | References Clinic | Clinic location |
| `appointmentDate` | Date | ✅ | - | - | Scheduled date/time |
| `duration` | Number | ❌ | 30 | Minutes | Appointment length |
| `status` | String | ❌ | 'scheduled' | Enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'] | Current status |
| `type` | String | ✅ | - | Enum: ['consultation', 'cleaning', 'procedure', 'emergency', 'follow-up'] | Appointment type |
| `notes` | String | ❌ | - | - | Additional notes |
| `reason` | String | ❌ | - | - | Visit reason |
| `insuranceClaim` | Object | ❌ | - | - | Insurance details |
| `insuranceClaim.claimNumber` | String | ❌ | - | - | Claim ID |
| `insuranceClaim.approved` | Boolean | ❌ | - | - | Approval status |
| `insuranceClaim.coverageAmount` | Number | ❌ | - | - | Covered amount |
| `estimatedCost` | Number | ❌ | - | - | Estimated price |
| `actualCost` | Number | ❌ | - | - | Final price |
| `reminderSent` | Boolean | ❌ | false | - | Reminder status |
| `reminderDate` | Date | ❌ | - | - | When reminder sent |
| `createdAt` | Date | Auto | Date.now | - | Creation timestamp |
| `updatedAt` | Date | Auto | Date.now | Auto-update on save | Last update timestamp |

**Indexes:**
- `patient + appointmentDate`: Compound index
- `doctor + appointmentDate`: Compound index
- `clinic + appointmentDate`: Compound index
- `status`: Index for status queries

---

## 6. Treatment Schema

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `_id` | ObjectId | Auto | Auto-generated | - | Unique identifier |
| `appointment` | ObjectId | ✅ | - | References Appointment | Related appointment |
| `patient` | ObjectId | ✅ | - | References Patient | Patient treated |
| `doctor` | ObjectId | ✅ | - | References Doctor | Treating doctor |
| `treatmentName` | String | ✅ | - | - | Treatment title |
| `description` | String | ❌ | - | - | Detailed description |
| `category` | String | ✅ | - | Enum: ['preventive', 'restorative', 'cosmetic', 'surgical', 'orthodontic', 'periodontal'] | Treatment category |
| `procedures` | Array | ✅ | - | - | List of procedures |
| `procedures[].name` | String | ✅ | - | - | Procedure name |
| `procedures[].code` | String | ❌ | - | - | Dental procedure code |
| `procedures[].cost` | Number | ✅ | - | - | Procedure cost |
| `procedures[].completed` | Boolean | ❌ | false | - | Completion status |
| `procedures[].notes` | String | ❌ | - | - | Procedure notes |
| `totalCost` | Number | ✅ | - | - | Total treatment cost |
| `insuranceCovered` | Number | ❌ | 0 | - | Insurance coverage |
| `patientPaid` | Number | ❌ | 0 | - | Patient payment |
| `startDate` | Date | ✅ | - | - | Treatment start |
| `completionDate` | Date | ❌ | - | - | Treatment completion |
| `followUpRequired` | Boolean | ❌ | false | - | Follow-up needed |
| `followUpDate` | Date | ❌ | - | - | Follow-up date |
| `status` | String | ❌ | 'planned' | Enum: ['planned', 'in-progress', 'completed', 'cancelled'] | Treatment status |
| `preConditions` | String[] | ❌ | - | - | Pre-existing conditions |
| `postInstructions` | String | ❌ | - | - | Post-treatment care |
| `complications` | String | ❌ | - | - | Any complications |
| `createdAt` | Date | Auto | Date.now | - | Creation timestamp |
| `updatedAt` | Date | Auto | Date.now | Auto-update on save | Last update timestamp |

**Indexes:**
- `patient + startDate`: Compound index (descending)
- `doctor + startDate`: Compound index (descending)
- `status`: Index for status queries

---

## 7. Review Schema

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `_id` | ObjectId | Auto | Auto-generated | - | Unique identifier |
| `patient` | ObjectId | ✅ | - | References Patient | Reviewer |
| `doctor` | ObjectId | ✅ | - | References Doctor | Reviewed doctor |
| `clinic` | ObjectId | ✅ | - | References Clinic | Reviewed clinic |
| `appointment` | ObjectId | ❌ | - | References Appointment | Related appointment |
| `rating` | Number | ✅ | - | Min: 1, Max: 5 | Overall star rating |
| `title` | String | ❌ | - | - | Review title |
| `comment` | String | ❌ | - | - | Review text |
| `categories` | Object | ❌ | - | - | Category-specific ratings |
| `categories.cleanliness` | Number | ❌ | - | Min: 1, Max: 5 | Cleanliness rating |
| `categories.staff` | Number | ❌ | - | Min: 1, Max: 5 | Staff rating |
| `categories.waitTime` | Number | ❌ | - | Min: 1, Max: 5 | Wait time rating |
| `categories.treatment` | Number | ❌ | - | Min: 1, Max: 5 | Treatment rating |
| `categories.value` | Number | ❌ | - | Min: 1, Max: 5 | Value rating |
| `isAnonymous` | Boolean | ❌ | false | - | Anonymous review |
| `isVerified` | Boolean | ❌ | false | - | Verified reviewer |
| `response` | Object | ❌ | - | - | Provider response |
| `response.text` | String | ❌ | - | - | Response text |
| `response.respondedBy` | ObjectId | ❌ | - | References Doctor/Admin | Responder |
| `response.respondedByModel` | String | ❌ | - | Enum: ['Doctor', 'Admin'] | Responder type |
| `response.respondedAt` | Date | ❌ | - | - | Response date |
| `isPublic` | Boolean | ❌ | true | - | Public visibility |
| `isApproved` | Boolean | ❌ | false | - | Admin approval |
| `createdAt` | Date | Auto | Date.now | - | Creation timestamp |
| `updatedAt` | Date | Auto | Date.now | Auto-update on save | Last update timestamp |

**Indexes:**
- `doctor + isPublic + isApproved`: Compound index
- `clinic + isPublic + isApproved`: Compound index
- `patient`: Index for patient queries
- `rating`: Index for rating queries
- `patient + appointment`: Unique compound index

---

## Relationships Summary

```
Admin (1) -----> (∞) [manages] -----> Clinics
Admin (1) -----> (∞) [manages] -----> Doctors

Clinic (1) -----> (∞) Doctors
Clinic (1) -----> (∞) Appointments

Doctor (∞) -----> (1) Clinic
Doctor (1) -----> (∞) Appointments
Doctor (1) -----> (∞) Treatments
Doctor (1) -----> (∞) Reviews

Patient (1) -----> (∞) Appointments
Patient (1) -----> (∞) Treatments
Patient (1) -----> (∞) Reviews

Appointment (∞) -----> (1) Patient
Appointment (∞) -----> (1) Doctor
Appointment (∞) -----> (1) Clinic
Appointment (1) -----> (∞) Treatments

Treatment (∞) -----> (1) Appointment
Treatment (∞) -----> (1) Patient
Treatment (∞) -----> (1) Doctor

Review (∞) -----> (1) Patient
Review (∞) -----> (1) Doctor
Review (∞) -----> (1) Clinic
Review (∞) -----> (1) Appointment [optional]
```