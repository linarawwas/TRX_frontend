import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import CustomerInfo from "../components/Customers/CustomerInfo/CustomerInfo";
import AdminHomePage from "../pages/AdminPages/AdminHomePage/AdminHomePage";
import { CommonRoutes } from "./CommonRoutes";
import { t } from "../utils/i18n";

const DistributorsPage = lazy(
  () => import("../components/Distributors/DistributorsPage")
);
const DistributorDetails = lazy(
  () => import("../components/Distributors/DistributorDetails")
);
const AddCustomers = lazy(
  () => import("../components/Customers/AddCustomers/AddCustomers")
);
const Products = lazy(() => import("../pages/AdminPages/ProductsList/Products"));

const ROUTE_FALLBACK = (
  <div className="finx-tile" role="status" aria-live="polite">
    {t("common.loading")}
  </div>
);

function withRouteSuspense(element: JSX.Element) {
  return <Suspense fallback={ROUTE_FALLBACK}>{element}</Suspense>;
}

function AdminRouter() {
  return (
    <>
      <div className="userRouter">
        <Routes>
          <Route index element={<AdminHomePage />} />
          <Route
            path="/distributors"
            element={withRouteSuspense(<DistributorsPage />)}
          />
          <Route
            path="/distributors/:id"
            element={withRouteSuspense(<DistributorDetails />)}
          />

          <Route
            path="/addCustomers"
            element={withRouteSuspense(<AddCustomers />)}
          />
          <Route path="/customerInfo" element={<CustomerInfo />} />
          <Route
            path="/Products"
            element={withRouteSuspense(<Products />)}
          />
          {CommonRoutes()}
        </Routes>
      </div>
    </>
  );
}

export default AdminRouter;

