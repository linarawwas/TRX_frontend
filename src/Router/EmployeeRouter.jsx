import { Route, Routes } from "react-router-dom";
import Days from "../components/Days/Days.tsx";
import EmployeeLandingPage from "../Pages/EmployeePages/EmployeeLandingPage/EmployeeLandingPage.tsx";
import StartShipment from "../components/EmployeeComponents/StartShipment/StartShipment.tsx";
import AddExpenses from "../components/Expenses/AddExpenses/AddExpenses.tsx";
import AddProfits from "../components/Profits/AddProfits/AddProfits.tsx";
import UpdateOrder from "../components/Orders/UpdateOrder/UpdateOrder.tsx";
import UpdateCustomer from "../components/Customers/UpdateCustomer/UpdateCustomer.tsx";
import Customers from "../Pages/SharedPages/viewCustomers/Customers.tsx";
import OrdersTable from "../Pages/SharedPages/OrdersTable/OrdersTable.tsx";
import RecordOrderForCustomer from "../Pages/SharedPages/RecordOrderForCustomer/RecordOrderForCustomer.tsx";
import CustomersForArea from "../Pages/SharedPages/CustomersForArea/CustomersForArea.tsx";
import AreasForDay from "../Pages/SharedPages/AreasForDay/AreasForDay.tsx";
import SignInSide from "../Pages/SharedPages/SignIn/SignIn.tsx";
function EmployeeRouter() {
  return (
    <div className="userRouter">
      <Routes>
        <Route index element={<EmployeeLandingPage />} />
        <Route path="/SignIn" element={<SignInSide />} />
        <Route path="/viewOrders" element={<OrdersTable />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/updateOrder/:orderId" element={<UpdateOrder />} />
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
      </Routes>
    </div>
  );
}

export default EmployeeRouter;
