import {Route, Routes } from 'react-router-dom';
import React from 'react';
import Register from '../components/Auth/Register';
import OrdersTable from '../components/Orders/OrdersTable/OrdersTable';
import RecordOrder from '../components/Orders/RecordOrder/RecordOrder.jsx';
import Days from '../components/Days/Days.jsx';
import Areas from '../components/Areas/Areas';
import Customers from '../components/Customers/viewCustomers/Customers';
import Addresses from '../components/Addresses/Addresses';
import AreasForDay from '../components/Areas/AreasForDay';
import CustomersForArea from '../components/Customers/CustomersForArea/CustomersForArea';
import AddArea from '../components/Areas/AddArea';
import Login from '../components/Auth/Login';
import LandingPage from '../components/LandingPage/LandingPage';
import UpdateOrder from '../components/Orders/UpdateOrder/UpdateOrder';
import UpdateCustomer from '../components/Customers/UpdateCustomer/UpdateCustomer';
import { useSelector } from 'react-redux';
function UserRouter() {
  const companyId = useSelector(state => state.companyId);
  const token = useSelector(state => state.token);
  return (
    <>
      <div className="userRouter">
        <Routes>
          <Route index element={<LandingPage token={token} companyId={companyId} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register token={token} companyId={companyId} />} />
          <Route path="/viewOrders" element={<OrdersTable token={token} companyId={companyId} />} />
          <Route path="/recordOrder" element={<RecordOrder companyId={companyId} token={token} />} />
          <Route path="/days" element={<Days companyId={companyId} token={token} />} />
          <Route path="/areas" element={<Areas token={token} companyId={companyId} />} />
          <Route path="/customers" element={<Customers token={token} companyId={companyId} />} />
          <Route path="/addresses/:areaId" element={<Addresses token={token} companyId={companyId} />} />
          <Route path="/areas/:dayId" element={<AreasForDay token={token} companyId={companyId} />} />
          <Route path="/customers/:areaId" element={<CustomersForArea token={token} companyId={companyId} />} />
          <Route path="/areas/add" element={<AddArea token={token} companyId={companyId} />} />
          <Route path="/updateOrder/:orderId" element={<UpdateOrder token={token} companyId={companyId} />} />
          <Route path="/updateCustomer/:customerId" element={<UpdateCustomer token={token} companyId={companyId} />} />
        </Routes>
      </div>
    </>
  );
}

export default UserRouter;
