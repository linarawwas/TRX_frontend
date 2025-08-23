import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/store";
import { clearAreaId, setAreaId } from "../../../redux/Order/action";
// ⬇️ UPDATED imports to use the new helpers you added
import {
  getAreasByDayFromDB,
  getCompanyAreasFromDB,
  getDayFromDB,
} from "../../../utils/indexedDB";
import "./AreasForDay.css";

interface Area {
  _id: string;
  name: string;
  // ...any other fields you already have
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
  const companyId = useSelector((state: RootState) => state.user.companyId);

  const [dayAreas, setDayAreas] = useState<Area[]>([]);
  const [companyAreas, setCompanyAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dayName, setDayName] = useState<string>("");
  const [showOther, setShowOther] = useState<boolean>(false);

  // Compute “Other Areas” = company areas minus today’s
  const otherAreas = useMemo(() => {
    const ids = new Set(dayAreas.map((a) => a._id));
    return companyAreas.filter((a) => !ids.has(a._id));
  }, [dayAreas, companyAreas]);

  useEffect(() => {
    dispatch(clearAreaId());

    const loadCachedData = async () => {
      try {
        setLoading(true);

        if (!dayId) {
          setDayAreas([]);
          setCompanyAreas([]);
          setDayName("يوم غير معروف");
          return;
        }

        // new helpers you added in indexedDB.ts
        const [byDay, companyAll, cachedDay] = await Promise.all([
          getAreasByDayFromDB(dayId),
          getCompanyAreasFromDB(companyId || "tenant"),
          getDayFromDB(dayId),
        ]);

        setDayAreas(Array.isArray(byDay) ? byDay : []);
        setCompanyAreas(Array.isArray(companyAll) ? companyAll : []);

        if (cachedDay?.name) {
          setDayName(cachedDay.name);
        } else {
          setDayName("يوم غير معروف");
        }
      } catch (error) {
        console.error("❌ Failed to load from IndexedDB:", error);
        setDayName("خطأ في التحميل");
      } finally {
        setLoading(false);
      }
    };

    loadCachedData();
  }, [dayId, companyId, dispatch]);

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
      <h2 className="areas-title">🚚 اختر المنطقة ليوم {translatedDayName}</h2>

      {/* ====== Section 1: Areas for Today's Shipment ====== */}
      <div className="areas-list">
        {loading ? (
          <p className="loading-text">⏳ جارٍ التحميل...</p>
        ) : dayAreas.length > 0 ? (
          dayAreas.map(renderAreaCard)
        ) : (
          <p className="no-areas-text">😕 لا توجد مناطق محفوظة لهذا اليوم</p>
        )}
      </div>

      {/* ====== Section 2: Collapsible — Other Areas: External Shipment ====== */}
      <div className="other-areas-section" style={{ marginTop: "1rem" }}>
        <button
          type="button"
          className="external-shipment-button"
          onClick={() => setShowOther((s) => !s)}
          aria-expanded={showOther}
          aria-controls="other-areas-panel"
          // reusing your button style; feel free to create a separate class if you prefer
        >
          {showOther ? "إخفاء" : "عرض"} مناطق أخرى: شحنة خارجية
        </button>

        {showOther && (
          <div
            id="other-areas-panel"
            className="areas-list"
            style={{ marginTop: "0.75rem" }}
          >
            {loading ? (
              <p className="loading-text">⏳ جارٍ التحميل...</p>
            ) : otherAreas.length > 0 ? (
              otherAreas.map(renderAreaCard)
            ) : (
              <p className="no-areas-text">لا توجد مناطق إضافية.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
