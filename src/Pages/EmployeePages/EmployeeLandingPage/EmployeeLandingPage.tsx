import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import "./EmployeeLandingPage.css";
import TodaySnapshot from "../../../components/AsideMenu/Right/TodaySnapshot"; // NEW name
import FeatureSection from "../../../components/LandingPage/FeatureSection";
import RoundsHistory from "../../../components/Shipments/RoundsHistory/RoundsHistory";

const EmployeeLandingPage: React.FC = () => {
  const name = useSelector((state: RootState) => state.user.username);

  const shipmentId = useSelector((s: any) => s.shipment._id);
  const shipmentTarget = useSelector((s: any) => s.shipment.target);

  return (
    <div className="emp-home" dir="rtl">
      <header className="emp-hero">
        <h1 className="emp-title">مرحبا {name}</h1>
        <div className="emp-sub">
          {new Date().toLocaleDateString("ar-LB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>
      </header>

      {/* Today stats (collapsible) */}
      <TodaySnapshot />
      {shipmentId && (
        <RoundsHistory
          shipmentId={shipmentId}
          totalToday={shipmentTarget}
          title="الجولات المُسجّلة اليوم"
        />
      )}
      {/* Quick actions */}
      <FeatureSection />
    </div>
  );
};

export default EmployeeLandingPage;
