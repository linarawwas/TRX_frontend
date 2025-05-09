import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "../../../components/Customers/CustomerInvoices/CustomerInvoices.css";
import "./ViewProfits.css";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader";
import AddProfits from "../../../components/Profits/AddProfits/AddProfits";

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
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(4);
  const [showAddProfits, setShowAddProfits] = useState<Boolean>(false);
  const companyId = useSelector((state: any) => state.user.companyId);
  const [extraProfits, setExtraProfits] = useState<ExtraProfit[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = useSelector((state: any) => state.user.isAdmin);
  const token: string = useSelector((state: any) => state.user.token);
  useEffect(() => {
    const fetchExtraProfits = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/extraProfits/company/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        setExtraProfits(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching extra profits:", error);
        setLoading(false);
      }
    };
    if (companyId) {
      fetchExtraProfits();
    }
  }, [companyId, token, showAddProfits]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    // Adjust the received timestamp by subtracting 2 hours for the Beirut timezone
    date.setHours(date.getHours() - 2);

    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Beirut",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true, // Set to true for 12-hour format
    };

    return date.toLocaleString("en-US", options);
  };
  const handleDeleteProfit = async (profitId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/extraProfits/${profitId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("profit deleted successfully");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error("Error deleting profit");
      }
    } catch (error) {
      toast.error("Error deleting profit");
      console.error("Error deleting profit:", error);
    }
  };
  return (
    <div className="extra-profits" dir="rtl">
      <ToastContainer position="top-right" autoClose={1000} />
  
      <h2>الأرباح الإضافية</h2>
      {isAdmin ? (
        <></>
      ) : (
        <>
          <h3
            className="show-add-profits"
            onClick={() => {
              setShowAddProfits(!showAddProfits);
            }}
          >
            {showAddProfits ? "إخفاء النموذج؟" : "إضافة أرباح جديدة؟"}
          </h3>
          {showAddProfits && <AddProfits />}
        </>
      )}
  
      {loading ? (
        <SpinLoader />
      ) : extraProfits.length > 0 ? (
        <div className="receipt-details-container">
          {extraProfits?.map((profit) => (
            <div className="receipt-details" key={profit._id}>
              <div className="container-button-div">
                <button
                  className="delete-btn"
                  onClick={() => {
                    handleDeleteProfit(profit._id);
                  }}
                >
                  حذف
                </button>
              </div>
  
              <div className="receipt-detail">
                <p className="detail-name">الاسم:</p>
                <p className="detail-value">{profit?.name}</p>
              </div>
  
              <div className="receipt-detail">
                <p className="detail-name">القيمة:</p>
                <p className="detail-value">{profit?.value}</p>
              </div>
  
              <div className="receipt-detail">
                <p className="detail-name">العملة:</p>
                <p className="detail-value">{profit?.paymentCurrency}</p>
              </div>
  
              <div className="receipt-detail">
                <p className="detail-name">القيمة بالدولار:</p>
                <p className="detail-value">
                  {typeof profit.valueInUSD === "number"
                    ? profit.valueInUSD.toFixed(2)
                    : profit.valueInUSD}
                </p>
              </div>
  
              <div className="receipt-detail timestamp">
                <p className="detail-name">التاريخ:</p>
                <p className="detail-value">
                  {formatTimestamp(profit.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>لا توجد أرباح إضافية لهذه الشركة</p>
      )}
    </div>
  );
  
};

export default ExtraProfits;
