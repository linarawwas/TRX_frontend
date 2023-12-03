import { Route, Routes } from 'react-router-dom';
import React from 'react';
import Register from '../components/Auth/Register.jsx';
import OrdersTable from '../components/Orders/OrdersTable/OrdersTable.jsx';
import RecordOrder from '../components/Orders/RecordOrder/RecordOrder.jsx';
import Days from '../components/Days/Days.jsx';
import Areas from '../components/Areas/Areas/Areas.jsx';
import Customers from '../components/Customers/viewCustomers/Customers.jsx';
import Addresses from '../components/Addresses/Addresses.jsx';
import AreasForDay from '../components/Areas/AreasForDay/AreasForDay.jsx'
import CustomersForArea from '../components/Customers/CustomersForArea/CustomersForArea.jsx';
import AddArea from '../components/Areas/AddArea/AddArea.jsx';
import Login from '../components/Auth/Login.jsx';
import LandingPage from '../components/LandingPage/LandingPage.jsx';
import UpdateOrder from '../components/Orders/UpdateOrder/UpdateOrder.jsx';
import UpdateCustomer from '../components/Customers/UpdateCustomer/UpdateCustomer.jsx';
import AddExpenses from '../components/Expenses/AddExpenses/AddExpenses.jsx';
import AddProfits from '../components/Profits/AddProfits/AddProfits.jsx';
import AddCustomers from '../components/Customers/AddCustomers/AddCustomers.jsx';
function AdminRouter() {
  return (
    <>
      <div className="userRouter">
        <Routes>
          <Route index element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
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
          <Route path="/updateOrder/:orderId" element={<UpdateOrder />} />
          <Route path="/updateCustomer/:customerId" element={<UpdateCustomer />} />
          <Route path="/addExpenses" element={<AddExpenses />} />
          <Route path="/addCustomers" element={<AddCustomers />} />
          <Route path="/addProfits" element={<AddProfits />} />
        </Routes>
      </div>
    </>
  );
}

export default AdminRouter;
