import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom"; // Import useParams from react-router-dom
import { useSelector } from "react-redux";
export default function AreasForDay() {
    const token = useSelector(state => state.token);
    const companyId = useSelector(state => state.companyId);
    const { dayId } = useParams();
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dayName, setDayName] = useState('')
    useEffect(() => {
        // Fetch areas data for the specified day
        fetch(`http://localhost:5000/api/areas/days/${dayId}`, {
            headers: {
                Authorization: `Bearer ${ token}`,
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
    }, [dayId,  token]);
    useEffect(() => {
        // Fetch name of the the specified day
        fetch(`http://localhost:5000/api/days/${dayId}`, {
            headers: {
                Authorization: `Bearer ${ token}`,
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
    }, [dayId,  token]);

    return (
        <table className="days-table">
            <thead>
                <tr>
                    <th>Areas for {dayName}</th>
                </tr>
            </thead>
            {loading ? (
                <p>Loading ...</p>
            ) : (<tbody>
                {areas.map((area) => (
                    <tr key={area._id}>
                        <td>
                            <Link to={`/customers/${area._id}`}>{area.name}</Link>
                        </td>
                    </tr>
                ))}
            </tbody>)}

        </table>)
}
