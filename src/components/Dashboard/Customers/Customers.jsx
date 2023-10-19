import React, { useState, useEffect } from "react";

export default function Customers({ match }) {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // Fetch areas data for the specified day
        fetch(`http://localhost:5000/api/customers`)
            .then((response) => response.json())
            .then((data) => {
                setCustomers(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching areas:', error);
                setLoading(false);
            });
    }, [customers]);
    return (
        <table className="days-table">
            <thead>
            <tr>
                    <th>All Customers</th>
                </tr>                
                <tr>
                <th>name</th>
                <th>phone</th>
                <th>address</th>
                </tr>
            </thead>
            {loading? (
                <p>Loading ...</p>
            ):(<tbody>
                {customers.map((customer) => (
                    <tr key={customer._id}>
                        <td>{customer.name} </td>
                        <td>{customer.phone} </td>
                        <td>{customer.address} </td>
                    </tr>
                ))}
            </tbody>)}

        </table>)
}
