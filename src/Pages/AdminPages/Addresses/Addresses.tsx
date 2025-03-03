import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./Addresses.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from "react-redux";

interface Customer {
    _id: string;
    address: string;
    name: string;
    phone: string;
}
export default function Addresses(): JSX.Element {
    const token: string = useSelector((state: any) => state.user.token);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { areaId } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        // Fetch days data from your API
        fetch(`http://localhost:5000/api/customers/area/${areaId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
        )
            .then((response) => response.json())
            .then((data) => {
                setCustomers(data);
                console.log(`number of customers of this area: ${data.length}`)

                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching days:", error);
                setLoading(false);
            });
    }, [areaId, token]);
    const handleDeleteArea = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/areas/${areaId}`, {
                method: 'DELETE', headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.ok) {
                toast.success('Area deleted successfully');

                setTimeout(() => {
                    navigate('/areas');
                }, 1500);
            } else {
                toast.error('Error deleting Area');

                // Handle errors here
                console.error('Error deleting Area');
            }
        } catch (error) {
            toast.error('Error deleting Area');

            console.error('Error deleting Area:', error);
        }
    };
    return (
        <div className="address-body">
            <ToastContainer position="top-right" autoClose={1000} />

            <div className='address-header'>
                <h1 className="address-title">Addresses Information:</h1>
                <button
                    type="button"
                    onClick={handleDeleteArea}
                    className="delete-button"
                >                    Delete Area
                </button>
            </div>            {loading ? (
                <p className="loading">Loading...</p>
            ) : (
                <table className="address-table">
                    <thead>
                        <tr>
                            <th>Address</th>
                            <th> Name</th>
                            <th>Phone</th>
                            <th>More</th>
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
                                <Link to={`/updateCustomer/${customer._id}`}>
                                    <td>Edit</td>
                                </Link>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
