import { Route, Routes } from "react-router-dom";

import EmployeeHomePage from "../pages/EmployeePages/EmployeeHomePage/EmployeeHomePage";
import StartShipment from "../components/EmployeeComponents/StartShipment/StartShipment";
import { CommonRoutes } from "./CommonRoutes";

function EmployeeRouter() {
  return (
    <div className="userRouter">
      <Routes>
        <Route index element={<EmployeeHomePage />} />
        <Route path="/newShipment" element={<StartShipment />} />
        <CommonRoutes />
      </Routes>
    </div>
  );
}

export default EmployeeRouter;

