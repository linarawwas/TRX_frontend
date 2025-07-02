import React from "react";
import { useSelector } from "react-redux";
import FeatureSection from "../../../components/LandingPage/FeatureSection";
import { RootState } from "../../../redux/store";
import "./EmployeeLandingPage.css";
import StatOverviewBar from "../../../components/AsideMenu/Right/StatCurtain";
import StatCurtain from "../../../components/AsideMenu/Right/StatCurtain";

const EmployeeLandingPage: React.FC = () => {
  const name = useSelector((state: RootState) => state.user.username);

  return (
    <div
      className="employee-landing-page"
      dir="rtl"
      style={{ textAlign: "right" }}
    >
      <StatCurtain />
      <h1>مرحباً {name}</h1>
      <FeatureSection />
    </div>
  );
};

export default EmployeeLandingPage;
