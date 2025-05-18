import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/store";
import { clearAreaId, setAreaId } from "../../../redux/Order/action";
import {
  getAreasFromDB,
  getDayFromDB
} from "../../../utils/indexedDB";
import "./AreasForDay.css";

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
  const { dayId } = useParams();
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dayName, setDayName] = useState<string>("");

  useEffect(() => {
    dispatch(clearAreaId());

    const loadCachedData = async () => {
      try {
        setLoading(true);

        const cachedAreas = await getAreasFromDB(dayId);
        const cachedDay = await getDayFromDB(dayId);

        if (cachedAreas) {
          setAreas(cachedAreas);
        }

        if (cachedDay) {
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
  }, [dayId, dispatch]);

  const translatedDayName = arabicDayMap[dayName] || dayName;

  return (
    <div className="areas-container" dir="rtl">
      <h2 className="areas-title">🚚 اختر المنطقة ليوم {translatedDayName}</h2>

      <div className="areas-list">
        {loading ? (
          <p className="loading-text">⏳ جارٍ التحميل...</p>
        ) : areas.length > 0 ? (
          areas.map((area) => (
            <Link
              key={area._id}
              to={`/customers/${area._id}`}
              className="area-card-link"
              onClick={() => dispatch(setAreaId(area._id))}
            >
              <div className="area-card">
                 {area.name}
              </div>
            </Link>
          ))
        ) : (
          <p className="no-areas-text">😕 لا توجد مناطق محفوظة لهذا اليوم</p>
        )}
      </div>

      <div className="external-shipment-container">
        <Link to="/createExternalShipment" className="external-shipment-button">
          🚛 تسجيل طلب توصيل خارجي
        </Link>
      </div>
    </div>
  );
}
