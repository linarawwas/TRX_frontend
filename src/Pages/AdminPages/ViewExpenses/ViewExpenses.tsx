import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './ViewExpenses.css';
import '../../../components/Customers/CustomerInvoices/CustomerInvoices.css'
import AddExpenses from '../../../components/Expenses/AddExpenses/AddExpenses';
import SpinLoader from '../../../components/UI reusables/SpinLoader/SpinLoader';
interface Expenses {
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
const Expenses: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(4);
    const [showAddExpenses, setShowAddExpenses] = useState<Boolean>(false);
    const companyId = useSelector((state: any) => state.user.companyId);
    const [extraExpenses, setExpenses] = useState<Expenses[]>([]);
    const [loading, setLoading] = useState(true);
    const token: string = useSelector((state: any) => state.user.token);
    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/expenses/company/${companyId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = response.data;
                setExpenses(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching extra expenses:', error);
                setLoading(false);
            }
        }
        if (companyId) {
            fetchExpenses();
        }
    }, [companyId, token, showAddExpenses]);

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = extraExpenses.slice(indexOfFirstRecord, indexOfLastRecord);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const renderPagination = () => {
        return (
            <ul className="pagination">
                {Array.from({ length: Math.ceil(extraExpenses.length / recordsPerPage) }, (_, index) => (
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
            const response = await fetch(`http://localhost:5000/api/expenses/${expenseId}`, {
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
        <div className="extra-expenses">
            <ToastContainer position="top-right" autoClose={1000} />

            <h2>Extra Expenses</h2>
            <h3 className='show-add-expenses' onClick={() => { setShowAddExpenses(!showAddExpenses) }}>{showAddExpenses ? "hide form?" : "Add new expenses?"}</h3>
            {showAddExpenses && <AddExpenses />}
            {loading ? (
                <SpinLoader />
            ) :
                extraExpenses.length > 0 ? (
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
                    <p>No extra expenses found for this company</p>
                )}
            {renderPagination()}

        </div>
    );
};

export default Expenses;
