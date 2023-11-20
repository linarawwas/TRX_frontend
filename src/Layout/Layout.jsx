// Layout.js
import React, { Fragment } from "react";
import AsideMenu from "../components/AsideMenu/AsideMenu";
import AdminRouter from '../Router/AdminRouter';
import { useSelector } from "react-redux";
import EmployeeRouter from "../Router/EmployeeRouter";
function Layout() {
  const isAdmin = useSelector(state=>state.user.isAdmin);
  return (
    <Fragment>
      <AsideMenu />
      {isAdmin ? <AdminRouter /> : <EmployeeRouter/>}
    </Fragment>
  );
}

export default Layout;
