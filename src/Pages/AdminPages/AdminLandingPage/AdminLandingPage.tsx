import React from "react";
import "./LandingPage.css";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import AdminFeatures from "../../../components/LandingPage/AdminFeatures.jsx";
import CurrentShipmentStat from "./CurrentShipmentStats/CurrentShipmentStat";

const AdminLandingPage: React.FC = () => {
  const name = useSelector((state: RootState) => state.user.username);

  return (
    <div className="landing-page" dir="rtl">
      <div className="hero-section">
        <h1>مرحباً بك في تيركس، {name}</h1>
        <p>شريكك في إدارة المخزون والشحنات</p>
        <AdminFeatures />
        <CurrentShipmentStat />
      </div>
      <div className="footer">
        <p>© 2025 تيركس بواسطة لينة الرواّس. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  );
};

export default AdminLandingPage;
