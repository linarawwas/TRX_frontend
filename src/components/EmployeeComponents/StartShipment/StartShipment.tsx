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
  // inside StartShipment component

  // NEW progress state
  const [progressPct, setProgressPct] = useState(0);
  const [progressNote, setProgressNote] = useState<string>("");
  const [areasTotal, setAreasTotal] = useState(0);
  const [areasDone, setAreasDone] = useState(0);
  const [lastCustomers, setLastCustomers] = useState<number | null>(null);
  const [currentArea, setCurrentArea] = useState<string>("");

  // Phases (for ticks)
  const [phaseMeta, setPhaseMeta] = useState(false);
  const [phaseCache, setPhaseCache] = useState(false);
  const [phaseAreas, setPhaseAreas] = useState(false);

  // OPTIONAL: allow a “fast start” switch (loads today’s areas first)
  // keep it false by default to preserve your current behavior
  const [fastStart, setFastStart] = useState(false);

  // When shipment created, show modal and start preloading with progress
  useEffect(() => {
    if (!showLoadingModal || !shipmentData.dayId) return;

    let total = 0;
    let done = 0;

    const pct = () => {
      // 10% meta + 10% cache + 80% areas
      const base = (phaseMeta ? 10 : 0) + (phaseCache ? 10 : 0);
      const areaPct = total > 0 ? (done / total) * 80 : 0;
      return Math.min(100, Math.round(base + areaPct));
    };

    preloadShipmentData({
      dayId: shipmentData.dayId,
      token,
      onProgress: (e) => {
        if (e.type === "start") {
          setProgressNote("بدء الإعداد...");
          setProgressPct(2);
        }
        if (e.type === "meta:fetched") {
          setPhaseMeta(true);
          // if fastStart => we will do today's first
          total = fastStart
            ? e.dayAreas + (e.companyAreas - e.dayAreas)
            : e.companyAreas;
          done = 0;
          setAreasTotal(total);
          setProgressNote(
            `جاري قراءة المناطق: اليوم ${e.dayAreas} | الشركة ${e.companyAreas}`
          );
          setProgressPct(pct());
        }
        if (e.type === "cache:done") {
          setPhaseCache(true);
          setProgressNote("تجهيز قاعدة البيانات للتشغيل دون إنترنت");
          setProgressPct(pct());
        }
        if (e.type === "area:start") {
          setCurrentArea(e.name || "");
          setProgressNote(
            `منطقة: ${e.name || "بدون اسم"} (${e.index}/${e.total})`
          );
          setProgressPct(pct());
        }
        if (e.type === "area:customers") {
          setLastCustomers(e.customers);
        }
        if (e.type === "area:done") {
          done = e.index; // e.index is 1-based
          setAreasDone(done);
          setProgressPct(pct());
          setPhaseAreas(done === total);
        }
        if (e.type === "done") {
          setProgressNote(
            `اكتمل التحضير ✓ تم تجهيز ${e.totals.areas} منطقة و ${e.totals.customers} زبون`
          );
          setProgressPct(100);
          // small delay so the user sees 100%
          setTimeout(() => navigate(`/areas/${shipmentData.dayId}`), 400);
        }
        if (e.type === "error") {
          setPreloadError(true);
          setShowLoadingModal(false);
          toast.error("⚠️ فشل في تحميل البيانات");
        }
      },
      fastStart,
    }).catch((err) => {
      console.error("❌ Preloading failed:", err);
      setPreloadError(true);
      setShowLoadingModal(false);
      toast.error("⚠️ فشل في تحميل البيانات");
    });
  }, [showLoadingModal, shipmentData.dayId, token, navigate, fastStart]);

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
        "input-type": "digit-carousal",

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
            <h2>🚛 جاري تجهيز الشحنة</h2>
            <p className="loading-intro">
              نُحضّر كل شيء للعمل بلا إنترنت بأمان.
            </p>

            {/* Progress bar */}
            <div className="progress-wrap">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="progress-label">{progressPct}%</div>
            </div>

            {/* Simple ticks for phases */}
            <ul className="phase-list">
              <li className={phaseMeta ? "done" : ""}>
                قراءة بيانات اليوم والمناطق
              </li>
              <li className={phaseCache ? "done" : ""}>
                حفظ البيانات في الجهاز
              </li>
              <li className={phaseAreas ? "done" : ""}>
                تجهيز الزبائن لكل منطقة
              </li>
            </ul>

            {/* Live counters */}
            <div className="stats-row">
              <div className="stat">
                <div className="stat-num">
                  {areasDone}/{areasTotal}
                </div>
                <div className="stat-label">المناطق المُحضّرة</div>
              </div>
              <div className="stat">
                <div className="stat-num">{lastCustomers ?? "…"}</div>
                <div className="stat-label">زبائن آخر منطقة</div>
              </div>
            </div>

            {/* Current action */}
            <div className="current-action">
              <div className="pulse-dot" />
              <div>
                <div className="action-title">الآن:</div>
                <div className="action-text">{progressNote}</div>
                {currentArea && (
                  <div className="action-sub">
                    المنطقة الحالية: <strong>{currentArea}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Friendly clarifications */}
            <div className="why-block">
              <div className="why-title">لماذا ننتظر؟</div>
              <ul>
                <li>تحميل المناطق والزبائن ليعمل كل شيء بدون إنترنت.</li>
                <li>حفظ الخصومات والفواتير للتسجيل السريع في الطريق.</li>
                <li>ضمان إعادة الإرسال التلقائي عند عودة الشبكة.</li>
              </ul>
            </div>

            {/* Optional quick start */}
            {/* <div className="fast-start">
              <label>
                <input
                  type="checkbox"
                  checked={fastStart}
                  onChange={(e) => setFastStart(e.target.checked)}
                />
                بدء سريع: حمّل مناطق اليوم أولاً (ثم الباقي في الخلفية)
              </label>
            </div> */}

            <div className="progress-spinner" />
          </div>
        </div>
      )}
    </>
  );
};

export default StartShipment;
