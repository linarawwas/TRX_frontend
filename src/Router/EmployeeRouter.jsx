import { Route, Routes } from 'react-router-dom';
import React from 'react';
import RecordOrder from '../components/Orders/RecordOrder/RecordOrder.jsx';
import Days from '../components/Days/Days.jsx';
import AreasForDay from '../components/Areas/AreasForDay.jsx';
import CustomersForArea from '../components/Customers/CustomersForArea/CustomersForArea.jsx';
import Login from '../components/Auth/Login.jsx';
import LandingPage from '../components/LandingPage/LandingPage.jsx';
function EmployeeRouter() {
    return (
            <div className="userRouter">
                <Routes>
                    <Route index element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/recordOrder" element={<RecordOrder />} />
                    <Route path="/days" element={<Days />} />
                    <Route path="/areas/:dayId" element={<AreasForDay />} />
                    <Route path="/customers/:areaId" element={<CustomersForArea />} />
                </Routes>
            </div>
    );
}

export default EmployeeRouter;
