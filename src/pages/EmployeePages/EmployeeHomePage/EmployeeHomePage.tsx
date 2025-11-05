import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import TodaySnapshot from "../../../components/AsideMenu/Right/TodaySnapshot";
import FeatureSection from "../../../components/LandingPage/FeatureSection";
import RoundSnapshot from "../../../components/AsideMenu/Right/RoundSnapshot";
import { t } from "../../../utils/i18n";

const EmployeeHomePage: React.FC = () => {
  const name = useSelector((s: RootState) => s.user.username);

  return (
    <div className="emp-home" dir="rtl">
      <header className="emp-hero">
        <h1 className="emp-title">{t("emp.home.hello")} {name}</h1>
        <div className="emp-sub">
          {new Date().toLocaleDateString("ar-LB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>
      </header>
      {/* Today stats (collapsible) */}
      <TodaySnapshot /> <RoundSnapshot />
      {/* Quick actions */}
      <FeatureSection />
    </div>
  );
};

export default EmployeeHomePage;
