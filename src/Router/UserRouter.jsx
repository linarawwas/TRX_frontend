import { Route, Routes } from 'react-router-dom';
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

function UserRouter(props) {
  return (
    <>
      <div className="userRouter">
        <Routes>
          <Route path="/register" element={<Register token={props.token} companyId={props.companyId} />} />
          <Route path="/viewOrders" element={<OrdersTable token={props.token} companyId={props.companyId} />} />
          <Route path="/recordOrder" element={<RecordOrder companyId={props.companyId} token={props.token} />} />
          <Route path="/days" element={<Days companyId={props.companyId} token={props.token} />} />
          <Route path="/areas" element={<Areas token={props.token} companyId={props.companyId} />} />
          <Route path="/customers" element={<Customers token={props.token} companyId={props.companyId} />} />
          <Route path="/addresses/:areaId" element={<Addresses token={props.token} companyId={props.companyId} />} />
          <Route path="/areas/:dayId" element={<AreasForDay token={props.token} companyId={props.companyId} />} />
          <Route path="/customers/:areaId" element={<CustomersForArea />} />
          <Route path="/areas/add" element={<AddArea token={props.token} companyId={props.companyId} />} />
          <Route path="/login" element={<Login />} />
          <Route index element={<LandingPage />} />
          <Route path="/updateOrder/:orderId" element={<UpdateOrder token={props.token} companyId={props.companyId} />} />
          <Route path="/updateCustomer/:customerId" element={<UpdateCustomer />} />
        </Routes>
      </div>
    </>
  );
}

export default UserRouter;
