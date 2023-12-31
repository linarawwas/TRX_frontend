import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import SpinLoader from '../../UI reusables/SpinLoader/SpinLoader';
import '../../Customers/CustomerInvoices/CustomerInvoices.css'
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
interface Payment {
    date: string;
    amount: number;
    currency: string;
    exchangeRate: string;
    _id: string;
}

interface Order {
    _id: string;
    recordedBy: string;
    delivered: number;
    returned: number;
    customerid: string;
    payments: Payment[];
    productId: number;
    checkout: number;
    SumOfPaymentsInLiras: number;
    SumOfPaymentsInDollars: number;
    paid: number;
    paymentCurrency: string;
    exchangeRate: string;
    total: number;
    timestamp: string;
    companyId: string;
    shipmentId: string;
    __v: number;
}

interface CustomerOrdersProps {
    customerId: string;
}

const CustomerOrders: React.FC<CustomerOrdersProps> = ({ customerId }) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(4);
    const [showAddOrders, setShowAddOrders] = useState<Boolean>(false);
    const companyId = useSelector((state: any) => state.user.companyId);
    const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const token: string = useSelector((state: any) => state.user.token);
    useEffect(() => {
        const fetchCustomerOrders = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/orders/customer/${customerId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = response.data;
                setCustomerOrders(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching extra Orders:', error);
                setLoading(false);
            }
        }
        if (companyId) {
            fetchCustomerOrders();
        }
    }, [companyId, token, showAddOrders]);

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = customerOrders.slice(indexOfFirstRecord, indexOfLastRecord);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const renderPagination = () => {
        return (
            <ul className="pagination">
                {Array.from({ length: Math.ceil(customerOrders.length / recordsPerPage) }, (_, index) => (
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
    return (
        <div className="Orders">
            <h2 className='orders-by-customer-title'>Orders by Customer</h2>
            {loading ? (
                <SpinLoader />
            ) :
                customerOrders.length > 0 ? (
                    <div className="receipt-details-container">
                        {currentRecords.map((Order) => (<div className='receipt-details' key={Order._id}>
                            <div className='receipt-detail'>
                                <p className='detail-name'>Delivered:</p>
                                <p className='detail-value'>{Order?.delivered}</p>
                            </div>
                            <div className='receipt-detail'>
                                <p className='detail-name'>Returned:</p>
                                <p className='detail-value'>{Order?.returned}</p>
                            </div>
                            <div className='receipt-detail'>
                                <p className='detail-name'>checkout</p>
                                <p className='detail-value'>{Order?.checkout}</p>
                            </div>
                            <div className='receipt-detail'>
                                <p className='detail-name'>paid in USD:</p>
                                <p className='detail-value'>{Order.paid.toFixed(2)}</p>
                            </div>
                            <div className='receipt-detail'>
                                <p className='detail-name'>total:</p>
                                <p className='detail-value'>{Order?.total.toFixed(2)}</p>
                            </div>
                            <div className='receipt-detail timestamp'>
                                <p className='detail-name'>Timestamp:</p>
                                <p className='detail-value'>{formatTimestamp(Order.timestamp)}</p>
                            </div>

                        </div>
                        ))}
                    </div>
                ) : (
                    <p>No Orders found for this customer</p>
                )}
            {renderPagination()}

        </div>
    );
};

export default CustomerOrders;
