// app/admin/dashboard/page.tsx
import { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard | DentalCare+',
  description: 'Administrative dashboard for managing the DentalCare+ platform',
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}