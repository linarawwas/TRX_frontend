import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearAreaId, setAreaId } from "../../../redux/Order/action";
import './AreasForDay.css';

interface Area {
  _id: string;
  name: string;
}

export default function AreasForDay(): JSX.Element {
  const dispatch = useDispatch();
  const token: string = useSelector((state: any) => state.user.token);
  const { dayId } = useParams();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dayName, setDayName] = useState<string>('');

  useEffect(() => {
    dispatch(clearAreaId());

    // Fetch areas data for the specified day
    fetch(`http://localhost:5000/api/areas/days/${dayId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data: Area[]) => {
        setAreas(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching areas:', error);
        setLoading(false);
      });
  }, [dayId, dispatch, token]);

  useEffect(() => {
    // Fetch name of the specified day
    fetch(`http://localhost:5000/api/days/${dayId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setDayName(data.name);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching areas:', error);
        setLoading(false);
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
          {areas.map((area) => (
            <tr key={area._id}>
              <td>
                <Link to={`/customers/${area._id}`}>
                  <button onClick={() => { dispatch(setAreaId(area._id)) }}>
                    {area.name}
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      )}
    </table>
  );
}
