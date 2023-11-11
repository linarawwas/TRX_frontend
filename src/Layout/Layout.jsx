import React, { Fragment } from "react";
import AsideMenu from "../components/AsideMenu/AsideMenu";
import UserRouter from '../Router/UserRouter'
function Layout (props) {
  return (
    <Fragment>
        <AsideMenu/>
        <UserRouter companyId={props.companyId} token={props.token} />
    </Fragment>
  );
}; 

export default Layout;