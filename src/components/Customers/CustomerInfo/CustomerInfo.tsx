import React from "react";
import SpinLoader from "../../UI reusables/SpinLoader/SpinLoader";
import "./CustomerInfo.css";

interface CustomerInfoProps {
  customerData?: any;
  loading?: boolean;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({
  customerData,
  loading = false,
}) => {
  return (
    <div className="customer-info-card" dir="rtl">
      {loading ? (
        <SpinLoader />
      ) : customerData ? (
        <>
          {" "}
          {/* NEW: status row */}
          <div className="customer-info-row">
            <span className="customer-info-label">الحالة:</span>
            <span className="customer-info-value">
              {customerData.isActive ? "نشط" : "غير نشط"}
            </span>
          </div>
          {/* Optional discount rows */}
          {customerData.hasDiscount && (
            <>
              <div className="customer-info-row">
                <span className="customer-info-label">خصم نشط:</span>
                <span className="customer-info-value">نعم</span>
              </div>
              <div className="customer-info-row">
                <span className="customer-info-label">السعر بعد الخصم:</span>
                <span className="customer-info-value">
                  {customerData.valueAfterDiscount} $
                </span>
              </div>
            </>
          )}
          {/* Main grid */}
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
              <span className="customer-info-value">
                {customerData.address}
              </span>
            </div>
          </div>
        </>
      ) : (
        <p className="customer-info-error">البيانات غير متوفرة</p>
      )}
    </div>
  );
};

export default CustomerInfo;
