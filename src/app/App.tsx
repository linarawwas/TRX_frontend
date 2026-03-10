import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import Login from "../pages/SharedPages/Login/Login";
import { useDispatch } from "react-redux";
import useSyncOfflineOrders from "../hooks/useSyncOfflineOrders";
import { initializeDB } from "../utils/indexedDB";
import { hydrateAuthFromStorage } from "../features/auth/authStorage";
import { ErrorBoundary, AuthAppErrorFallback } from "../components/ErrorBoundary";

export default function App() {
  const dispatch = useDispatch();
  // Keep Redux user slice in sync with auth-related localStorage on each render.
  const { token } = hydrateAuthFromStorage(dispatch);
  const isAuthenticated = Boolean(token);

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
          element={
            isAuthenticated ? (
              <ErrorBoundary fallback={<AuthAppErrorFallback />}>
                <Layout />
              </ErrorBoundary>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}


