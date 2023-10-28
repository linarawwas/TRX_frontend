import React, { useState, useEffect } from "react";
import Login from "./components/Auth/Login";
import Layout from "./Layout/Layout";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
function App() {
  // Define a state variable to track whether the user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated by inspecting the local storage
    const token = localStorage.getItem("token");

    if (token) {
      // If a token is found, the user is authenticated
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route path="/*" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />} />

      </Routes>
    </Router>
  );
}

export default App;
