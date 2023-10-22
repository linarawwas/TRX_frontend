import React, { useState, useEffect } from "react";
import {  useParams } from "react-router-dom";
import "../Days/Days.css";

export default function Addresses() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { areaId } = useParams();
    useEffect(() => {
        // Fetch days data from your API
        fetch(`http://localhost:5000/api/customers/area/${areaId}`)
            .then((response) => response.json())
            .then((data) => {
                setCustomers(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching days:", error);
                setLoading(false);
            });
    }, [areaId]);

    return (
        <div className="address-body">
            <h2 className="address-title">Distribution Addresses</h2>
            {loading ? (
                <p className="loading">Loading...</p>
            ) : (
                <table className="address-table">
                    <thead>
                        <tr>
                            <th>Address</th>
                            <th> Name</th>
                            <th>Phone</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer._id}>
                                <td>
                                    {customer.address}
                                </td>                                <td>
                                    {customer.name}
                                </td>                                <td>
                                    {customer.phone}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
