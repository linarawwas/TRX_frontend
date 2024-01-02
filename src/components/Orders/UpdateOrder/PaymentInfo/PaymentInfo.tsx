import React, { useState } from 'react';
import SpinLoader from '../../../UI reusables/SpinLoader/SpinLoader';
import './PaymentInfo.css'
interface Payment {
    date: string;
    amount: number;
    currency: string;
}

interface PaymentInfoProps {
    payments: Payment[] | undefined; // Ensure payments can be undefined
}

const PaymentInfo: React.FC<PaymentInfoProps> = ({ payments }) => {
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


    if (!payments || payments.length === 0) {
        return <p>No payment information available.</p>; // Return a message for empty or undefined payments
    }
    return (
        <div className="payment-receipt">
            <h2>Payment Info</h2>
            {payments.map((payment, index) => (
                <div key={index} className="receipt-details">
                    <div className='receipt-detail'>
                        <p className='detail-name'>date </p>
                        <p className='detail-value'>{formatTimestamp(payment?.date)}</p>
                    </div>
                    <div className='receipt-detail'>
                        <p className='detail-name'>amount</p>
                        <p className='detail-value'>{payment?.amount}</p>
                    </div>
                    <div className='receipt-detail'>
                        <p className='detail-name'>currency</p>
                        <p className='detail-value'> {payment?.currency}</p>
                    </div>
                </div>))}

        </div>
    );
};

export default PaymentInfo;
