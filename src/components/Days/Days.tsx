import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Days.css';
import { useSelector } from 'react-redux';

interface Day {
  _id: string;
  name: string;
}

const Days: React.FC = () => {
  const token: string = useSelector((state: any) => state.user.token);
  const companyId: string = useSelector((state: any) => state.user.companyId);
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/days/company/${companyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data: Day[]) => {
        setDays(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching days:', error);
        setLoading(false);
      });
  }, [token, companyId]);

  return (
    <div className="daysBody">
      <h2 className="daysTitle">Distribution Days</h2>
      {loading ? (
        <SpinLoader/> 
      ) : (
        <table className="days-table">
          <thead>
            <tr>
              <th>Day</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day._id}>
                <td>
                  <Link to={`/areas/${day._id}`}>{day.name}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Days;
