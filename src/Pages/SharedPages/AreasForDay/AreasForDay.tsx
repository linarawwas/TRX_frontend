import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./AreasForDay.css";
import { RootState } from "../../../redux/store";
import { clearAreaId, setAreaId } from "../../../redux/Order/action";
import { saveAreasToDB, getAreasFromDB } from "../../../utils/indexedDB"; // Import IndexedDB helper

interface Area {
  _id: string;
  name: string;
}

export default function AreasForDay(): JSX.Element {
  const dispatch = useDispatch();
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const token: string = useSelector((state: RootState) => state.user.token);
  const { dayId } = useParams();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dayName, setDayName] = useState<string>("");

  useEffect(() => {
    dispatch(clearAreaId());

    const fetchData = async () => {
      try {
        setLoading(true);
        if (navigator.onLine) {
          const response = await fetch(`http://localhost:5000/api/areas/days/${dayId}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ companyId }),
          });

          if (!response.ok) throw new Error("Network response was not ok");

          const data = await response.json();
          setAreas(data);
          console.log("Fetched areas from API:", data);

          // Save data to IndexedDB using the helper function
          await saveAreasToDB(dayId, data);
        } else {
          console.log("No internet connection, loading from IndexedDB");

          // Load from IndexedDB using the helper function
          const cachedData = await getAreasFromDB(dayId);
          if (cachedData) {
            console.log("Loaded areas from IndexedDB:", cachedData);
            setAreas(cachedData);
          } else {
            console.log("No cached data found.");
          }
        }
      } catch (error) {
        console.error("Error fetching areas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dayId, companyId, token]);

  useEffect(() => {
    // Fetch name of the specified day
    fetch(`http://localhost:5000/api/days/${dayId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setDayName(data?.name || "Unknown Day");
      })
      .catch((error) => {
        console.error("Error fetching day name:", error);
      });
  }, [dayId, token]);

  return (
    <table className="areas-for-day-table">
      <thead>
        <tr>
          <th>Areas for {dayName}</th>
        </tr>
      </thead>
      {loading ? (
        <tbody>
          <tr>
            <td colSpan={2}>Loading...</td>
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
              <td colSpan={2}>No areas available</td>
            </tr>
          )}
        </tbody>
      )}
    </table>
  );
}
