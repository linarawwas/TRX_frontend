import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../AsideMenu.css"; // You will update this CSS too
import { FaBars, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import logo from "../../../images/logo.jpeg";
import {
  clearCompanyId,
  clearToken,
  clearIsAdmin,
} from "../../../redux/UserInfo/action";

const AsideMenuAdmin: React.FC = () => {
  const dispatch = useDispatch();
  const shipmentId: string = useSelector((state: any) => state.shipment._id);
  const dayId: string = useSelector((state: any) => state.shipment.dayId);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const navigate = useNavigate();

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
        <h1 className="page-title">مرحباً لينة</h1>
        <img
          className="logo-icon"
          src={logo}
          alt="الشعار"
          onClick={() => navigate("/")}
        />
      </div>
{isMenuOpen && (
  <div className="menu-overlay" onClick={toggleMenu}></div>
)}
      {/* Sidebar Drawer */}
      <aside className={`sidebar-drawer ${isMenuOpen ? "open" : ""}`} dir="rtl">
        <nav className="menu-section">
          <Link to="/areas" onClick={toggleMenu}>المناطق</Link>
          <Link to="/customers" onClick={toggleMenu}>الزبائن</Link>
          <Link to="/Expenses" onClick={toggleMenu}>المصاريف</Link>
          <Link to="/Profits" onClick={toggleMenu}>الأرباح</Link>
          <Link to="/currentShipment" onClick={toggleMenu}>تفاصيل الشحنة الحالية</Link>
          <Link to="/Products" onClick={toggleMenu}>المنتجات</Link>
        </nav>

        <div className="menu-footer">
          <button className="logout-btn" onClick={handleLogout}>
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </div>
  );
};

export default AsideMenuAdmin;
