import { Route, Routes } from "react-router-dom";

import DistributorsPage from "../components/Distributors/DistributorsPage";
import DistributorDetails from "../components/Distributors/DistributorDetails";
import AddCustomers from "../components/Customers/AddCustomers/AddCustomers";
import CustomerInfo from "../components/Customers/CustomerInfo/CustomerInfo";
import Products from "../pages/AdminPages/ProductsList/Products";
import AdminHomePage from "../pages/AdminPages/AdminHomePage/AdminHomePage";
import { CommonRoutes } from "./CommonRoutes";

function AdminRouter() {
  return (
    <>
      <div className="userRouter">
        <Routes>
          <Route index element={<AdminHomePage />} />
          <Route path="/distributors" element={<DistributorsPage />} />
          <Route path="/distributors/:id" element={<DistributorDetails />} />

          <Route path="/addCustomers" element={<AddCustomers />} />
          <Route path="/customerInfo" element={<CustomerInfo />} />
          <Route path="/Products" element={<Products />} />
          <CommonRoutes />
        </Routes>
      </div>
    </>
  );
}

export default AdminRouter;

