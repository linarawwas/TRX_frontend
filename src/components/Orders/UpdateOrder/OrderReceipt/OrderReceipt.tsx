import React from 'react';
import SpinLoader from '../../../UI reusables/SpinLoader/SpinLoader';
import './OrderReceipt.css'
import { Link, useNavigate } from 'react-router-dom';
interface OrderReceiptProps {
    orderData: any; // Change 'any' to the type of your orderData if available
    loading: boolean;
}
const OrderReceipt: React.FC<OrderReceiptProps> = ({ orderData, loading }: OrderReceiptProps) => {

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
        <>
            {loading ? (
                <SpinLoader />
            ) : orderData ? (
                <div className='order-receipt'>

                    <div className="receipt-details">
                        <div className="receipt-detail">
                            <p className="detail-name">Date: </p>
                            <p className="detail-value">{formatTimestamp(orderData?.timestamp)}</p>
                        </div>
                        <div className="receipt-detail">
                            <p className="detail-name">Delivered: </p>
                            <p className="detail-value">{orderData?.delivered}</p>
                        </div>
                        <div className="receipt-detail">
                            <p className="detail-name">Returned: </p>
                            <p className="detail-value">{orderData?.returned}</p>
                        </div>
                        <div className="receipt-detail">
                            <p className="detail-name">recordedBy</p>
                            <p className="detail-value">{orderData?.recordedBy_user_name}</p>
                        </div>
                        <div className="receipt-detail">
                            <p className="detail-name">
                                Customer</p>
                            <p className="detail-value">{orderData?.customer?.name}</p>
                        </div>
                        <div className="receipt-detail">
                            <p className="detail-name">checkout: </p>
                            <p className="detail-value">{orderData?.checkout.toFixed(2)}</p>
                        </div>
                        <div className="receipt-detail">
                            <p className="detail-name">Paid: </p>
                            <p className="detail-value">{orderData?.paid.toFixed(2)}</p>
                        </div>
                        <div className="receipt-detail">
                            <p className="detail-name">Total : </p>
                            <p className="detail-value">{orderData?.total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

            ) : (
                <p>Order not found</p>
            )}
        </>
    );
};

export default OrderReceipt;
