import { RequireAdmin } from '@/components/RequireAdmin';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './admin/Dashboard';
import Orders from './admin/Orders';
import Discounts from './admin/Discounts';
import Banners from './admin/Banners';

export default function Admin() {
  return (
    <RequireAdmin>
      <AdminLayout>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="discounts" element={<Discounts />} />
          <Route path="banners" element={<Banners />} />
        </Routes>
      </AdminLayout>
    </RequireAdmin>
  );
}
