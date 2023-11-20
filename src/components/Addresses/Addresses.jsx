import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Addresses.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from "react-redux";
export default function Addresses() {
    const token = useSelector(state => state.user.token);
    // const companyId = useSelector(state => state.user.companyId);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { areaId } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        // Fetch days data from your API
        fetch(`http://localhost:5000/api/customers/area/${areaId}`, {
            headers: {
                Authorization: `Bearer ${ token}`,
            }
        }
        )
            .then((response) => response.json())
            .then((data) => {
                setCustomers(data);
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
                    Authorization: `Bearer ${ token}`,
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
                >
                    <FontAwesomeIcon icon={faTrash} />
                    Delete Area
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
