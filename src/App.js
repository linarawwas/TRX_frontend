import React, { useEffect, useState } from "react";
import Login from "./components/Auth/Login";
import Layout from "./Layout/Layout";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import './index.css'
function App() {
  const token = localStorage.getItem("token");
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
