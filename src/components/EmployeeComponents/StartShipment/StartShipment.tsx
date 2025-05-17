import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { RootState } from "../../../redux/store";
import {
  setShipmentId,
  setShipmentTarget,
  setDateDay,
  setDateMonth,
  setDateYear,
  setDayId,
  clearShipmentInfo,
} from "../../../redux/Shipment/action";

import AddToModel from "../../AddToModel/AddToModel";
import { preloadShipmentData } from "../../../utils/preloadShipmentData";

import "./StartShipment.css";

const StartShipment: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.user.token);
  const companyId = useSelector((state: RootState) => state.user.companyId);

  const [shipmentData, setShipmentData] = useState({
    dayId: "",
    day: null,
    month: null,
    year: null,
    companyId: "",
  });

  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [preloadError, setPreloadError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const isDevMode =
    new URLSearchParams(window.location.search).get("dev") === "true";

  const steps = [
    "🔍 تحليل دقيق للمناطق وتوزيعها حسب الأولوية",
    "👥 تحميل معلومات الزبائن (عدد القناني، الطلبات، الخصومات)",
    "📦 تقدير الحمولة",
    "🧠 تفعيل حفظ المعلومات",
    "⚙️ تهيئة قاعدة بيانات التوصيل في وضع عدم الاتصال",
    "✅ ضمان الاستمرارية بدون إرسال أو شبكة",
  ];

  useEffect(() => {
    const initializeDate = async () => {
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const year = now.getFullYear();
        const dayName = now.toLocaleDateString("en-US", { weekday: "long" });

        const response = await fetch(
          `http://localhost:5000/api/days/name/${dayName}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Day info fetch failed");

        const data = await response.json();
        if (!data?.length) throw new Error("Day not found in DB");

        setShipmentData({
          dayId: data[0]._id,
          day,
          month,
          year,
          companyId,
        });
      } catch (err) {
        console.error("❌ Day initialization failed:", err);
      }
    };

    initializeDate();
  }, [token, companyId]);

  const handleShipmentSubmit = async (formData: any) => {
    try {
      const response = await fetch("http://localhost:5000/api/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...shipmentData,
          carryingForDelivery: formData.carryingForDelivery,
        }),
      });

      if (!response.ok) throw new Error("Shipment creation failed");

      const shipment = await response.json();

      dispatch(clearShipmentInfo());
      dispatch(setDayId(shipmentData.dayId));
      dispatch(setDateDay(shipmentData.day));
      dispatch(setDateMonth(shipmentData.month));
      dispatch(setDateYear(shipmentData.year));
      dispatch(setShipmentId(shipment._id));
      dispatch(setShipmentTarget(shipment.carryingForDelivery));

      toast.success("✅ تم تسجيل الشحنة بنجاح");
      setShowLoadingModal(true);
    } catch (error: any) {
      toast.error("⚠️ فشل في تسجيل الشحنة: " + error.message);
    }
  };

  const handleRetryPreload = async () => {
    setIsRetrying(true);
    setPreloadError(false);
    try {
      await preloadShipmentData({
        dayId: shipmentData.dayId,
        token,
        companyId,
      });
      navigate(`/areas/${shipmentData.dayId}`);
    } catch (error) {
      toast.error("❌ تعذر تحميل بيانات الشحنة.");
      setPreloadError(true);
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (!showLoadingModal || currentStepIndex > steps.length) return;

    const timeout = setTimeout(() => {
      if (currentStepIndex < steps.length) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        preloadShipmentData({
          dayId: shipmentData.dayId,
          token,
          companyId,
        })
          .then(() => navigate(`/areas/${shipmentData.dayId}`))
          .catch((err) => {
            console.error("❌ Preloading failed:", err);
            setPreloadError(true);
            setShowLoadingModal(false);
            toast.error("⚠️ فشل في تحميل البيانات");
          });
      }
    }, 2000); // Customize duration as needed

    return () => clearTimeout(timeout);
  }, [currentStepIndex, showLoadingModal]);

  const shipmentConfig = {
    "component-related-fields": {
      modelName: "الشحنات",
      title: "إنهاء الشحنة السابقة وبدء أخرى جديدة",
      "button-label": "بدء الشحنة",
    },
    "model-related-fields": {
      carryingForDelivery: {
        label: "الكمية المحملة للتوصيل",
        "input-type": "digit-carousal",
      },
    },
  };

  return (
    <>
      <AddToModel
        modelName={shipmentConfig["component-related-fields"].modelName}
        title={shipmentConfig["component-related-fields"].title}
        buttonLabel={shipmentConfig["component-related-fields"]["button-label"]}
        modelFields={shipmentConfig["model-related-fields"]}
        onSubmit={handleShipmentSubmit}
      />

      {preloadError && (
        <div className="retry-box">
          ⚠️ لم يتم تحميل البيانات بنجاح.
          <br />
          <button onClick={handleRetryPreload} disabled={isRetrying}>
            {isRetrying ? "جارٍ المحاولة..." : "أعد المحاولة"}
          </button>
        </div>
      )}

      {isDevMode && !preloadError && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button onClick={handleRetryPreload}>
            🔁 إعادة تحميل بيانات الشحنة
          </button>
        </div>
      )}

      {showLoadingModal && (
        <div className="shipment-loading-overlay">
          <div
            className="shipment-loading-modal"
            role="alert"
            aria-live="assertive"
          >
            <h2>🚛 نظام التحميل الذكي قيد التشغيل</h2>
            <p className="loading-intro">
              نحن نُعدّ كل التفاصيل بدقة... الرجاء الانتظار.
            </p>
            <div className="animated-steps">
              {steps.slice(0, currentStepIndex).map((step, index) => (
                <p key={index} className="step">
                  {step}
                </p>
              ))}
            </div>
            <div className="progress-timer">
              الرجاء الانتظار ⏱ قد يستغرق هذا الإعداد حتى دقيقتين
            </div>
            <div className="pulse-loader"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default StartShipment;
