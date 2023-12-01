import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom"; // Import useParams from react-router-dom
import { useSelector, useDispatch } from "react-redux";
import { clearAreaId, setAreaId } from "../../../redux/Order/action";
import './AreasForDay.css'
export default function AreasForDay() {
    const dispatch = useDispatch();
    const token = useSelector(state => state.user.token);
    // const companyId = useSelector(state => state.user.companyId);
    const { dayId } = useParams();
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dayName, setDayName] = useState('')
    useEffect(() => {
        dispatch(clearAreaId())
        // Fetch areas data for the specified day
        fetch(`http://localhost:5000/api/areas/days/${dayId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then((response) => response.json())
            .then((data) => {
                setAreas(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching areas:', error);
                setLoading(false);
            });
    }, [dayId, dispatch, token]);
    useEffect(() => {
        // Fetch name of the the specified day
        fetch(`http://localhost:5000/api/days/${dayId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
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
        <table className="days-table">
            <thead>
                <tr>
                    <th>Areas for {dayName}</th>
                </tr>
            </thead>
            {loading ? (
                <tbody>
                    <tr>
                        <td colSpan="2">Loading...</td>
                    </tr></tbody>
            ) : (<tbody>
                {areas.map((area) => (
                    <tr key={area._id}>
                        <td>
                            <Link to={`/customers/${area._id}`}>
                                <button onClick={() => { dispatch(setAreaId(area._id)) }}>
                                    {area.name} </button>
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>)}

        </table>)
}
