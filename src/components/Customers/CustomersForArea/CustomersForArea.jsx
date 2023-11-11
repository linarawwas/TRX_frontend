import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams from react-router-dom

export default function CustomersForArea({ match }) {
    const { areaId } = useParams();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const token=localStorage.getItem('token');

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
    }, [areaId,token]);

    return (
        <table className="days-table">
            <thead>
                <tr>
                    <th className="table-title">Customers of This Area</th>
                </tr>                <tr>
                    <th> name</th>
                    <th> Address</th>
                    <th> Phone Number</th>
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
                    </tr>
                ))}
            </tbody>)}

        </table>)
}
