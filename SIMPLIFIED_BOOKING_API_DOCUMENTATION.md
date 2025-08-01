# Simplified Booking & Appointment APIs Documentation

## Base URL
```
https://api.yourdomain.com/api/v1
```

## Authentication
Most endpoints require authentication. Include the JWT token in the request:
```
Authorization: Bearer <jwt_token>
```
Or via cookie: `patient_token=<jwt_token>`

---

## 🩺 **APPOINTMENT WORKFLOW ENDPOINTS**
*Request-response based appointment booking*

### 1. Request Appointment
**Endpoint:** `POST /appointments/request`
**Auth Required:** ✅ Patient

**Request Body:**
```json
{
  "clinicId": "507f1f77bcf86cd799439011",
  "requestedDate": "2025-08-15T14:00:00Z",
  "requestedTime": "14:00",
  "duration": 30,
  "type": "consultation",
  "reason": "Routine dental checkup"
}
```

**Response:**
```json
{
  "success": true,
  "appointment": {
    "_id": "507f1f77bcf86cd799439013",
    "patient": "507f1f77bcf86cd799439012",
    "clinic": "507f1f77bcf86cd799439011",
    "status": "pending",
    "originalRequest": {
      "requestedDate": "2025-08-15T14:00:00Z",
      "requestedTime": "14:00",
      "duration": 30,
      "reason": "Routine dental checkup"
    }
  },
  "message": "Appointment request sent successfully"
}
```

### 2. Clinic Response to Request
**Endpoint:** `POST /appointments/{appointmentId}/clinic-response`
**Auth Required:** ✅ Clinic Staff

**Request Body:**
```json
{
  "responseType": "counter-offer",
  "proposedDate": "2025-08-15T15:00:00Z",
  "proposedTime": "15:00",
  "proposedDuration": 30,
  "message": "We have availability at 3 PM instead. Would this work for you?"
}
```

**Response Types:**
- `"confirmation"` - Accept the original request
- `"counter-offer"` - Suggest alternative time
- `"rejection"` - Decline the request

### 3. Patient Response to Counter-Offer
**Endpoint:** `POST /appointments/{appointmentId}/patient-response`
**Auth Required:** ✅ Patient

**Request Body:**
```json
{
  "responseType": "accept",
  "message": "Yes, 3 PM works perfectly!"
}
```

**Response Types:**
- `"accept"` - Accept clinic's counter-offer
- `"reject"` - Decline counter-offer
- `"counter"` - Make another counter-offer

### 4. Get Patient's Requests
**Endpoint:** `GET /appointments/my-requests`
**Auth Required:** ✅ Patient

**Response:**
```json
{
  "success": true,
  "appointments": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "status": "counter-offered",
      "clinic": {
        "name": "Downtown Dental",
        "address": "123 Main St"
      },
      "originalRequest": {
        "requestedDate": "2025-08-15T14:00:00Z",
        "reason": "Routine checkup"
      },
      "clinicResponses": [
        {
          "responseType": "counter-offer",
          "proposedDate": "2025-08-15T15:00:00Z",
          "message": "Alternative time available"
        }
      ]
    }
  ]
}
```

### 5. Get Clinic's Requests
**Endpoint:** `GET /appointments/clinic-requests`
**Auth Required:** ✅ Clinic Staff

---

## 📋 **APPOINTMENT MANAGEMENT ENDPOINTS**

### 6. Create Direct Appointment
**Endpoint:** `POST /appointments`
**Auth Required:** ✅ Patient

**Request Body:**
```json
{
  "patient": "507f1f77bcf86cd799439012",
  "clinic": "507f1f77bcf86cd799439011",
  "appointmentDate": "2025-08-15T14:00:00Z",
  "duration": 30,
  "type": "consultation",
  "reason": "Emergency dental pain"
}
```

### 7. Get Appointment by ID
**Endpoint:** `GET /appointments/{appointmentId}`
**Auth Required:** ✅ Patient/Clinic

### 8. Update Appointment
**Endpoint:** `PUT /appointments/{appointmentId}`
**Auth Required:** ✅ Patient/Clinic

### 9. Cancel Appointment
**Endpoint:** `PATCH /appointments/{appointmentId}/cancel`
**Auth Required:** ✅ Patient/Clinic

**Request Body:**
```json
{
  "reason": "Unable to make it due to work emergency"
}
```

### 10. Delete Appointment
**Endpoint:** `DELETE /appointments/{appointmentId}`
**Auth Required:** ✅ Patient/Clinic

---

## 👤 **PATIENT-SPECIFIC ENDPOINTS**

### 11. Get Patient's All Appointments
**Endpoint:** `GET /appointments/patient/{patientId}/appointments`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `startDate` | string | From date |
| `endDate` | string | To date |

### 12. Get Upcoming Appointments
**Endpoint:** `GET /appointments/patient/{patientId}/upcoming`

### 13. Reschedule Appointment
**Endpoint:** `PATCH /appointments/{appointmentId}/reschedule`

**Request Body:**
```json
{
  "newDateTime": "2025-08-16T14:00:00Z",
  "reason": "Schedule conflict resolved"
}
```

---

## 🏥 **CLINIC MANAGEMENT ENDPOINTS**

### 14. Get Clinic's All Appointments
**Endpoint:** `GET /appointments/clinic/{clinicId}/appointments`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | string | Specific date |
| `status` | string | Filter by status |

### 15. Update Appointment Status
**Endpoint:** `PATCH /appointments/{appointmentId}/status`
**Auth Required:** ✅ Admin/Clinic

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Patient showed up on time. Cleaning completed successfully."
}
```

**Valid Statuses:**
- `pending` - Initial request status
- `counter-offered` - Alternative time suggested
- `confirmed` - Appointment confirmed
- `rejected` - Request declined
- `cancelled` - Appointment cancelled
- `completed` - Appointment finished

---

## 📊 **COMMON RESPONSE FORMAT**

All APIs follow this standard response format:

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 🚨 **HTTP Status Codes**

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 204 | Success with no content |
| 400 | Bad request / Validation error |
| 401 | Unauthorized / Authentication required |
| 403 | Forbidden / Access denied |
| 404 | Resource not found |
| 409 | Conflict / Appointment conflict |
| 500 | Internal server error |

## 🎯 **SIMPLIFIED BOOKING FLOW**

### Direct Appointment Request:
1. Patient: `POST /appointments/request` - Submit appointment request with preferred date/time
2. System: Send notification to clinic
3. Clinic: `POST /appointments/{id}/clinic-response` - Accept, counter-offer, or reject
4. Patient (if counter-offer): `POST /appointments/{id}/patient-response` - Accept or reject
5. Status becomes "confirmed" when both parties agree

### Key Changes:
- **Removed**: Availability checking endpoints
- **Removed**: Slot reservation system  
- **Removed**: Weekly availability overview
- **Simplified**: Direct appointment requests without pre-checking availability
- **Maintained**: Request-response negotiation workflow between patients and clinics

This simplified system focuses on the core appointment booking workflow without complex availability management.
