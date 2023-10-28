import { Route, Routes } from 'react-router-dom';
import React from 'react';
import Register from '../components/Auth/Register';
import OrdersTable from '../components/Orders/OrdersTable/OrdersTable';
import RecordOrder from '../components/Orders/RecordOrder/RecordOrder.jsx';
import Days from '../components/Days/Days.jsx';
import Areas from '../components/Areas/Areas';
import Customers from '../components/Customers/Customers';
import Addresses from '../components/Addresses/Addresses';
import AreasForDay from '../components/Areas/AreasForDay';
import CustomersForArea from '../components/Customers/CustomersForArea';
import AddArea from '../components/Areas/AddArea';
import Login from '../components/Auth/Login';
import LandingPage from '../components/LandingPage/LandingPage';

function UserRouter() {
  return (
    <>
      <div className="userRouter">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/viewOrders" element={<OrdersTable />} />
          <Route path="/recordOrder" element={<RecordOrder />} />
          <Route path="/days" element={<Days />} />
          <Route path="/areas" element={<Areas />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/addresses/:areaId" element={<Addresses />} />
          <Route path="/areas/:dayId" element={<AreasForDay />} />
          <Route path="/customers/:areaId" element={<CustomersForArea />} />
          <Route path="/areas/add" element={<AddArea />} />
          <Route path="/login" element={<Login />} />
          <Route index element={<LandingPage />} />
        </Routes>
      </div>
    </>
  );
}

export default UserRouter;
