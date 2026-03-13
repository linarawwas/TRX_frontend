/**
 * StartShipment.tsx
 *
 * Purpose:
 * - Create today's shipment (first time in a day) OR start a new round within the same day's shipment.
 * - When it's a NEW shipment: clear previous shipment state, set today's date/day in Redux, preload day data offline, and navigate to areas.
 * - When it's a ROUND: only add to today's carrying target and snapshot today's baselines (delivered, returned, payments, etc.) so round stats work.
 *
 * UX Rules:
 * - Preload data ONLY for a brand-new shipment/day (NOT for rounds).
 * - Keep "customers progress" across rounds (no clearing or preloading on rounds).
 */

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { RootState } from "../../../redux/store";
import {
  // Shipment id/target & date/day setters
  setShipmentId,
  setShipmentTarget,
  setDateDay,
  setDateMonth,
  setDateYear,
  setDayId,

  // Resets
  clearShipmentInfo,

  // Exchange rate from preload
  setExchangeRateLBP,

  // Round state setters
  clearRoundInfo,
  setRoundInfo,
} from "../../../redux/Shipment/action";

import AddToModel from "../../AddToModel/AddToModel";
import { preloadShipmentData } from "../../../utils/preloadShipmentData";
import { createRoundOrShipment } from "../../../utils/createRoundOrShipment";
import { API_BASE } from "../../../config/api";
import { createLogger } from "../../../utils/logger";
import "./StartShipment.css";

const logger = createLogger("start-shipment");

/**
 * Top-level UI component that starts a shipment or a round.
 * Decides "intent" based on whether a shipment for 'today' is already present in Redux (prevShipmentId + prevDayId).
 */
const StartShipment: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Auth / Scope
  const token = useSelector((s: RootState) => s.user.token);

  // ── Previously loaded shipment identity in Redux
  const prevShipmentId = useSelector((s: RootState) => s.shipment._id);
  const prevDayId = useSelector((s: RootState) => s.shipment.dayId);

  // ── Local state: today's day mapping + date triple used by backend uniqueness
  const [shipmentData, setShipmentData] = useState<{
    dayId: string;
    day: number | null;
    month: number | null;
    year: number | null;
  }>({ dayId: "", day: null, month: null, year: null });

  // ── Preload modal + flow control
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [preloadError, setPreloadError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Progress UI for preloading
  const [progressPct, setProgressPct] = useState(0);
  const [progressNote, setProgressNote] = useState<string>("");
  const [areasTotal, setAreasTotal] = useState(0);
  const [areasDone, setAreasDone] = useState(0);
  const [lastCustomers, setLastCustomers] = useState<number | null>(null);
  const [currentArea, setCurrentArea] = useState<string>("");

  // ── Phase flags for visual ticks
  const [phaseMeta, setPhaseMeta] = useState(false);
  const [phaseCache, setPhaseCache] = useState(false);
  const [phaseAreas, setPhaseAreas] = useState(false);

  /**
   * Intent Heuristic:
   * - If Redux already has a shipment AND its dayId matches the dayId we're about to start → user is starting a ROUND.
   * - Otherwise, it’s a brand-new shipment for a different day.
   */
  const isRoundIntent =
    Boolean(prevShipmentId) && prevDayId === shipmentData.dayId;

  /**
   * SINGLE place that performs preload (kicks in only when showLoadingModal === true).
   * This runs for *new shipments only* (see where setShowLoadingModal(true) is called).
   */
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

    if (!token) return;
    preloadShipmentData({
      dayId: shipmentData.dayId,
      token,
      onProgress: (e) => {
        if (e.type === "start") {
          setProgressNote("بدء الإعداد...");
          setProgressPct(2);
        }
        if (e.type === "meta:fetched") {
          // Company/day metadata fetched (areas counts, etc.)
          setPhaseMeta(true);
          total = (e as any).companyAreas ?? (e as any).total ?? 0;
          done = 0;
          setAreasTotal(total);
          setProgressNote(
            `جاري قراءة المناطق: اليوم ${e.dayAreas} | الشركة ${(e as any).companyAreas ?? "?"}`
          );
          setProgressPct(pct());
        }
        if (e.type === "cache:done") {
          // Local IndexedDB caches completed
          setPhaseCache(true);
          setProgressNote("تجهيز قاعدة البيانات للتشغيل دون إنترنت");
          setProgressPct(pct());
        }
        if (e.type === "area:start") {
          // Started preloading an area
          setCurrentArea(e.name || "");
          setProgressNote(
            `منطقة: ${e.name || "بدون اسم"} (${e.index}/${e.total})`
          );
          setProgressPct(pct());
        }
        if (e.type === "area:customers") {
          // Customers count for the area (for live feel)
          setLastCustomers(e.customers);
        }
        if (e.type === "rate:fetched") {
          // Keep company LBP/USD exchange rate in Redux for later use
          dispatch(setExchangeRateLBP(e.rateLBP));
        }
        if (e.type === "area:done") {
          // Finished an area → progress
          done = e.index;
          setAreasDone(done);
          setProgressPct(pct());
          setPhaseAreas(done === total);
        }
        if (e.type === "done") {
          // All preloading done → small delay then go to Areas screen
          setProgressNote(
            `اكتمل التحضير ✓ تم تجهيز ${e.totals.areas} منطقة و ${e.totals.customers} زبون`
          );
          setProgressPct(100);
          setTimeout(() => navigate(`/areas/${shipmentData.dayId}`), 400);
        }
        if (e.type === "error") {
          // Any failure in the pipeline
          setPreloadError(true);
          setShowLoadingModal(false);
          toast.error("⚠️ فشل في تحميل البيانات");
        }
      },
    }).catch((err) => {
      logger.error("Preloading failed.", err);
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

  /**
   * Helper: return Beirut-local date parts + weekday label.
   * Backend uniqueness keys depend on (year, month, day).
   */
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

  /**
   * On mount: resolve today's Day document (by weekday → dayId),
   * and stash (dayId, year, month, day) into local component state.
   */
  useEffect(() => {
    if (!token) return;
    const initializeDate = async () => {
      try {
        const { year, month, day, weekday } = getBeirutParts();
        const response = await fetch(
          `${API_BASE}/api/days/name/${weekday}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Day info fetch failed");
        const data = await response.json();
        if (!data?.length) throw new Error("Day not found in DB");
        setShipmentData({ dayId: data[0]._id, day, month, year });
      } catch (err) {
        logger.error("Day initialization failed.", err);
        toast.error("تعذر تحديد يوم العمل");
      }
    };
    initializeDate();
  }, [token]);

  /**
   * Live "today totals" pulled from Redux.
   * We snapshot these the moment a ROUND starts, so the RoundSnapshot can
   * display deltas (this-round-only) correctly.
   */
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

  /**
   * Submit handler invoked by <AddToModel/>
   * - Validates payload
   * - Calls createRoundOrShipment (server decides whether this is a new shipment or a new round)
   * - Updates Redux:
   *    • NEW shipment → clear all shipment state FIRST, then set new ids/dates/target and preload
   *    • ROUND → set roundInfo baseline (no preload)
   *
   * ⚠️ IMPORTANT:
   * If you call `clearShipmentInfo()` AFTER setting setShipmentId/setShipmentTarget,
   * you'll wipe out the new values. Make sure clear happens *before* setting new ones.
   * This file currently sets id/target first then clears only in the isNewShipment branch.
   * If you see empty shipment id later, reorder those calls.
   */
  const handleShipmentSubmit = async (formData: any) => {
    if (isSubmitting || !token) return;

    // Basic guards: we must know today's dayId and date triple
    if (
      !shipmentData.dayId ||
      !shipmentData.day ||
      !shipmentData.month ||
      !shipmentData.year
    ) {
      toast.error("بيانات التاريخ غير مكتملة");
      return;
    }

    // Validate carrying
    const carry = Number(formData.carryingForDelivery || 0);
    if (!Number.isFinite(carry) || carry < 0) {
      toast.error("الكمية المحملة للتوصيل غير صالحة");
      return;
    }

    setIsSubmitting(true);
    try {
      // Payload sent to backend; server will either:
      //  - upsert today's shipment (and $inc carrying), returning shipment + round
      //  - or create a brand-new shipment for a different day
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

      // Server returns: { shipment, round?, isNewShipment? (we derive here) }
      const { shipment, round, isNewShipment } = await createRoundOrShipment({
        token,
        payload,
        prevShipmentId,
        prevDayId,
      });

      if (isNewShipment) {
        // ───────── NEW DAY / NEW SHIPMENT ─────────
        // Clear old shipment data and any round baselines
        // ⚠️ If you see empty _id later, move these clears ABOVE the two setters just above.
        dispatch(clearShipmentInfo());
        dispatch(clearRoundInfo());
        // Always store shipment id/target we got back (id used when recording orders)
        dispatch(setShipmentId(shipment._id));
        dispatch(setShipmentTarget(shipment.carryingForDelivery));
        logger.info("Created new shipment.", shipment);
        // Set today's date/day info for the new shipment
        dispatch(setDayId(shipment.dayId));
        dispatch(setDateDay(shipment.date.day));
        dispatch(setDateMonth(shipment.date.month));
        dispatch(setDateYear(shipment.date.year));

        toast.success("✅ تم تسجيل الشحنة (يوم جديد)");
        dispatch(
          setRoundInfo({
            sequence: Number(round?.sequence || 0),
            targetAdded: carry,
            startedAt: new Date().toISOString(),
          })
        );
        // Kick off preload only for a brand-new shipment
        setShowLoadingModal(true);
      } else {
        // ───────── SAME DAY → this is a ROUND ─────────
        // Snapshot baselines so RoundSnapshot can compute "this round only" deltas
        dispatch(setShipmentTarget(shipment.carryingForDelivery));
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

        // No preload for rounds (we keep customers/progress intact)
      }
    } catch (error: any) {
      logger.error("Failed to register shipment.", error);
      toast.error("⚠️ فشل في تسجيل الشحنة: " + (error?.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Form configuration passed to <AddToModel/> to render the simple “carrying” input and CTA.
   * The title & CTA text adapt to the detected intent (new shipment vs round).
   */
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

  /**
   * Confirmation dialog builder used by <AddToModel/> before sending the request.
   * - For rounds: explains we’re adding to today’s carrying target.
   * - For shipments: warns the user about the daily target cap.
   */
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

  // Dev helper flag (keep as-is)
  const isDevMode =
    new URLSearchParams(window.location.search).get("dev") === "true";

  /**
   * Render:
   * - <AddToModel/> (form + confirm)
   * - Retry box if preload failed
   * - Dev button: manual preload
   * - Preload overlay with progress (only shown during new shipment preload)
   */
  return (
    <>
      {/* Form to start shipment or round */}
      <AddToModel
        modelName={shipmentConfig["component-related-fields"].modelName}
        title={shipmentConfig["component-related-fields"].title}
        buttonLabel={shipmentConfig["component-related-fields"]["button-label"]}
        modelFields={shipmentConfig["model-related-fields"]}
        onSubmit={handleShipmentSubmit}
        confirmBuilder={buildShipmentConfirm}
      />

      {/* Preload error recovery */}
      {preloadError && (
        <div className="retry-box">
          ⚠️ لم يتم تحميل البيانات بنجاح.
          <br />
          <button
            onClick={async () => {
              if (!token) return;
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

      {/* Developer helper: reload data manually */}
      {isDevMode && !preloadError && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            onClick={async () => {
              if (!token) return;
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

      {/* New-shipment-only preload overlay */}
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

            {/* Phase ticks */}
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

            {/* Current action line */}
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

            {/* Why block (education) */}
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
