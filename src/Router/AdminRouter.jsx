import { Route, Routes } from "react-router-dom";
import Register from "../components/Auth/Register.tsx";
import OrdersTable from "../pages/SharedPages/OrdersTable/OrdersTable.tsx";
import Areas from "../pages/SharedPages/Areas/Areas.tsx";
import Customers from "../pages/SharedPages/viewCustomers/Customers.tsx";
import Addresses from "../pages/SharedPages/Addresses/Addresses.tsx";
import AreasForDay from "../pages/SharedPages/AreasForDay/AreasForDay.tsx";
import CustomersForArea from "../pages/SharedPages/CustomersForArea/CustomersForArea.tsx";

import DistributorsPage from "../components/Distributors/DistributorsPage.tsx";
import DistributorDetails from "../components/Distributors/DistributorDetails.tsx";

import AddArea from "../components/Areas/AddArea/AddArea.tsx";
import Login from "../pages/SharedPages/Login/Login.tsx";
import UpdateOrder from "../components/Orders/UpdateOrder/UpdateOrder.tsx";
import UpdateCustomer from "../components/Customers/UpdateCustomer/UpdateCustomer.tsx";
import AddExpenses from "../components/Expenses/AddExpenses/AddExpenses.tsx";
import AddProfits from "../components/Profits/AddProfits/AddProfits.tsx";
import AddCustomers from "../components/Customers/AddCustomers/AddCustomers.tsx";
import ShipmentsList from "../pages/SharedPages/Shipment/ShipmentsList.tsx";
import ExtraProfits from "../pages/SharedPages/ViewProfits/ViewProfits.tsx";
import Expenses from "../pages/SharedPages/ViewExpenses/ViewExpenses.tsx";
import Products from "../pages/AdminPages/ProductsList/Products.tsx";
import CustomerInfo from "../components/Customers/CustomerInfo/CustomerInfo.tsx";
import AdminLandingPage from "../pages/AdminPages/AdminLandingPage/AdminLandingPage.tsx";
import RecordOrderForCustomer from "../pages/SharedPages/RecordOrderForCustomer/RecordOrderForCustomer.tsx";
import OrdersOfToday from "../pages/SharedPages/Login/reports/orders-today/OrdersOfToday.tsx";
import CustomerStatement from "../components/Customers/CustomerStatement/CustomerStatement.tsx";
function AdminRouter() {
  return (
    <>
      <div className="userRouter">
        <Routes>
          <Route index element={<AdminLandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/distributors" element={<DistributorsPage />} />
          <Route path="/distributors/:id" element={<DistributorDetails />} />

          <Route path="/register" element={<Register />} />
          <Route path="/viewOrders" element={<OrdersTable />} />
          <Route path="/reports/orders-today" element={<OrdersOfToday />} />
          <Route
            path="/recordOrderforCustomer"
            element={<RecordOrderForCustomer />}
          />
          <Route
            path="/customers/:customerId/statement"
            element={<CustomerStatement />}
          />

          <Route path="/areas" element={<Areas />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/addresses/:areaId" element={<Addresses />} />
          <Route path="/areas/:dayId" element={<AreasForDay />} />
          <Route path="/customers/:areaId" element={<CustomersForArea />} />
          <Route path="/areas/add" element={<AddArea />} />
          <Route path="/updateOrder/:orderId" element={<UpdateOrder />} />
          <Route
            path="/updateCustomer/:customerId"
            element={<UpdateCustomer />}
          />
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
