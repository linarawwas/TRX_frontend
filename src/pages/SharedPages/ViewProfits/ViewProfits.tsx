import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "../../../components/Customers/CustomerInvoices/CustomerInvoices.css";
import "./ViewProfits.css";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { selectUserToken, selectUserCompanyId, selectUserIsAdmin } from "../../../redux/selectors/user";
import { fetchExtraProfits, deleteExtraProfit, ExtraProfit } from "../../../features/finance/apiFinance";
import { formatTimestamp } from "../../../features/finance/utils/formatTimestamp";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader";
import AddProfits from "../../../components/Profits/AddProfits/AddProfits";
import { t } from "../../../utils/i18n";

const ExtraProfits: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(4);
  const [showAddProfits, setShowAddProfits] = useState<boolean>(false);
  const companyId = useSelector(selectUserCompanyId);
  const [extraProfits, setExtraProfits] = useState<ExtraProfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = useSelector(selectUserIsAdmin);
  const token = useSelector(selectUserToken);

  useEffect(() => {
    if (!token || !companyId) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchExtraProfits(token, companyId);
        if (cancelled) return;
        setExtraProfits(data);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        console.error("Error fetching extra profits:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [companyId, token, showAddProfits]);

  const handleDeleteProfit = async (profitId: string) => {
    if (!token) return;
    try {
      await deleteExtraProfit(token, profitId);
      toast.success(t("profits.delete.success"));
      // Refetch profits
      if (companyId) {
        const data = await fetchExtraProfits(token, companyId);
        setExtraProfits(data);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(t("profits.delete.error"));
      console.error("Error deleting profit:", error);
    }
  };

  return (
    <div className="extra-profits" dir="rtl">
      <ToastContainer position="top-right" autoClose={1000} />

      <h2>{t("profits.title")}</h2>
      {isAdmin ? (
        <></>
      ) : (
        <>
          <button
            type="button"
            className="show-add-profits"
            onClick={() => {
              setShowAddProfits(!showAddProfits);
            }}
            aria-expanded={showAddProfits}
            aria-controls="add-profits-form"
          >
            {showAddProfits ? t("profits.hideForm") : t("profits.addToggle")}
          </button>
          {showAddProfits && (
            <div id="add-profits-form">
              <AddProfits />
            </div>
          )}
        </>
      )}

      {loading ? (
        <SpinLoader />
      ) : error ? (
        <p role="alert">{t("common.error")}: {error}</p>
      ) : extraProfits.length > 0 ? (
        <div className="receipt-details-container">
          {extraProfits?.map((profit) => (
            <div className="receipt-details" key={profit._id}>
              <div className="container-button-div">
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => {
                    handleDeleteProfit(profit._id);
                  }}
                  aria-label={`${t("profits.delete")} ${profit.name}`}
                >
                  {t("profits.delete")}
                </button>
              </div>

              <div className="receipt-detail">
                <p className="detail-name">{t("profits.fields.name")}:</p>
                <p className="detail-value">{profit?.name}</p>
              </div>

              <div className="receipt-detail">
                <p className="detail-name">{t("profits.fields.value")}:</p>
                <p className="detail-value">{profit?.value}</p>
              </div>

              <div className="receipt-detail">
                <p className="detail-name">{t("profits.fields.currency")}:</p>
                <p className="detail-value">{profit?.paymentCurrency}</p>
              </div>

              <div className="receipt-detail">
                <p className="detail-name">{t("profits.fields.valueUSD")}:</p>
                <p className="detail-value">
                  {typeof profit.valueInUSD === "number"
                    ? profit.valueInUSD.toFixed(2)
                    : profit.valueInUSD}
                </p>
              </div>

              <div className="receipt-detail timestamp">
                <p className="detail-name">{t("profits.fields.date")}:</p>
                <p className="detail-value">
                  {formatTimestamp(profit.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>{t("profits.empty")}</p>
      )}
    </div>
  );
};

export default ExtraProfits;
