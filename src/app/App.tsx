import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Layout from "../Layout/Layout.jsx";
import Login from "../pages/SharedPages/Login/Login";
import { useDispatch } from "react-redux";
import {
  setCompanyId,
  setIsAdmin,
  setToken,
  setUsername,
} from "../redux/UserInfo/action.js";
import useSyncOfflineOrders from "../hooks/useSyncOfflineOrders.js";
import { initializeDB } from "../utils/indexedDB";

export default function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const companyId = localStorage.getItem("companyId");
  const isAdmin = JSON.parse(localStorage.getItem("isAdmin") || "false");
  const username = localStorage.getItem("username");

  if (token) {
    dispatch(setToken(token));
    dispatch(setCompanyId(companyId));
    dispatch(setIsAdmin(isAdmin));
    dispatch(setUsername(username));
  }
  dispatch(setToken(token));
  const isAuthenticated = token !== null && token !== undefined;

  initializeDB();
  useSyncOfflineOrders();

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/*"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}


