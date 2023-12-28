import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import SpinLoader from '../../UI reusables/SpinLoader/SpinLoader';
import AddProfits from '../AddProfits/AddProfits';
import '../../Customers/CustomerInvoices/CustomerInvoices.css'
import './ViewProfits.css'
import { useActionData } from 'react-router-dom';
interface ExtraProfit {
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
const ExtraProfits: React.FC = () => {
    const [showAddProfits, setShowAddProfits] = useState<Boolean>(false);
    const companyId = useSelector((state: any) => state.user.companyId);
    const [extraProfits, setExtraProfits] = useState<ExtraProfit[]>([]);
    const [loading, setLoading] = useState(true);
    const token: string = useSelector((state: any) => state.user.token);
    useEffect(() => {
        const fetchExtraProfits = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/extraProfits/company/${companyId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = response.data;
                setExtraProfits(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching extra profits:', error);
                setLoading(false);
            }
        }
        if (companyId) {
            fetchExtraProfits();
        }
    }, [companyId, token,showAddProfits]);

    return (
        <div className="extra-profits">
            <h2>Extra Profits</h2>
            <h3 className='show-add-profits' onClick={() => { setShowAddProfits(!showAddProfits) }}>{showAddProfits ? "hide form?" : "Add new profits?"}</h3>
            {showAddProfits && <AddProfits />}
            {loading ? (
                <SpinLoader />
            ) : extraProfits.length > 0 ? (
                <div className="receipt-details-container">
                    {extraProfits.map((profit) => (
                        <div className='receipt-details' key={profit._id}>
                            <div className='receipt-detail'>
                                <p className='detail-name'>Name:</p>
                                <p className='detail-value'>{profit.name}</p>
                            </div>
                            <div className='receipt-detail'>
                                <p className='detail-name'>Value:</p>
                                <p className='detail-value'>{profit.value}</p>
                            </div>
                            <div className='receipt-detail'>
                                <p className='detail-name'>Currency:</p>
                                <p className='detail-value'>{profit.paymentCurrency}</p>
                            </div>

                            <div className='receipt-detail'>
                                <p className='detail-name'>Value in USD:</p>
                                <p className='detail-value'>{profit.valueInUSD}</p>
                            </div>
                            <div className='receipt-detail'>
                                <p className='detail-name'>Timestamp:</p>
                                <p className='detail-value'>{profit.timestamp}</p>
                            </div>

                        </div>
                    ))}
                </div>
            ) : (
                <p>No extra profits found for this company</p>
            )}

        </div>
    );
};

export default ExtraProfits;
