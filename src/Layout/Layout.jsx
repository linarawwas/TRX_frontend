// Layout.js
import React, { Fragment, useLayoutEffect } from "react";
import AdminRouter from '../Router/AdminRouter';
import { useSelector } from "react-redux";
import { useDispatch } from 'react-redux';
import EmployeeRouter from "../Router/EmployeeRouter";
import { setCompanyId, setIsAdmin, setToken, setUsername } from '../redux/UserInfo/action.js'
import AsideMenuAdmin from "../components/AsideMenu/Left/AsideMenuAdmin.tsx";
import AsideMenuEmployee from "../components/AsideMenu/Left/AsideMenuEmployee.tsx";
function Layout() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  console.log("token is: ", token)
  const isAdmin = useSelector(state => state.user.isAdmin)
  useLayoutEffect(() => {  // Fetch user data to get companyId
    // Dispatch the setToken action to save the token in the Redux store
    dispatch(setToken(token));
    fetch('https://trx-api.linarawas.com/api/users/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(userData => {
        // setIsAdmin(userData.isAdmin);
        console.log('got user data from api')
        dispatch(setCompanyId(userData.companyId));
        dispatch(setIsAdmin(userData.isAdmin));
        dispatch(setUsername(userData.name))
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });

  }, []);
  return (
    <Fragment>
      {isAdmin ? <AsideMenuAdmin /> : <AsideMenuEmployee/>}
      {isAdmin ? <AdminRouter /> : <EmployeeRouter />}
    </Fragment>
  );
}

export default Layout;
