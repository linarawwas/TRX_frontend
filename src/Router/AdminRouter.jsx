import { Route, Routes } from 'react-router-dom';
import Register from '../components/Auth/Register.tsx';
import OrdersTable from '../Pages/OrdersTable/OrdersTable.tsx';
import RecordOrder from '../components/Orders/RecordOrder/RecordOrder.jsx';
import Days from '../components/Days/Days.tsx';
import Areas from '../Pages/Areas/Areas.tsx';
import Customers from '../Pages/viewCustomers/Customers.tsx';
import Addresses from '../Pages/Addresses/Addresses.tsx';
import AreasForDay from '../Pages/AreasForDay/AreasForDay.tsx'
import CustomersForArea from '../Pages/CustomersForArea/CustomersForArea.tsx';
import AddArea from '../components/Areas/AddArea/AddArea.tsx';
import Login from '../components/Auth/Login.tsx';
import UpdateOrder from '../components/Orders/UpdateOrder/UpdateOrder.tsx';
import UpdateCustomer from '../components/Customers/UpdateCustomer/UpdateCustomer.tsx';
import AddExpenses from '../components/Expenses/AddExpenses/AddExpenses.tsx';
import AddProfits from '../components/Profits/AddProfits/AddProfits.tsx';
import AddCustomers from '../components/Customers/AddCustomers/AddCustomers.tsx';
import ShipmentsList from '../Pages/Shipment/ShipmentsList.tsx';
import ExtraProfits from '../Pages/ViewProfits/ViewProfits.tsx';
import Expenses from '../Pages/ViewExpenses/ViewExpenses.tsx';
import Products from '../Pages/ProductsList/Products.tsx';
import CustomerInfo from '../components/Customers/CustomerInfo/CustomerInfo.tsx';
import AdminLandingPage from '../Pages/AdminLandingPage/AdminLandingPage.tsx';
function AdminRouter() {
  return (
    <>
      <div className="userRouter">
        <Routes>
          <Route index element={<AdminLandingPage />} />
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
          <Route path="/customerInfo" element={<CustomerInfo />} />
          <Route path="/addProfits" element={<AddProfits />} />
          <Route path="/currentShipment" element={<ShipmentsList />} />
          <Route path="/Profits" element={<ExtraProfits />} />
          <Route path="/Expenses" element={<Expenses />} />
          <Route path="/Products" element={<Products />} />
        </Routes>
      </div>
    </>
  );
}

export default AdminRouter;
