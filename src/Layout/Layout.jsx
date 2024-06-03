// Layout.js
import React, { Fragment, useLayoutEffect } from "react";
import AdminRouter from '../Router/AdminRouter';
import { useSelector } from "react-redux";
import { useDispatch } from 'react-redux';
import EmployeeRouter from "../Router/EmployeeRouter";
import { setCompanyId, setIsAdmin, setToken, setUsername } from '../redux/UserInfo/action.js'
import AsideMenuAdmin from "../components/AsideMenu/AsideMenu/AsideMenuAdmin";
import AsideMenuEmployee from "../components/AsideMenu/AsideMenu/AsideMenuEmployee.tsx";
function Layout() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const isAdmin = useSelector(state => state.user.isAdmin)
  useLayoutEffect(() => {  // Fetch user data to get companyId
    // Dispatch the setToken action to save the token in the Redux store
    dispatch(setToken(token));
    fetch('http://localhost:5000/api/users/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(userData => {
        // setIsAdmin(userData.isAdmin);
        dispatch(setCompanyId(userData.companyId));
        dispatch(setIsAdmin(userData.isAdmin));
        dispatch(setUsername(userData.name))
        console.log('useLayoutEffect')
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });

  }, []);
  return (
    <Fragment>
      {isAdmin ? <AsideMenuAdmin /> : <AsideMenuEmployee />}
      {isAdmin ? <AdminRouter /> : <EmployeeRouter />}
    </Fragment>
  );
}

export default Layout;
