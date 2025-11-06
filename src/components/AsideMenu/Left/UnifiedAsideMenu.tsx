import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaBars, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../../images/logo.jpeg";
import {
  clearCompanyId,
  clearToken,
  clearIsAdmin,
} from "../../../redux/UserInfo/action";
import { setShipmentFromPrev } from "../../../redux/Shipment/action";
import "../UnifiedAsideMenu.css";
const AsideMenu: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin = useSelector((state: any) => state.user.isAdmin);
  const shipmentId = useSelector((state: any) => state.shipment._id);
  const dayId = useSelector((state: any) => state.shipment.dayId);
  const shipmentDefined = !!shipmentId;

  const handleLogout = () => {
    toast.success("تم تسجيل الخروج بنجاح");
    localStorage.removeItem("token");
    window.location.reload();
    dispatch(clearToken());
    dispatch(clearCompanyId());
    dispatch(clearIsAdmin());
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div dir="rtl">
      <ToastContainer position="top-right" autoClose={1000} />

      {/* Top Nav */}
      <div className="top-navbar">
        <button className="menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        <img
          className="logo-icon"
          src={logo}
          alt="الشعار"
          onClick={() => navigate("/")}
        />
      </div>

      {isMenuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}

      {/* Sidebar Drawer */}
      <aside className={`sidebar-drawer ${isMenuOpen ? "open" : ""}`} dir="rtl">
        <nav className="menu-section">
          {/* Common Links */}
          {shipmentDefined && !isAdmin && (
            <Link to={`/areas/${dayId}`} onClick={toggleMenu}>
              🛣️ المسار
            </Link>
          )}
          <Link to="/areas" onClick={toggleMenu}>
            🌍 المناطق
          </Link>
          <Link to="/customers" onClick={toggleMenu}>
            👥 الزبائن
          </Link>
          <Link to="/currentShipment" onClick={toggleMenu}>
            📦 بيانات الشحنة
          </Link>
          <Link to="/reports/orders-today" onClick={toggleMenu}>
            🧾 طلبات شحنات اليوم
          </Link>
          <Link to="/distributors" onClick={toggleMenu}>
            👥 الموزعين (قيد التطوير 🚧)
          </Link>{" "}
          <Link to="/Expenses" onClick={toggleMenu}>
            🧾 المصاريف
          </Link>
          <Link to="/Profits" onClick={toggleMenu}>
            💰 الأرباح
          </Link>
          {/* Admin-only Links */}
          {isAdmin && (
            <>
              <Link to="/Products" onClick={toggleMenu}>
                📦 المنتجات
              </Link>
            </>
          )}
        </nav>

        <div className="menu-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🔓 تسجيل الخروج
          </button>
          {!isAdmin && (
            <button
              className="logout-btn"
              onClick={() => dispatch(setShipmentFromPrev())}
              disabled
            >
              🔁 الشحنة السابقة
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};

export default AsideMenu;
