import React, { useState, useEffect } from "react";
import EmployeeLayout from "./Layout/UserLayout";
import AdminLayout from "./Layout/AdminLayout";
import Layout from "./Layout/Layout";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for token in session storage
    const token = sessionStorage.getItem("token");
    console.log("Token from session storage:", token);
  
    if (token) {
      // Token exists in session storage
      setIsLoggedIn(true);
  
      // Check if token is admin token
      if (token === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTJmYTFlNTg2NDUyODIwOGMyMjNlOWQiLCJpYXQiOjE2OTc3MTE5MTZ9.LW8T2NSAiMFZBSEn4Y0dHRNPJ4vzQloprmR8yYaLXdw") { // replace "your_admin_token_here" with your actual admin token
        setIsAdmin(true);
        console.log("User is an admin");
      }
    }
  }, []); 


  const handleLogin = () => {
    // perform login logic, set token in session storage, and set isLoggedIn to true
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsAdmin(false); 
  };

  return (
    <div>
      {isAdmin && isLoggedIn && <AdminLayout onLogout={handleLogout} />}
      {/* {!isAdmin && isLoggedIn && <EmployeeLayout onLogout={handleLogout} />} */}
      {!isLoggedIn && <Login />}
    </div>
  );
}

export default App;