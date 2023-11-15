import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Import useParams from react-router-dom
import { useSelector, useDispatch } from "react-redux";
import { recordOrder } from '../../../redux/OrderReducer/action.js';
export default function CustomersForArea() {
    const token = useSelector(state => state.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { areaId } = useParams();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleRecordOrder = (customerId,areaId) => {
        dispatch(recordOrder({ customerId, areaId }));
        navigate('/recordOrder');
    };
    useEffect(() => {
        // Fetch areas data for the specified day
        fetch(`http://localhost:5000/api/customers/area/${areaId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then((response) => response.json())
            .then((data) => {
                setCustomers(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching areas:', error);
                setLoading(false);
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    }, [areaId, token]);

    return (
        <table className="days-table">
            <thead>
                <tr>
                    <th className="table-title">Customers of This Area</th>
                </tr>                <tr>
                    <th> name</th>
                    <th> Address</th>
                    <th> Phone Number</th>
                    <th>Record Order</th>
                </tr>
            </thead>
            {loading ? (
                <p>Loading ...</p>
            ) : (<tbody>
                {customers.map((customer) => (
                    <tr key={customer._id}>
                        <td>{customer.name}</td>
                        <td>{customer.address}</td>
                        <td>{customer.phone}</td>
                        <td>
                            <button onClick={handleRecordOrder(customer._id,areaId)}> record order</button>
                        </td>
                    </tr>
                ))}
            </tbody>)}

        </table>)
}
