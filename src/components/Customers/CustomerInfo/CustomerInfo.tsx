import React from 'react';
import SpinLoader from '../../UI reusables/SpinLoader/SpinLoader';
import './CustomerInfo.css'
interface CustomerInfoProps {
    customerData: any; // Change 'any' to the type of your orderData if available
    loading: boolean;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ customerData, loading }: CustomerInfoProps) => {
    return (
        <>
          {loading ? (
            <SpinLoader />
          ) : customerData ? (
            <div className="receipt-details customer-info-details" style={{ direction: "rtl", textAlign: "right" }}>
              <div className="receipt-detail">
                <p className="detail-name">الاسم</p>
                <p className="detail-value">{customerData?.name}</p>
              </div>
              <div className="receipt-detail">
                <p className="detail-name">الهاتف:</p>
                <p className="detail-value">{customerData?.phone}</p>
              </div>
              {/* <div className="receipt-detail">
                <p className="detail-name">معرف المنطقة:</p>
                <p className="detail-value area-id"> {customerData?.areaId?._id}</p>
              </div> */}
              <div className="receipt-detail">
                <p className="detail-name">اسم المنطقة:</p>
                <p className="detail-value"> {customerData?.areaId?.name}</p>
              </div>
              <div className="receipt-detail">
                <p className="detail-name">العنوان</p>
                <p className="detail-value">{customerData?.address}</p>
              </div>
            </div>
          ) : (
            <p>الطلب غير موجود</p>
          )}
        </>
      );
      
};

export default CustomerInfo;
