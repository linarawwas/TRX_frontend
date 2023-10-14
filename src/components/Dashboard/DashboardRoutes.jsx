// DashboardRoutes.jsx
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Dashboard from './Dashboard';
import BottlesTable from './BottlesTable';
import DaysTable from './DaysTable';
import AreaTable from './AreaTable';
import CustomerTable from './CustomerTable';

const DashboardRoutes = () => (
  <Routes>
    <Route path="/" element={<Dashboard />}>
      <Route index element={<Outlet />} />
      <Route path="bottles" element={<BottlesTable />} />
      <Route path="days" element={<DaysTable />} />
      <Route path="area" element={<AreaTable />} />
      <Route path="customer" element={<CustomerTable />} />
    </Route>
  </Routes>
);

export default DashboardRoutes;
