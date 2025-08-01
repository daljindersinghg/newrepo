// app/admin/page.tsx
'use client';

import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminAuthProvider } from '@/providers/AdminAuthProvider';

export default function AdminPage() {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminDashboard />
      </div>
    </AdminAuthProvider>
  );
}
