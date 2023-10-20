import React, { Fragment } from "react";
import Dashboard from "../components/Dashboard/Dashboard";
import UserRouter from '../Router/UserRouter'
function Layout () {
  return (
    <Fragment>
        <Dashboard/>
        <UserRouter/>
    </Fragment>
  );
}; 

export default Layout;