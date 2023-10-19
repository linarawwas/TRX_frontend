import React, { Fragment } from "react";

import Footer from "../Components/Footer/Footer.jsx";
import AdminRouter from "../routers/AdminRouter.jsx";
import AdminHeader from "../Components/Dashboard/AdminHeader.jsx";

const AdminLayout = () => {
  return (
    <Fragment>
      <AdminHeader />
        <AdminDashboard/>
        <AdminRouter/>
      <Footer />
    </Fragment>
  );
}; 

export default AdminLayout;