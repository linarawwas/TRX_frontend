import React, { useEffect } from "react";
import Login from "./components/Auth/Login";
import Layout from "./Layout/Layout";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from 'react-redux';
import { setToken, setCompanyId } from './redux/UserInfo/action.js';

function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const isAuthenticated = token !== null && token !== undefined;

  useEffect(() => {
      // Set the token in the Redux store
      dispatch(setToken(token));      // Fetch user data to get companyId
      fetch('http://localhost:5000/api/users/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(userData => {
          dispatch(setCompanyId(userData.companyId));
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
        });
    
  }, [dispatch, token]);

  
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
