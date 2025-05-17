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
  // Redux + Router hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.user.token);
  const companyId = useSelector((state: RootState) => state.user.companyId);

  // Shipment initialization state
  const [shipmentData, setShipmentData] = useState({
    dayId: "",
    day: null,
    month: null,
    year: null,
    companyId: "",
  });

  // Loader modal and step control
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Error handling
  const [preloadError, setPreloadError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const isDevMode =
    new URLSearchParams(window.location.search).get("dev") === "true";

  // Loading steps displayed to the driver
  const steps = [
    "🔍 تحليل دقيق للمناطق وتوزيعها حسب الأولوية",
    "👥 تحميل معلومات الزبائن (عدد القناني، الطلبات، الخصومات)",
    "📦 تقدير الحمولة",
    "🧠 تفعيل حفظ المعلومات",
    "⚙️ تهيئة قاعدة بيانات التوصيل في وضع عدم الاتصال",
    "✅ ضمان الاستمرارية بدون إرسال أو شبكة",
  ];

  /**
   * Initializes shipment date and fetches corresponding dayId.
   */
  useEffect(() => {
    const initializeDate = async () => {
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const year = now.getFullYear();
        const dayName = now.toLocaleDateString("en-US", { weekday: "long" });

        const res = await fetch(
          `http://localhost:5000/api/days/name/${dayName}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch day information");

        const dayData = await res.json();
        if (dayData.length === 0) throw new Error("Day info not found");

        setShipmentData({
          dayId: dayData[0]._id,
          day,
          month,
          year,
          companyId,
        });
      } catch (err) {
        console.error("⛔ Error during day initialization:", err);
      }
    };

    initializeDate();
  }, [token, companyId]);

  /**
   * Handles shipment creation and starts the loading sequence.
   */
  const handleShipmentSubmit = async (formData: any) => {
    try {
      const res = await fetch("http://localhost:5000/api/shipments", {
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

      if (!res.ok) throw new Error("Failed to create shipment");

      const shipment = await res.json();
      dispatch(clearShipmentInfo());
      dispatch(setDayId(shipmentData.dayId));
      dispatch(setDateMonth(shipmentData.month));
      dispatch(setDateDay(shipmentData.day));
      dispatch(setDateYear(shipmentData.year));
      dispatch(setShipmentId(shipment._id));
      dispatch(setShipmentTarget(shipment.carryingForDelivery));

      toast.success("✅ تم تسجيل الشحنة بنجاح");
      setShowLoadingModal(true);
    } catch (err: any) {
      toast.error("⚠️ فشل في تسجيل الشحنة: " + err.message);
      setShowLoadingModal(false);
    }
  };

  /**
   * Retry preloading shipment data after failure.
   */
  const handleRetryPreload = async () => {
    setIsRetrying(true);
    setPreloadError(false);
    try {
      await preloadShipmentData({
        dayId: shipmentData.dayId,
        token,
        companyId: shipmentData.companyId,
      });
      navigate(`/areas/${shipmentData.dayId}`);
    } catch (err) {
      toast.error("❌ لا تزال عملية التحميل غير ناجحة.");
      setPreloadError(true);
    } finally {
      setIsRetrying(false);
    }
  };

  /**
   * Progresses through steps with delay and preloads data after last step.
   */
  useEffect(() => {
    if (!showLoadingModal || currentStepIndex > steps.length) return;

    const timer = setTimeout(() => {
      if (currentStepIndex < steps.length) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        // Preload after last visible step
        preloadShipmentData({
          dayId: shipmentData.dayId,
          token,
          companyId: shipmentData.companyId,
        })
          .then(() => navigate(`/areas/${shipmentData.dayId}`))
          .catch((err) => {
            console.error("❌ Preloading failed:", err);
            setPreloadError(true);
            setShowLoadingModal(false);
            toast.error("⚠️ تعذر تحميل بيانات الشحنة");
          });
      }
    }, 2500);

    return () => clearTimeout(timer);
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

      {/* Retry UI if preload fails */}
      {preloadError && (
        <div className="retry-box">
          ⚠️ لم يتم تحميل البيانات بنجاح.
          <br />
          <button onClick={handleRetryPreload} disabled={isRetrying}>
            {isRetrying ? "جارٍ المحاولة..." : "أعد المحاولة"}
          </button>
        </div>
      )}

      {/* Dev-only reload shortcut */}
      {isDevMode && !preloadError && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button onClick={handleRetryPreload}>
            🔁 إعادة تحميل بيانات الشحنة
          </button>
        </div>
      )}

      {/* Animated shipment loading modal */}
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
