import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../AsideMenu.css";
import { FaBars, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCompanyId,
  clearToken,
  clearIsAdmin,
} from "../../../redux/UserInfo/action";
import RightAsideMenu from "../Right/RightAsideMenu";
import { setShipmentFromPrev } from "../../../redux/Shipment/action";

const AsideMenuEmployee: React.FC = () => {
  const shipmentId: string = useSelector((state: any) => state.shipment._id);
  const shipmentDefined: boolean =
    shipmentId !== null && shipmentId !== undefined && shipmentId !== "";
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const dayId: string = useSelector((state: any) => state.shipment.dayId);

  const handleLogout = () => {
    toast.success("Logged Out Successfully");

    // Delete the token from local storage
    localStorage.removeItem("token");
    setTimeout(() => {
      window.location.reload();
    }, 1500);

    // Dispatch actions to clear token and companyId in the Redux store
    dispatch(clearToken());
    dispatch(clearCompanyId());
    dispatch(clearIsAdmin());
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handlePrevShipment = () => {
    dispatch(setShipmentFromPrev());
  };

  return (
    <div className={`dashboard ${isMenuOpen ? "menu-open" : "menu-closed"}`}>
      <div className="aside-Menu">
        <ToastContainer position="top-right" autoClose={1000} />

        <div className="button-div">
          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <RightAsideMenu />
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
                  Pathway
                </Link>
              </li>
            ) : (
              <li>Please Start Shipment</li>
            )}
            {/* <li>
              <Link to="/customers" className='sidebar-link' onClick={toggleMenu}>Customer</Link>
            </li>
            <li>
              <Link to="/viewOrders" className='sidebar-link' onClick={toggleMenu} >Orders</Link>
            </li> */}
            <li>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </li>
            <button className="prev-shipment-btn" onClick={handlePrevShipment}>
              ↩️
            </button>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default AsideMenuEmployee;
