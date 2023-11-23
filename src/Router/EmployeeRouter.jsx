import { Route, Routes } from 'react-router-dom';
import React from 'react';
import RecordOrder from '../components/Orders/RecordOrder/RecordOrder.jsx';
import Days from '../components/Days/Days.jsx';
import AreasForDay from '../components/Areas/AreasForDay/AreasForDay.jsx';
import CustomersForArea from '../components/Customers/CustomersForArea/CustomersForArea.jsx';
import Login from '../components/Auth/Login.jsx';
import EmployeeLandingPage from '../components/EmployeeComponents/LandingPage/EmployeeLandingPage.jsx';
import StartShipment from '../components/EmployeeComponents/StartShipment/StartShipment.jsx';
import AddExpenses from '../components/Expenses/AddExpenses/AddExpenses.jsx';
import AddProfits from '../components/Profits/AddProfits/AddProfits.jsx';
function EmployeeRouter() {
    return (
        <div className="userRouter">
            <Routes>
                <Route index element={<EmployeeLandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/recordOrder" element={<RecordOrder />} />
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
