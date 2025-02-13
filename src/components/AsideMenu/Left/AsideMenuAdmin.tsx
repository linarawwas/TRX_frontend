import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../AsideMenu.css";
import { FaBars, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import logo from '../../../images/logo.jpeg'
import {
  clearCompanyId,
  clearToken,
  clearIsAdmin,
} from "../../../redux/UserInfo/action";
const AsideMenuAdmin: React.FC = () => {
  const dispatch = useDispatch();
  const shipmentId: string = useSelector((state: any) => state.shipment._id);
  const shipmentDefined: boolean =
    shipmentId !== null && shipmentId !== undefined && shipmentId !== "";
  const dayId: string = useSelector((state: any) => state.shipment.dayId);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [Loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const handleLogout = () => {
    toast.success("Logged Out Successfully");

    // Delete the token from local storage
    localStorage.removeItem("token");
    // setTimeout(() => {
    window.location.reload();
    // }, 3000);

    // Dispatch actions to clear token and companyId in the Redux store
    dispatch(clearToken());
    dispatch(clearCompanyId());
    dispatch(clearIsAdmin());
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={`dashboard ${isMenuOpen ? "menu-open" : "menu-closed"}`}>
      <div className="aside-Menu">
        <ToastContainer position="top-right" autoClose={1000} />

        <div className="button-div">
          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <img
            className="logo"
            src={logo}
            alt="Logo"
            onClick={() => {
              navigate("/");
            }}
          />
        </div>
        <aside className="sidebar">
          <ul>
            {shipmentDefined ? (
              <li>
                <Link
                  to={`/areas/${dayId}`}
                  className="sidebar-link"
                  onClick={toggleMenu}
                >
                  Today's Pathway
                </Link>
              </li>
            ) : (
              <li>Please Start Shipment</li>
            )}
            <li>
              <Link to="/areas" className="sidebar-link" onClick={toggleMenu}>
                Areas
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="sidebar-link"
                onClick={toggleMenu}
              >
                Register
              </Link>
            </li>
            <li>
              <Link
                to="/customers"
                className="sidebar-link"
                onClick={toggleMenu}
              >
                Customer
              </Link>
            </li>
            <li>
              <Link
                to="/viewOrders"
                className="sidebar-link"
                onClick={toggleMenu}
              >
                Orders
              </Link>
            </li>
            <li>
              <Link
                to="/Expenses"
                className="sidebar-link"
                onClick={toggleMenu}
              >
                Expenses
              </Link>
            </li>
            <li>
              <Link to="/Profits" className="sidebar-link" onClick={toggleMenu}>
                {" "}
                Profits
              </Link>
            </li>
            <li>
              <Link
                to="/currentShipment"
                className="sidebar-link"
                onClick={toggleMenu}
              >
                Shipment Info
              </Link>
            </li>
            <li>
              <Link
                to="/Products"
                className="sidebar-link"
                onClick={toggleMenu}
              >
                {" "}
                Products
              </Link>
            </li>
            <li>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default AsideMenuAdmin;
