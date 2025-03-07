import { Route, Routes } from 'react-router-dom';
import Days from '../components/Days/Days.tsx';
import AreasForDay from '../Pages/AdminPages/AreasForDay/AreasForDay.tsx';
import Login from '../Pages/SharedPages/Login/Login.tsx';
import EmployeeLandingPage from '../Pages/EmployeePages/EmployeeLandingPage/EmployeeLandingPage.tsx';
import StartShipment from '../components/EmployeeComponents/StartShipment/StartShipment.tsx';
import AddExpenses from '../components/Expenses/AddExpenses/AddExpenses.tsx';
import AddProfits from '../components/Profits/AddProfits/AddProfits.tsx';
import RecordOrderForCustomer from '../Pages/AdminPages/RecordOrderForCustomer/RecordOrderForCustomer.tsx';
import OrdersTable from '../Pages/AdminPages/OrdersTable/OrdersTable.tsx';
import UpdateOrder from '../components/Orders/UpdateOrder/UpdateOrder.tsx';
import UpdateCustomer from '../components/Customers/UpdateCustomer/UpdateCustomer.tsx';
import Customers from '../Pages/AdminPages/viewCustomers/Customers.tsx';
import CustomersForArea from '../Pages/AdminPages/CustomersForArea/CustomersForArea.tsx';
function EmployeeRouter() {
    return (
        <div className="userRouter">
            <Routes>
                <Route index element={<EmployeeLandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/viewOrders" element={<OrdersTable />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/updateOrder/:orderId" element={<UpdateOrder />} />
                <Route path="/updateCustomer/:customerId" element={<UpdateCustomer />} />
                <Route path="/recordOrderforCustomer" element={<RecordOrderForCustomer />} />
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