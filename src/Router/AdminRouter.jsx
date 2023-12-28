import { Route, Routes } from 'react-router-dom';
import React from 'react';
import Register from '../components/Auth/Register.tsx';
import OrdersTable from '../components/Orders/OrdersTable/OrdersTable.tsx';
import RecordOrder from '../components/Orders/RecordOrder/RecordOrder.jsx';
import Days from '../components/Days/Days.tsx';
import Areas from '../components/Areas/Areas/Areas.tsx';
import Customers from '../components/Customers/viewCustomers/Customers.tsx';
import Addresses from '../components/Addresses/Addresses.tsx';
import AreasForDay from '../components/Areas/AreasForDay/AreasForDay.tsx'
import CustomersForArea from '../components/Customers/CustomersForArea/CustomersForArea.tsx';
import AddArea from '../components/Areas/AddArea/AddArea.tsx';
import Login from '../components/Auth/Login.tsx';
import LandingPage from '../components/LandingPage/LandingPage.tsx';
import UpdateOrder from '../components/Orders/UpdateOrder/UpdateOrder.tsx';
import UpdateCustomer from '../components/Customers/UpdateCustomer/UpdateCustomer.tsx';
import AddExpenses from '../components/Expenses/AddExpenses/AddExpenses.tsx';
import AddProfits from '../components/Profits/AddProfits/AddProfits.tsx';
import AddCustomers from '../components/Customers/AddCustomers/AddCustomers.tsx';
import ShipmentsList from '../components/Shipment/ShipmentsList.tsx';
import ExtraProfits from '../components/Profits/ViewProfits/ViewProfits.tsx';
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
          <Route path="/currentShipment" element={<ShipmentsList />} />
          <Route path="/Profits" element={<ExtraProfits />} />
        </Routes>
      </div>
    </>
  );
}

export default AdminRouter;
