import React, { useState, useEffect } from "react";
import Login from "./components/Auth/Login";
import Layout from "./Layout/Layout";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
function App() {
  // Define a state variable to track whether the user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [companyId, setCompanyId] = useState(null); // State to store companyId
  const token = localStorage.getItem("token");

  useEffect(() => {


    if (token) {
      // Fetch user data to get companyId
      fetch('http://localhost:5000/api/users/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => response.json())
      .then(userData => {
        setCompanyId(userData.companyId); // Extract companyId from user data
        setIsAuthenticated(true);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setIsAuthenticated(false);
      });
    }
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route path="/*" element={isAuthenticated 
          ?              <Layout companyId={companyId} token={token}/>
          : <Navigate to="/login" />} />

      </Routes>
    </Router>
  );
}

export default App;
