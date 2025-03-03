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

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = extraProfits.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    return (
      <ul className="pagination">
        {Array.from(
          { length: Math.ceil(extraProfits.length / recordsPerPage) },
          (_, index) => (
            <li
              key={index}
              onClick={() => paginate(index + 1)}
              className={`pagination-item ${
                currentPage === index + 1 ? "active" : ""
              }`}
            >
              {index + 1}
            </li>
          )
        )}
      </ul>
    );
  };
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
    <div className="extra-profits">
      <ToastContainer position="top-right" autoClose={1000} />

      <h2>Extra Profits</h2>
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
            {showAddProfits ? "hide form?" : "Add new profits?"}
          </h3>
          {showAddProfits && <AddProfits />}
        </>
      )}

      {loading ? (
        <SpinLoader />
      ) : extraProfits.length > 0 ? (
        <div className="receipt-details-container">
          {currentRecords.map((profit) => (
            <div className="receipt-details" key={profit._id}>
              <div className="container-button-div">
                <button
                  className="delete-btn"
                  onClick={() => {
                    handleDeleteProfit(profit._id);
                  }}
                >
                  delete
                </button>
              </div>
              <div className="receipt-detail">
                <p className="detail-name">Name:</p>
                <p className="detail-value">{profit?.name}</p>
              </div>
              <div className="receipt-detail">
                <p className="detail-name">Value:</p>
                <p className="detail-value">{profit?.value}</p>
              </div>
              <div className="receipt-detail">
                <p className="detail-name">Currency:</p>
                <p className="detail-value">{profit?.paymentCurrency}</p>
              </div>

              <div className="receipt-detail">
                <p className="detail-name">Value in USD:</p>
                <p className="detail-value">
                  {typeof profit.valueInUSD === "number"
                    ? profit.valueInUSD.toFixed(2)
                    : profit.valueInUSD}
                </p>
              </div>
              <div className="receipt-detail timestamp">
                <p className="detail-name">Date:</p>
                <p className="detail-value">
                  {formatTimestamp(profit.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No extra profits found for this company</p>
      )}
      {renderPagination()}
    </div>
  );
};

export default ExtraProfits;
