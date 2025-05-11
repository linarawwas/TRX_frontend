import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaBars, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import RightAsideMenu from "../Right/RightAsideMenu";
import {
  clearCompanyId,
  clearToken,
  clearIsAdmin,
} from "../../../redux/UserInfo/action";
import { setShipmentFromPrev } from "../../../redux/Shipment/action";
import "../AsideMenu.css";

const AsideMenuEmployee: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();

  const shipmentId = useSelector((state: any) => state.shipment._id);
  const dayId = useSelector((state: any) => state.shipment.dayId);
  const shipmentDefined = !!shipmentId;

  const handleLogout = () => {
    toast.success("تم تسجيل الخروج بنجاح");
    localStorage.removeItem("token");
    setTimeout(() => window.location.reload(), 1500);
    dispatch(clearToken());
    dispatch(clearCompanyId());
    dispatch(clearIsAdmin());
  };

  return (
    <div className={`dashboard ${isMenuOpen ? "menu-open" : "menu-closed"}`} style={{ direction: "rtl" }}>
      <ToastContainer position="top-right" autoClose={1000} />
      <div className="aside-Menu">
        <div className="button-div">
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <RightAsideMenu />
        </div>

        <aside className="sidebar" style={{ textAlign: "right" }}>
          <ul>
            {shipmentDefined ? (
              <li><Link to={`/areas/${dayId}`} className="sidebar-link">المسار</Link></li>
            ) : (
              <li>الرجاء بدء الشحنة</li>
            )}
            <li><Link to="/areas" className="sidebar-link">المناطق</Link></li>
            <li><Link to="/customers" className="sidebar-link">الزبائن</Link></li>
            <li><Link to="/Expenses" className="sidebar-link">المصاريف</Link></li>
            <li><Link to="/Profits" className="sidebar-link">الأرباح</Link></li>
            <li><Link to="/currentShipment" className="sidebar-link">تفاصيل الشحنة الحالية</Link></li>
            <li><button className="logout-button" onClick={handleLogout}>تسجيل الخروج</button></li>
            <li><button className="prev-shipment-btn" onClick={() => dispatch(setShipmentFromPrev())}>↩️</button></li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default AsideMenuEmployee;