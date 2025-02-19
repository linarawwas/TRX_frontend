import Login from "./Pages/SharedPages/Login/Login";
import Layout from "./Layout/Layout";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { setToken } from "./redux/UserInfo/action.js";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import useSyncOfflineOrders from "./Hooks/useSyncOfflineOrders";
import { initializeDB } from "./utils/indexedDB";
function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  dispatch(setToken(token));
  const isAuthenticated = token !== null && token !== undefined;
  initializeDB();
  // Call this function at the start of your app
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

export default App;
