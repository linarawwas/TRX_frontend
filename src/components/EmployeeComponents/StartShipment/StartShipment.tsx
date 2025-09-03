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
  setExchangeRateLBP,
  clearRoundInfo,
  setRoundInfo,
} from "../../../redux/Shipment/action";
import AddToModel from "../../AddToModel/AddToModel";
import { preloadShipmentData } from "../../../utils/preloadShipmentData";
import { createRoundOrShipment } from "../../../utils/createRoundOrShipment";

import "./StartShipment.css";

const StartShipment: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((s: RootState) => s.user.token);
  const prevShipmentId = useSelector((s: RootState) => s.shipment._id);
  const prevDayId = useSelector((s: RootState) => s.shipment.dayId);

  const [shipmentData, setShipmentData] = useState<{
    dayId: string;
    day: number | null;
    month: number | null;
    year: number | null;
  }>({ dayId: "", day: null, month: null, year: null });

  // preload modal + progress
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [preloadError, setPreloadError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [progressPct, setProgressPct] = useState(0);
  const [progressNote, setProgressNote] = useState<string>("");
  const [areasTotal, setAreasTotal] = useState(0);
  const [areasDone, setAreasDone] = useState(0);
  const [lastCustomers, setLastCustomers] = useState<number | null>(null);
  const [currentArea, setCurrentArea] = useState<string>("");

  const [phaseMeta, setPhaseMeta] = useState(false);
  const [phaseCache, setPhaseCache] = useState(false);
  const [phaseAreas, setPhaseAreas] = useState(false);

  // derive intent: if Redux already has a shipment for (today's dayId), it's a round
  const isRoundIntent =
    Boolean(prevShipmentId) && prevDayId === shipmentData.dayId;

  // SINGLE place that performs preload (only when showLoadingModal === true)
  useEffect(() => {
    if (!showLoadingModal || !shipmentData.dayId) return;

    let total = 0;
    let done = 0;
    const pct = () =>
      Math.min(
        100,
        Math.round(
          (phaseMeta ? 10 : 0) +
            (phaseCache ? 10 : 0) +
            (total > 0 ? (done / total) * 80 : 0)
        )
      );

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
          total = e.companyAreas;
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
        if (e.type === "area:customers") setLastCustomers(e.customers);
        if (e.type === "rate:fetched") dispatch(setExchangeRateLBP(e.rateLBP));
        if (e.type === "area:done") {
          done = e.index;
          setAreasDone(done);
          setProgressPct(pct());
          setPhaseAreas(done === total);
        }
        if (e.type === "done") {
          setProgressNote(
            `اكتمل التحضير ✓ تم تجهيز ${e.totals.areas} منطقة و ${e.totals.customers} زبون`
          );
          setProgressPct(100);
          setTimeout(() => navigate(`/areas/${shipmentData.dayId}`), 400);
        }
        if (e.type === "error") {
          setPreloadError(true);
          setShowLoadingModal(false);
          toast.error("⚠️ فشل في تحميل البيانات");
        }
      },
    }).catch((err) => {
      console.error("❌ Preloading failed:", err);
      setPreloadError(true);
      setShowLoadingModal(false);
      toast.error("⚠️ فشل في تحميل البيانات");
    });
  }, [
    showLoadingModal,
    shipmentData.dayId,
    token,
    dispatch,
    navigate,
    phaseMeta,
    phaseCache,
  ]);

  // Resolve today's dayId from weekday
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
        setShipmentData({ dayId: data[0]._id, day, month, year });
      } catch (err) {
        console.error("❌ Day initialization failed:", err);
        toast.error("تعذر تحديد يوم العمل");
      }
    };
    initializeDate();
  }, [token]);

  // StartShipment.tsx (only the parts that change)

  // Totals to snapshot as baseline if we start a round
  const totalsNow = useSelector((s: any) => ({
    delivered: s.shipment.delivered || 0,
    returned: s.shipment.returned || 0,
    dollarPayments: s.shipment.dollarPayments || 0,
    liraPayments: s.shipment.liraPayments || 0,
    expensesInUSD: s.shipment.expensesInUSD || 0,
    expensesInLiras: s.shipment.expensesInLiras || 0,
    profitsInUSD: s.shipment.profitsInUSD || 0,
    profitsInLiras: s.shipment.profitsInLiras || 0,
  }));

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

    const carry = Number(formData.carryingForDelivery || 0);
    if (!Number.isFinite(carry) || carry < 0) {
      toast.error("الكمية المحملة للتوصيل غير صالحة");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        dayId: shipmentData.dayId,
        type: 1,
        carryingForDelivery: carry,
        date: {
          day: shipmentData.day,
          month: shipmentData.month,
          year: shipmentData.year,
        },
      };

      // 🔸 Use the pure helper
      const { shipment, round, isNewShipment } = await createRoundOrShipment({
        token,
        payload,
        prevShipmentId,
        prevDayId,
      });

      // Always store these
      dispatch(setShipmentId(shipment._id));
      dispatch(setShipmentTarget(shipment.carryingForDelivery));

      if (isNewShipment) {
        // New day shipment → clear & set date/day state, then preload
        dispatch(clearShipmentInfo());
        dispatch(clearRoundInfo());
        dispatch(setDayId(shipment.dayId));
        dispatch(setDateDay(shipment.date.day));
        dispatch(setDateMonth(shipment.date.month));
        dispatch(setDateYear(shipment.date.year));

        toast.success("✅ تم تسجيل الشحنة (يوم جديد)");
        setShowLoadingModal(true); // <-- ONLY here we preload
      } else {
        // Same day → it's a round; capture baseline & do NOT preload
        dispatch(
          setRoundInfo({
            sequence: Number(round?.sequence || 0),
            targetAdded: carry,
            baseDelivered: totalsNow.delivered,
            baseReturned: totalsNow.returned,
            baseUsd: totalsNow.dollarPayments,
            baseLbp: totalsNow.liraPayments,
            baseExpUsd: totalsNow.expensesInUSD,
            baseExpLbp: totalsNow.expensesInLiras,
            baseProfUsd: totalsNow.profitsInUSD,
            baseProfLbp: totalsNow.profitsInLiras,
            startedAt: new Date().toISOString(),
          })
        );

        toast.success(
          `🚚 بدأت الجولة #${round?.sequence || "?"}. الهدف اليومي الآن: ${
            shipment.carryingForDelivery
          }`
        );
        // no setShowLoadingModal here (no preload for rounds)
      }
    } catch (error: any) {
      console.error(error);
      toast.error("⚠️ فشل في تسجيل الشحنة: " + (error?.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI text adapts automatically
  const shipmentConfig = {
    "component-related-fields": {
      modelName: "الشحنات",
      title: isRoundIntent
        ? "بدء جولة جديدة لليوم نفسه"
        : "إنهاء الشحنة السابقة وبدء شحنة اليوم",
      "button-label": isSubmitting
        ? "جارٍ التنفيذ…"
        : isRoundIntent
        ? "بدء الجولة"
        : "بدء الشحنة",
    },
    "model-related-fields": {
      carryingForDelivery: {
        label: "الكمية المحملة للتوصيل",
        "input-type": "digit-carousal",
        min: 0,
      },
    },
  };

  const buildShipmentConfirm = (data: Record<string, any>) => {
    const qty = Number(data.carryingForDelivery || 0);
    return {
      title: isRoundIntent ? "تأكيد بدء الجولة" : "تأكيد بدء الشحنة",
      body: (
        <div className="confirm-block">
          <p style={{ marginTop: 0 }}>
            {isRoundIntent ? (
              <>
                سيتم إضافة <strong>{qty}</strong> قنينة إلى حمولة الشحنة الحالية
                لليوم.
              </>
            ) : (
              <>
                هل أنت متأكد من بدء شحنة اليوم بـ <strong>{qty}</strong> قنينة
                كهدف للتسليم؟
              </>
            )}
          </p>
          {!isRoundIntent && (
            <p
              style={{
                color: "#7a2e2e",
                background: "#fff1f2",
                border: "1px solid #fecdd3",
                padding: "8px 10px",
                borderRadius: "10px",
              }}
            >
              <strong>تنبيه:</strong> لن تتمكن من تسليم أكثر من هذا الهدف ضمن
              هذه الشحنة. عند الوصول يمكنك بدء جولة جديدة لزيادة الحمولة.
            </p>
          )}
        </div>
      ),
    };
  };

  const isDevMode =
    new URLSearchParams(window.location.search).get("dev") === "true";

  return (
    <>
      <AddToModel
        modelName={shipmentConfig["component-related-fields"].modelName}
        title={shipmentConfig["component-related-fields"].title}
        buttonLabel={shipmentConfig["component-related-fields"]["button-label"]}
        modelFields={shipmentConfig["model-related-fields"]}
        onSubmit={handleShipmentSubmit}
        confirmBuilder={buildShipmentConfirm}
      />

      {preloadError && (
        <div className="retry-box">
          ⚠️ لم يتم تحميل البيانات بنجاح.
          <br />
          <button
            onClick={async () => {
              try {
                setPreloadError(false);
                await preloadShipmentData({ dayId: shipmentData.dayId, token });
                navigate(`/areas/${shipmentData.dayId}`);
              } catch {
                setPreloadError(true);
              }
            }}
          >
            أعد المحاولة
          </button>
        </div>
      )}

      {isDevMode && !preloadError && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            onClick={async () => {
              try {
                await preloadShipmentData({ dayId: shipmentData.dayId, token });
                navigate(`/areas/${shipmentData.dayId}`);
              } catch {
                toast.error("❌ تعذر تحميل بيانات الشحنة.");
              }
            }}
          >
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

            <div className="progress-wrap">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="progress-label">{progressPct}%</div>
            </div>

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

            <div className="why-block">
              <div className="why-title">لماذا ننتظر؟</div>
              <ul>
                <li>تحميل المناطق والزبائن ليعمل كل شيء بدون إنترنت.</li>
                <li>حفظ الخصومات والفواتير للتسجيل السريع في الطريق.</li>
                <li>ضمان إعادة الإرسال التلقائي عند عودة الشبكة.</li>
              </ul>
            </div>

            <div className="progress-spinner" />
          </div>
        </div>
      )}
    </>
  );
};

export default StartShipment;
