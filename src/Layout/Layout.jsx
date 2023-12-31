// Layout.js
import React, { Fragment } from "react";

import AdminRouter from '../Router/AdminRouter';
import { useSelector } from "react-redux";
import EmployeeRouter from "../Router/EmployeeRouter";
import AsideMenuAdmin from "../components/AsideMenu/AsideMenu/AsideMenuAdmin";
import AsideMenuEmployee from "../components/AsideMenu/AsideMenu/AsideMenuEmployee.tsx";
function Layout(isAdmin) {
  // const isAdmin = useSelector(state => state.user.isAdmin);
  return (
    <Fragment>
      {isAdmin ? <AsideMenuAdmin /> : <AsideMenuEmployee />}
      {isAdmin ? <AdminRouter /> : <EmployeeRouter />}
    </Fragment>
  );
}

export default Layout;
