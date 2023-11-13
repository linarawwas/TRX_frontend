// Layout.js
import React, { Fragment } from "react";
import AsideMenu from "../components/AsideMenu/AsideMenu";
import UserRouter from '../Router/UserRouter';

function Layout() {
  return (
    <Fragment>
      <AsideMenu />
      <UserRouter />
    </Fragment>
  );
}

export default Layout;
