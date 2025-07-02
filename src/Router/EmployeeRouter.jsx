import { Route, Routes } from "react-router-dom";
import Days from "../components/Days/Days.tsx";
import AreasForDay from "../Pages/AdminPages/AreasForDay/AreasForDay.tsx";
import Login from "../Pages/SharedPages/Login/Login.tsx";
import EmployeeLandingPage from "../Pages/EmployeePages/EmployeeLandingPage/EmployeeLandingPage.tsx";
import StartShipment from "../components/EmployeeComponents/StartShipment/StartShipment.tsx";
import AddExpenses from "../components/Expenses/AddExpenses/AddExpenses.tsx";
import AddProfits from "../components/Profits/AddProfits/AddProfits.tsx";
import RecordOrderForCustomer from "../Pages/AdminPages/RecordOrderForCustomer/RecordOrderForCustomer.tsx";
import OrdersTable from "../Pages/AdminPages/OrdersTable/OrdersTable.tsx";
import UpdateOrder from "../components/Orders/UpdateOrder/UpdateOrder.tsx";
import UpdateCustomer from "../components/Customers/UpdateCustomer/UpdateCustomer.jsx";
import CustomersForArea from "../Pages/AdminPages/CustomersForArea/CustomersForArea.tsx";
import ShipmentsList from "../Pages/AdminPages/Shipment/ShipmentsList.tsx";
import Register from "../components/Auth/Register.tsx";
import Areas from "../Pages/AdminPages/Areas/Areas.tsx";
import Customers from "../Pages/AdminPages/viewCustomers/Customers.tsx";
import Addresses from "../Pages/AdminPages/Addresses/Addresses.tsx";
import AddArea from "../components/Areas/AddArea/AddArea.tsx";
import CreateExternalShipment from "../Pages/EmployeePages/CreateExternalShipment/CreateExternalShipment.tsx";
function EmployeeRouter() {
  return (
    <div className="userRouter">
      <Routes>
        <Route index element={<EmployeeLandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/viewOrders" element={<OrdersTable />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/updateOrder/:orderId" element={<UpdateOrder />} />
        <Route path="/createExternalShipment" element={<CreateExternalShipment />} />
        <Route
          path="/updateCustomer/:customerId"
          element={<UpdateCustomer />}
        />
        <Route
          path="/recordOrderforCustomer"
          element={<RecordOrderForCustomer />}
        />
        <Route path="/days" element={<Days />} />
        <Route path="/newShipment" element={<StartShipment />} />
        <Route path="/areas/:dayId" element={<AreasForDay />} />
        <Route path="/customers/:areaId" element={<CustomersForArea />} />
        <Route path="/addExpenses" element={<AddExpenses />} />
        <Route path="/addProfits" element={<AddProfits />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/viewOrders" element={<OrdersTable />} />
        <Route
          path="/recordOrderforCustomer"
          element={<RecordOrderForCustomer />}
        />
        <Route path="/days" element={<Days />} />
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
        <Route path="/addProfits" element={<AddProfits />} />
        <Route path="/currentShipment" element={<ShipmentsList />} />
      </Routes>
    </div>
  );
}

export default EmployeeRouter;
