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
            <div className='order-receipt' style={{ direction: "rtl", textAlign: "right" }}>
      
              <div className="receipt-details">
                <div className="receipt-detail">
                  <p className="detail-name">التاريخ: </p>
                  <p className="detail-value">{formatTimestamp(orderData?.timestamp)}</p>
                </div>
                <div className="receipt-detail">
                  <p className="detail-name">تم التوصيل: </p>
                  <p className="detail-value">{orderData?.delivered}</p>
                </div>
                <div className="receipt-detail">
                  <p className="detail-name">تم الإرجاع: </p>
                  <p className="detail-value">{orderData?.returned}</p>
                </div>
                <div className="receipt-detail">
                  <p className="detail-name">تم التسجيل بواسطة: </p>
                  <p className="detail-value">{orderData?.recordedBy_user_name}</p>
                </div>
                <div className="receipt-detail">
                  <p className="detail-name">العميل: </p>
                  <p className="detail-value">{orderData?.customer?.name}</p>
                </div>
                <div className="receipt-detail">
                  <p className="detail-name">السعر: </p>
                  <p className="detail-value">{orderData?.checkout?.toFixed(2)}</p>
                </div>
                <div className="receipt-detail">
                  <p className="detail-name">المدفوع: </p>
                  <p className="detail-value">{orderData?.paid?.toFixed(2)}</p>
                </div>
                <div className="receipt-detail">
                  <p className="detail-name">الإجمالي: </p>
                  <p className="detail-value">{orderData?.total?.toFixed(2)}</p>
                </div>
              </div>
            </div>
      
          ) : (
            <p>الطلب غير موجود</p>
          )}
        </>
      );
      
};

export default OrderReceipt;
