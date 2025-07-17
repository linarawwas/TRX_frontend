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
        <h1>مرحباً {name}</h1>
        <AdminFeatures />
        <CurrentShipmentStat />
      </div>
    </div>
  );
};

export default AdminLandingPage;
