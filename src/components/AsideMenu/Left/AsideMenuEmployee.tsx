import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaBars, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  clearCompanyId,
  clearToken,
  clearIsAdmin,
} from "../../../redux/UserInfo/action";
import { setShipmentFromPrev } from "../../../redux/Shipment/action";
import "../AsideMenu.css";
import { SidebarItem } from "./SidebarItem";
import { useNavigate } from "react-router-dom";

const AsideMenuEmployee: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  const handleGoHome = () => {
    navigate("/");
  };
  return (
    <div
      className={`dashboard ${isMenuOpen ? "menu-open" : "menu-closed"}`}
      style={{ direction: "rtl" }}
    >
      <ToastContainer position="top-right" autoClose={1000} />
      <div className="aside-Menu">
        <div className="button-div">
          <button
            className="home-toggle"
            onClick={handleGoHome}
            title="الصفحة الرئيسية"
          >
            🏠
          </button>
          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <aside className="sidebar" style={{ textAlign: "right" }}>
          <ul className="employee-sidebar-list">
            <SidebarItem
              to={`/areas/${dayId}`}
              icon="🛣️"
              label="المسار"
              show={shipmentDefined}
            />
            <SidebarItem to="/areas" icon="🌍" label="المناطق" />
            <SidebarItem to="/customers" icon="👥" label="الزبائن" />
            <SidebarItem to="/Expenses" icon="🧾" label="المصاريف" />
            <SidebarItem to="/Profits" icon="💰" label="الأرباح" />
            <SidebarItem
              to="/currentShipment"
              icon="📦"
              label="تفاصيل الشحنة الحالية"
            />
            <li>
              <button className="logout-button" onClick={handleLogout}>
                🔓 تسجيل الخروج
              </button>
            </li>
            <li>
              <button
                className="prev-shipment-button"
                onClick={() => dispatch(setShipmentFromPrev())}
              >
                🔁 الشحنة السابقة
              </button>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default AsideMenuEmployee;
