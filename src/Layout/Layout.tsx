// Layout.tsx
import React, { Fragment, useLayoutEffect } from "react";
import AdminRouter from "../Router/AdminRouter";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import EmployeeRouter from "../Router/EmployeeRouter";
import {
  setCompanyId,
  setIsAdmin,
  setToken,
  setUsername,
} from "../redux/UserInfo/action";
import AsideMenu from "../components/AsideMenu/Left/UnifiedAsideMenu";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RootState } from "../redux/store";
import { API_BASE } from "../config/api";

interface UserData {
  companyId: string;
  isAdmin: boolean;
  name: string;
}

function Layout() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  console.log("token is: ", token);
  const isAdmin = useSelector((state: RootState) => state.user.isAdmin);
  
  useLayoutEffect(() => {
    // Fetch user data to get companyId
    // Dispatch the setToken action to save the token in the Redux store
    if (token) {
      dispatch(setToken(token));
      fetch(`${API_BASE}/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((userData: UserData) => {
          // Save to localStorage
          localStorage.setItem("companyId", userData.companyId);
          localStorage.setItem("isAdmin", JSON.stringify(userData.isAdmin));
          localStorage.setItem("username", userData.name);

          // Dispatch to Redux
          dispatch(setCompanyId(userData.companyId));
          dispatch(setIsAdmin(userData.isAdmin));
          dispatch(setUsername(userData.name));
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [dispatch, token]);
  
  return (
    <Fragment>
      <ToastContainer position="top-right" autoClose={3000} />
      <AsideMenu />
      {isAdmin ? <AdminRouter /> : <EmployeeRouter />}
    </Fragment>
  );
}

export default Layout;

