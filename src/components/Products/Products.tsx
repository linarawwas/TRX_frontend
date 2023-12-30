import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AddProducts from '../AddProducts';
import './ViewProducts.css';
import '../../../Customers/CustomerInvoices/CustomerInvoices.css'
interface Products {
    _id: string;
    name: string;
    value: number | string;
    paymentCurrency: string;
    exchangeRate: string;
    valueInUSD: number;
    companyId: string;
    shipmentId: string;
    timestamp: string;
    recordedBy: string;
    __v: number;
}
const Products: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(4);
    const [showAddProducts, setShowAddProducts] = useState<Boolean>(false);
    const companyId = useSelector((state: any) => state.user.companyId);
    const [extraProducts, setProducts] = useState<Products[]>([]);
    const [loading, setLoading] = useState(true);
    const token: string = useSelector((state: any) => state.user.token);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/products/company/${companyId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = response.data;
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching extra products:', error);
                setLoading(false);
            }
        }
        if (companyId) {
            fetchProducts();
        }
    }, [companyId, token, showAddProducts]);

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = extraProducts.slice(indexOfFirstRecord, indexOfLastRecord);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const renderPagination = () => {
        return (
            <ul className="pagination">
                {Array.from({ length: Math.ceil(extraProducts.length / recordsPerPage) }, (_, index) => (
                    <li key={index} onClick={() => paginate(index + 1)} className={`pagination-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        {index + 1}
                    </li>
                ))}
            </ul>
        );
    };
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        // Adjust the received timestamp by subtracting 2 hours for the Beirut timezone
        date.setHours(date.getHours() - 2);

        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Beirut',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true // Set to true for 12-hour format
        };

        return date.toLocaleString('en-US', options);
    };
    const handleDeleteExpense = async (expenseId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${expenseId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast.success('expense deleted successfully');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast.error('Error deleting expense');
            }
        } catch (error) {
            toast.error('Error deleting expense');
            console.error('Error deleting expense:', error);
        }
    };
    return (
        <div className="extra-products">
            <ToastContainer position="top-right" autoClose={1000} />

            <h2>Extra Products</h2>
            <h3 className='show-add-products' onClick={() => { setShowAddProducts(!showAddProducts) }}>{showAddProducts ? "hide form?" : "Add new products?"}</h3>
            {showAddProducts && <AddProducts />}
            {loading ? (
                <SpinLoader />
            ) :
                extraProducts.length > 0 ? (
                    <div className="receipt-details-container">
                        {currentRecords.map((expense) => (<div className='receipt-details' key={expense._id}>
                            <div className='container-button-div'>
                                <button className='delete-btn' onClick={() => { handleDeleteExpense(expense._id) }}>delete</button></div>
                            <div className='receipt-detail'>
                                <p className='detail-name'>Name:</p>
                                <p className='detail-value'>{expense?.name}</p>
                            </div>
                            <div className='receipt-detail'>
                                <p className='detail-name'>Value:</p>
                                <p className='detail-value'>{expense?.value}</p>
                            </div>
                            <div className='receipt-detail'>
                                <p className='detail-name'>Currency:</p>
                                <p className='detail-value'>{expense?.paymentCurrency}</p>
                            </div>

                            <div className='receipt-detail'>
                                <p className='detail-name'>Value in USD:</p>
                                <p className='detail-value'>{typeof expense.valueInUSD === 'number' ? expense.valueInUSD.toFixed(2) : expense.valueInUSD}</p>
                            </div>
                            <div className='receipt-detail timestamp'>
                                <p className='detail-name'>Date:</p>
                                <p className='detail-value'>{formatTimestamp(expense.timestamp)}</p>
                            </div>

                        </div>
                        ))}
                    </div>
                ) : (
                    <p>No extra products found for this company</p>
                )}
            {renderPagination()}

        </div>
    );
};

export default Products;
