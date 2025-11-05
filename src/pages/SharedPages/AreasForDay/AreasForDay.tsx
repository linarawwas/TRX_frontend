// AreasForDay.tsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearAreaId, setAreaId } from "../../../redux/Order/action";
import { getAreasByDayFromDB, getDayFromDB } from "../../../utils/indexedDB";
import "./AreasForDay.css";
import RoundSnapshot from "../../../components/AsideMenu/Right/RoundSnapshot";
import { t } from "../../../utils/i18n";

interface Area {
  _id: string;
  name: string;
}

const arabicDayMap: Record<string, string> = {
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت",
};

export default function AreasForDay(): JSX.Element {
  const dispatch = useDispatch();
  const { dayId } = useParams<{ dayId: string }>();

  const [dayAreas, setDayAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dayName, setDayName] = useState<string>("");

  useEffect(() => {
    dispatch(clearAreaId());

    const loadCachedData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!dayId) {
          setDayAreas([]);
          setDayName(t("addresses.areasForDay.unknownDay"));
          setLoading(false);
          return;
        }

        const [byDay, cachedDay] = await Promise.all([
          getAreasByDayFromDB(dayId),
          getDayFromDB(dayId),
        ]);

        setDayAreas(Array.isArray(byDay) ? byDay : []);

        if (cachedDay?.name) {
          setDayName(cachedDay.name);
        } else {
          setDayName(t("addresses.areasForDay.unknownDay"));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("❌ Failed to load from IndexedDB:", err);
        setError(message);
        setDayName(t("addresses.areasForDay.loadError"));
        setDayAreas([]);
      } finally {
        setLoading(false);
      }
    };

    loadCachedData();
  }, [dayId, dispatch]);

  const translatedDayName = arabicDayMap[dayName] || dayName;

  const renderAreaCard = (area: Area) => (
    <Link
      key={area._id}
      to={`/customers/${area._id}`}
      className="area-card-link"
      onClick={() => dispatch(setAreaId(area._id))}
    >
      <div className="area-card">{area.name}</div>
    </Link>
  );

  return (
    <div className="areas-container" dir="rtl">
      <h2 className="areas-title">
        {t("addresses.areasForDay.title", { dayName: translatedDayName })}
      </h2>

      <div className="areas-list">
        {loading ? (
          <p className="loading-text" role="status" aria-live="polite">
            {t("addresses.areasForDay.loading")}
          </p>
        ) : error ? (
          <p className="no-areas-text" role="alert">
            {t("common.error")}: {error}
          </p>
        ) : dayAreas.length > 0 ? (
          dayAreas.map(renderAreaCard)
        ) : (
          <p className="no-areas-text">{t("addresses.areasForDay.empty")}</p>
        )}
      </div>
      <Link to={"/areas"}>
        <div className="other-areas-section" style={{ marginTop: "1rem" }}>
          <button type="button" className="external-shipment-button">
            {t("addresses.areasForDay.otherAreas")}
          </button>
        </div>
      </Link>
    </div>
  );
}
