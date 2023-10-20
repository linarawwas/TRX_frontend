import { Route, Routes } from 'react-router-dom';
import React from 'react';
import Register from '../components/Auth/Register';
import BottlesTable from '../components/Bottles/BottlesTable';
import RecordOrder from '../components/Bottles/RecordOrder.jsx';
import Days from '../components/Days/Days.jsx';
import Areas from '../components/Areas/Areas';
import Customers from '../components/Customers/Customers';
import Addresses from '../components/Addresses/Addresses';
import AreasForDay from '../components/Areas/AreasForDay';
import CustomersForArea from '../components/Customers/CustomersForArea';
import AddArea from '../components/Areas/AddArea';
import Login from '../components/Auth/Login';
import Layout from '../Layout/Layout';

function UserRouter() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/viewOrders" element={<BottlesTable />} />
      <Route path="/recordOrder" element={<RecordOrder />} />
      <Route path="/days" element={<Days />} />
      <Route path="/areas" element={<Areas />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/addresses/:areaId" element={<Addresses />} />
      <Route path="/areas/:dayId" element={<AreasForDay />} />
      <Route path="/customers/:areaId" element={<CustomersForArea />} />
      <Route path="/areas/add" element={<AddArea />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />} />
    </Routes>
  );
}

export default UserRouter;
