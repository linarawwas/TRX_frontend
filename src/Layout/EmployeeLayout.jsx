import React, { Fragment } from "react";

import Footer from "../Components/Footer/Footer.jsx";
import UserRouter from "../routers/UserRouter.jsx";
import LoggedHeader from "../Components/Header/LoggedHeader.jsx";

const UserLayout = () => {
  return (
    <Fragment>
      <LoggedHeader />
      <div>
        <EmployeeRouter />
      </div>
      <Footer />
    </Fragment>
  );
}; 

export default UserLayout;