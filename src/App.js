import React, { useDebugValue, useEffect, useState } from "react";
import Login from "./Pages/SharedPages/Login/Login";
import Layout from "./Layout/Layout";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { setToken } from './redux/UserInfo/action.js'
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  dispatch(setToken(token));
  const isAuthenticated = token !== null && token !== undefined;
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route path="/*" element={isAuthenticated
          ? <Layout />
          : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;