// api/src/models/index.ts
// Export only the models we're keeping for Phase 1
export { default as Patient, IPatient } from './Patient';
export { default as Admin, IAdmin } from './Admin';
export { default as Clinic, IClinic } from './Clinic';
export { Appointment, IAppointment } from './Appointment';
export { Notification, INotification } from './Notification';
export { default as Receipt, IReceipt } from './receipt.model';