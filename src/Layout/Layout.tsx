// Layout.tsx
import React, { Fragment, useLayoutEffect } from "react";
import AdminRouter from "../Router/AdminRouter";
import { useSelector, useDispatch } from "react-redux";
import EmployeeRouter from "../Router/EmployeeRouter";
import AsideMenu from "../components/AsideMenu/Left/UnifiedAsideMenu";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RootState } from "../redux/store";
import { fetchMeAndSync } from "../features/auth/authApi";

function Layout() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.user.token);
  const isAdmin = useSelector((state: RootState) => state.user.isAdmin);

  useLayoutEffect(() => {
    if (!token) return;

    fetchMeAndSync(token, dispatch).catch((error) => {
      console.error("Error fetching user data:", error);
    });
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

