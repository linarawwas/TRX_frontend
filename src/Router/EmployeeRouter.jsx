import { Route, Routes } from 'react-router-dom';
import React from 'react';
import RecordOrder from '../components/Orders/RecordOrder/RecordOrder.jsx';
import Days from '../components/Days/Days.tsx';
import AreasForDay from '../components/Areas/AreasForDay/AreasForDay.tsx';
import CustomersForArea from '../components/Customers/CustomersForArea/CustomersForArea.tsx';
import Login from '../components/Auth/Login.tsx';
import EmployeeLandingPage from '../components/EmployeeComponents/LandingPage/EmployeeLandingPage.tsx';
import StartShipment from '../components/EmployeeComponents/StartShipment/StartShipment.tsx';
import AddExpenses from '../components/Expenses/AddExpenses/AddExpenses.tsx';
import AddProfits from '../components/Profits/AddProfits/AddProfits.tsx';
import RecordOrderForCustomer from '../components/Orders/RecordOrder/RecordOrderForCustomer/RecordOrderForCustomer.tsx';
import OrdersTable from '../components/Orders/OrdersTable/OrdersTable.tsx';
import UpdateOrder from '../components/Orders/UpdateOrder/UpdateOrder.tsx';
import UpdateCustomer from '../components/Customers/UpdateCustomer/UpdateCustomer.tsx';
import Customers from '../components/Customers/viewCustomers/Customers.tsx';
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
