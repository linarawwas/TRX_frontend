// Refactored AreasForDay.tsx to always load from IndexedDB
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./AreasForDay.css";
import { RootState } from "../../../redux/store";
import { clearAreaId, setAreaId } from "../../../redux/Order/action";
import {
  getAreasFromDB,
  getDayFromDB
} from "../../../utils/indexedDB";

interface Area {
  _id: string;
  name: string;
}

export default function AreasForDay(): JSX.Element {
  const dispatch = useDispatch();
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const { dayId } = useParams();
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
        } else {
          console.warn("⚠️ No cached areas found for this day.");
        }

        if (cachedDay) {
          setDayName(cachedDay.name);
        } else {
          console.warn("⚠️ No cached day name found.");
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

  return (
    <table className="areas-for-day-table" dir="rtl" style={{ textAlign: "right" }}>
      <thead>
        <tr>
          <th>المناطق ليوم {dayName}</th>
        </tr>
      </thead>

      {loading ? (
        <tbody>
          <tr>
            <td colSpan={2}>جارٍ التحميل...</td>
          </tr>
        </tbody>
      ) : (
        <tbody>
          {areas?.length > 0 ? (
            areas.map((area) => (
              <tr key={area._id}>
                <td>
                  <Link to={`/customers/${area._id}`}>
                    <button onClick={() => dispatch(setAreaId(area._id))}>
                      {area.name}
                    </button>
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2}>لا توجد مناطق متاحة</td>
            </tr>
          )}
        </tbody>
      )}
    </table>
  );
}
