import React from 'react';
import SpinLoader from '../../../UI reusables/SpinLoader/SpinLoader';

interface OrderReceiptProps {
    orderData: any; // Change 'any' to the type of your orderData if available
    loading: boolean;
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({ orderData, loading }: OrderReceiptProps) => {
    return (
        <>
            {loading ? (
                <SpinLoader />
            ) : orderData ? (
                <div className="receipt-details">
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
                        <p className="detail-name">customer </p>
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
            ) : (
                <p>Order not found</p>
            )}
        </>
    );
};

export default OrderReceipt;
