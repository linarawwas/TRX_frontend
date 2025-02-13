import React, { useDebugValue, useEffect, useState } from "react";
import Login from "./Pages/SharedPages/Login/Login";
import Layout from "./Layout/Layout";
import { getAllRequests, clearRequests } from "./services/indexedDb";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { setToken } from "./redux/UserInfo/action.js";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { useDispatch } from "react-redux";
function App() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }

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
        <Route
          path="/*"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}
// Ensure to handle online event to retry saved requests
window.addEventListener("online", async () => {
  const requests = await getAllRequests();
  await Promise.all(
    requests.map(async ({ url, options }) => {
      try {
        await fetch(url, options);
      } catch (error) {
        console.error("Request failed during sync", error);
      }
    })
  );
  await clearRequests();
});
export default App;
