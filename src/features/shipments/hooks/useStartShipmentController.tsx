import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { RootState } from "../../../redux/store";
import {
  selectShipmentLiveTotals,
  selectShipmentMeta,
} from "../../../redux/selectors/shipment";
import {
  clearRoundInfo,
  clearShipmentInfo,
  setDateDay,
  setDateMonth,
  setDateYear,
  setDayId,
  setExchangeRateLBP,
  setRoundInfo,
  setShipmentId,
  setShipmentTarget,
} from "../../../redux/Shipment/action";
import { createLogger } from "../../../utils/logger";
import {
  createRoundOrShipment,
  fetchDayByWeekday,
  preloadShipmentData,
} from "../apiShipments";

const logger = createLogger("start-shipment");

type ShipmentDateState = {
  dayId: string;
  day: number | null;
  month: number | null;
  year: number | null;
};

type ShipmentFormData = {
  carryingForDelivery?: number | string;
};

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

export function useStartShipmentController() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state: RootState) => state.user.token);
  const { id: prevShipmentId, dayId: prevDayId } = useSelector(selectShipmentMeta);
  const totalsNow = useSelector(selectShipmentLiveTotals);

  const [shipmentData, setShipmentData] = useState<ShipmentDateState>({
    dayId: "",
    day: null,
    month: null,
    year: null,
  });
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [preloadError, setPreloadError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [progressNote, setProgressNote] = useState("");
  const [areasTotal, setAreasTotal] = useState(0);
  const [areasDone, setAreasDone] = useState(0);
  const [lastCustomers, setLastCustomers] = useState<number | null>(null);
  const [currentArea, setCurrentArea] = useState("");
  const [phaseMeta, setPhaseMeta] = useState(false);
  const [phaseCache, setPhaseCache] = useState(false);
  const [phaseAreas, setPhaseAreas] = useState(false);

  const isRoundIntent =
    Boolean(prevShipmentId) && prevDayId === shipmentData.dayId;

  const runPreload = useCallback(async () => {
    if (!token || !shipmentData.dayId) return;

    let total = 0;
    let done = 0;
    let metaDone = false;
    let cacheDone = false;

    const pct = () =>
      Math.min(
        100,
        Math.round(
          (metaDone ? 10 : 0) +
            (cacheDone ? 10 : 0) +
            (total > 0 ? (done / total) * 80 : 0)
        )
      );

    setProgressPct(0);
    setProgressNote("");
    setAreasTotal(0);
    setAreasDone(0);
    setLastCustomers(null);
    setCurrentArea("");
    setPhaseMeta(false);
    setPhaseCache(false);
    setPhaseAreas(false);

    try {
      await preloadShipmentData({
        dayId: shipmentData.dayId,
        token,
        onProgress: (event) => {
          if (event.type === "start") {
            setProgressNote("بدء الإعداد...");
            setProgressPct(2);
            return;
          }

          if (event.type === "meta:fetched") {
            metaDone = true;
            total = event.dayAreas ?? 0;
            done = 0;
            setPhaseMeta(true);
            setAreasTotal(total);
            setProgressNote(`جاري قراءة مناطق اليوم: ${event.dayAreas}`);
            setProgressPct(pct());
            return;
          }

          if (event.type === "cache:done") {
            cacheDone = true;
            setPhaseCache(true);
            setProgressNote("تجهيز قاعدة البيانات للتشغيل دون إنترنت");
            setProgressPct(pct());
            return;
          }

          if (event.type === "area:start") {
            setCurrentArea(event.name || "");
            setProgressNote(
              `منطقة: ${event.name || "بدون اسم"} (${event.index}/${event.total})`
            );
            setProgressPct(pct());
            return;
          }

          if (event.type === "area:customers") {
            setLastCustomers(event.customers);
            return;
          }

          if (event.type === "rate:fetched") {
            dispatch(setExchangeRateLBP(event.rateLBP));
            return;
          }

          if (event.type === "area:done") {
            done = event.index;
            setAreasDone(done);
            setPhaseAreas(done === total);
            setProgressPct(pct());
            return;
          }

          if (event.type === "done") {
            setProgressNote(
              `اكتمل التحضير ✓ تم تجهيز ${event.totals.areas} منطقة و ${event.totals.customers} زبون`
            );
            setProgressPct(100);
            setTimeout(() => navigate(`/areas/${shipmentData.dayId}`), 400);
            return;
          }

          if (event.type === "error") {
            setPreloadError(true);
            setShowLoadingModal(false);
            toast.error("⚠️ فشل في تحميل البيانات");
          }
        },
      });
    } catch (error) {
      logger.error("Preloading failed.", error);
      setPreloadError(true);
      setShowLoadingModal(false);
      toast.error("⚠️ فشل في تحميل البيانات");
    }
  }, [dispatch, navigate, shipmentData.dayId, token]);

  useEffect(() => {
    if (!showLoadingModal || !shipmentData.dayId) return;
    void runPreload();
  }, [runPreload, shipmentData.dayId, showLoadingModal]);

  useEffect(() => {
    if (!token) return;

    const initializeDate = async () => {
      try {
        const { year, month, day, weekday } = getBeirutParts();
        const data = await fetchDayByWeekday(token, weekday);
        if (!data?.length) throw new Error("Day not found in DB");
        setShipmentData({ dayId: data[0]._id, day, month, year });
      } catch (error) {
        logger.error("Day initialization failed.", error);
        toast.error("تعذر تحديد يوم العمل");
      }
    };

    void initializeDate();
  }, [token]);

  const handleShipmentSubmit = async (formData: ShipmentFormData) => {
    if (isSubmitting || !token) return;

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

      const { shipment, round, isNewShipment } = await createRoundOrShipment({
        token,
        payload,
        prevShipmentId,
        prevDayId,
      });

      if (isNewShipment) {
        dispatch(clearShipmentInfo());
        dispatch(clearRoundInfo());
        dispatch(setShipmentId(shipment._id));
        dispatch(setShipmentTarget(shipment.carryingForDelivery));
        logger.info("Created new shipment.", shipment);
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
        setPreloadError(false);
        setShowLoadingModal(true);
        return;
      }

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
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      logger.error("Failed to register shipment.", error);
      toast.error("⚠️ فشل في تسجيل الشحنة: " + message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const buildShipmentConfirm = (data: Record<string, unknown>) => {
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

  const handleRetryPreload = () => {
    if (!token || !shipmentData.dayId) return;
    setPreloadError(false);
    setShowLoadingModal(true);
  };

  const handleDevReload = async () => {
    if (!token || !shipmentData.dayId) return;
    try {
      await preloadShipmentData({ dayId: shipmentData.dayId, token });
      navigate(`/areas/${shipmentData.dayId}`);
    } catch {
      toast.error("❌ تعذر تحميل بيانات الشحنة.");
    }
  };

  const isDevMode =
    new URLSearchParams(window.location.search).get("dev") === "true";

  return {
    areasDone,
    areasTotal,
    buildShipmentConfirm,
    currentArea,
    handleDevReload,
    handleRetryPreload,
    handleShipmentSubmit,
    isDevMode,
    lastCustomers,
    phaseAreas,
    phaseCache,
    phaseMeta,
    preloadError,
    progressNote,
    progressPct,
    shipmentConfig,
    showLoadingModal,
  };
}
