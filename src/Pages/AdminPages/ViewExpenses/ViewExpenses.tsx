import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./ViewExpenses.css";
import "../../../components/Customers/CustomerInvoices/CustomerInvoices.css";
import AddExpenses from "../../../components/Expenses/AddExpenses/AddExpenses";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader";
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
  const isAdmin = useSelector((state: any) => state.user.isAdmin);

  const token: string = useSelector((state: any) => state.user.token);
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get(
          `https://trx-api.linarawas.com/api/expenses/company/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        setExpenses(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching extra expenses:", error);
        setLoading(false);
      }
    };
    if (companyId) {
      fetchExpenses();
    }
  }, [companyId, token, showAddExpenses]);
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
  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const response = await fetch(
        `https://trx-api.linarawas.com/api/expenses/${expenseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("expense deleted successfully");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error("Error deleting expense");
      }
    } catch (error) {
      toast.error("Error deleting expense");
      console.error("Error deleting expense:", error);
    }
  };
  return (
    <div className="extra-expenses" dir="rtl">
      <ToastContainer position="top-right" autoClose={1000} />
  
      <h2>نفقات إضافية</h2>
      {isAdmin ? (
        <></>
      ) : (
        <>
          <h3
            className="show-add-expenses"
            onClick={() => {
              setShowAddExpenses(!showAddExpenses);
            }}
          >
            {showAddExpenses ? "إخفاء النموذج؟" : "إضافة نفقة جديدة؟"}
          </h3>
          {showAddExpenses && <AddExpenses />}
        </>
      )}
  
      {loading ? (
        <SpinLoader />
      ) : extraExpenses.length > 0 ? (
        <div className="receipt-details-container">
          {extraExpenses?.map((expense) => (
            <div className="receipt-details" key={expense._id}>
              <div className="container-button-div">
                <button
                  className="delete-btn"
                  onClick={() => {
                    handleDeleteExpense(expense._id);
                  }}
                >
                  حذف
                </button>
              </div>
  
              <div className="receipt-detail">
                <p className="detail-name">الاسم:</p>
                <p className="detail-value">{expense?.name}</p>
              </div>
  
              <div className="receipt-detail">
                <p className="detail-name">القيمة:</p>
                <p className="detail-value">{expense?.value}</p>
              </div>
  
              <div className="receipt-detail">
                <p className="detail-name">العملة:</p>
                <p className="detail-value">{expense?.paymentCurrency}</p>
              </div>
  
              <div className="receipt-detail">
                <p className="detail-name">القيمة بالدولار:</p>
                <p className="detail-value">
                  {typeof expense.valueInUSD === "number"
                    ? expense.valueInUSD.toFixed(2)
                    : expense.valueInUSD}
                </p>
              </div>
  
              <div className="receipt-detail timestamp">
                <p className="detail-name">التاريخ:</p>
                <p className="detail-value">
                  {formatTimestamp(expense.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>لا توجد نفقات إضافية لهذه الشركة</p>
      )}
    </div>
  );
  
};

export default Expenses;
