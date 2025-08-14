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

  const [shipmentData, setShipmentData] = useState<{
    dayId: string;
    day: number | null;
    month: number | null;
    year: number | null;
  }>({ dayId: "", day: null, month: null, year: null });

  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [preloadError, setPreloadError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Beirut-local date helpers
  function getBeirutParts() {
    const now = new Date();
    const ymd = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Beirut",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(now)
      .split("-");
    const year = parseInt(ymd[0], 10);
    const month = parseInt(ymd[1], 10);
    const day = parseInt(ymd[2], 10);
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Beirut",
      weekday: "long",
    }).format(now);
    return { year, month, day, weekday };
  }

  useEffect(() => {
    const initializeDate = async () => {
      try {
        const { year, month, day, weekday } = getBeirutParts();

        const response = await fetch(
          `http://localhost:5000/api/days/name/${weekday}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Day info fetch failed");

        const data = await response.json();
        if (!data?.length) throw new Error("Day not found in DB");

        setShipmentData({
          dayId: data[0]._id,
          day,
          month,
          year,
        });
      } catch (err) {
        console.error("❌ Day initialization failed:", err);
        toast.error("تعذر تحديد يوم العمل");
      }
    };

    initializeDate();
  }, [token]);

  const handleShipmentSubmit = async (formData: any) => {
    if (isSubmitting) return;
    if (
      !shipmentData.dayId ||
      !shipmentData.day ||
      !shipmentData.month ||
      !shipmentData.year
    ) {
      toast.error("بيانات التاريخ غير مكتملة");
      return;
    }

    const carrying = Number(formData.carryingForDelivery || 0);
    if (!Number.isFinite(carrying) || carrying < 0) {
      toast.error("الكمية المحملة للتوصيل غير صالحة");
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ Backend derives companyId/sequence/dateKey/dateStamp
      const payload = {
        dayId: shipmentData.dayId,
        type: 1, // 1 = normal
        carryingForDelivery: carrying,
        date: {
          day: shipmentData.day,
          month: shipmentData.month,
          year: shipmentData.year,
        },
      };

      const response = await fetch("http://localhost:5000/api/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const shipment = await response.json().catch(() => ({}));
      if (!response.ok || !shipment?._id) {
        throw new Error(shipment?.error || "Shipment creation failed");
      }

      // Push into Redux
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
      console.error(error);
      toast.error("⚠️ فشل في تسجيل الشحنة: " + (error?.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryPreload = async () => {
    setIsRetrying(true);
    setPreloadError(false);
    try {
      // If your preloadShipmentData still needs companyId, keep passing it.
      await preloadShipmentData({
        dayId: shipmentData.dayId,
        token,
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
        })
          .then(() => navigate(`/areas/${shipmentData.dayId}`))
          .catch((err) => {
            console.error("❌ Preloading failed:", err);
            setPreloadError(true);
            setShowLoadingModal(false);
            toast.error("⚠️ فشل في تحميل البيانات");
          });
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [currentStepIndex, showLoadingModal, shipmentData.dayId, token, navigate]);

  // StartShipment.tsx (only changes shown)
  const shipmentConfig = {
    "component-related-fields": {
      modelName: "الشحنات",
      title: "إنهاء الشحنة السابقة وبدء أخرى جديدة",
      "button-label": isSubmitting ? "جارٍ الإنشاء…" : "بدء الشحنة",
    },
    "model-related-fields": {
      carryingForDelivery: {
        label: "الكمية المحملة للتوصيل",
        "input-type": "numberPicker",
        min: 0,
      },
    },
  };

  // Confirmation content tailored for shipments
  const buildShipmentConfirm = (data: Record<string, any>) => {
    const qty = Number(data.carryingForDelivery || 0);
    return {
      title: "تأكيد بدء الشحنة",
      body: (
        <div className="confirm-block">
          <p style={{ marginTop: 0 }}>
            هل أنت متأكد من بدء الشحنة بـ <strong>{qty}</strong> قنينة كهدف
            للتسليم؟
          </p>
          <p
            style={{
              color: "#7a2e2e",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              padding: "8px 10px",
              borderRadius: "10px",
            }}
          >
            <strong>تنبيه:</strong> لن تتمكن من تسليم أكثر من هذا الهدف ضمن هذه
            الشحنة. عند الوصول، ستحتاج لبدء شحنة جديدة.
          </p>
        </div>
      ),
    };
  };

  return (
    <>
      <AddToModel
        modelName={shipmentConfig["component-related-fields"].modelName}
        title={shipmentConfig["component-related-fields"].title}
        buttonLabel={shipmentConfig["component-related-fields"]["button-label"]}
        modelFields={shipmentConfig["model-related-fields"]}
        onSubmit={handleShipmentSubmit}
        confirmBuilder={buildShipmentConfirm} // 👈 add this
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
