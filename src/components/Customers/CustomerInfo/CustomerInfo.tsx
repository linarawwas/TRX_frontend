import React from "react";
import SpinLoader from "../../UI reusables/SpinLoader/SpinLoader";
import "./CustomerInfo.css";

interface CustomerInfoProps {
  customerData: any;
  loading: boolean;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({
  customerData,
  loading,
}) => {
  return (
    <div className="customer-info-card">
      {loading ? (
        <SpinLoader />
      ) : customerData ? (
        <div className="customer-info-grid">
          <div className="customer-info-row">
            <span className="customer-info-label">الاسم:</span>
            <span className="customer-info-value">{customerData.name}</span>
          </div>
          <div className="customer-info-row">
            <span className="customer-info-label">الهاتف:</span>
            <span className="customer-info-value">{customerData.phone}</span>
          </div>
          <div className="customer-info-row">
            <span className="customer-info-label">المنطقة:</span>
            <span className="customer-info-value">
              {customerData.areaId?.name}
            </span>
          </div>
          <div className="customer-info-row">
            <span className="customer-info-label">العنوان:</span>
            <span className="customer-info-value">{customerData.address}</span>
          </div>
        </div>
      ) : (
        <p className="customer-info-error">البيانات غير متوفرة</p>
      )}
    </div>
  );
};

export default CustomerInfo;
