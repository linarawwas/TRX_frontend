import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./ViewExpenses.css";
import "../../../components/Customers/CustomerInvoices/CustomerInvoices.css";
import { selectUserToken, selectUserIsAdmin } from "../../../redux/selectors/user";
import { fetchExpenses, deleteExpense, Expense } from "../../../features/finance/apiFinance";
import { formatTimestamp } from "../../../features/finance/utils/formatTimestamp";
import AddExpenses from "../../../components/Expenses/AddExpenses/AddExpenses";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader";
import { t } from "../../../utils/i18n";

const Expenses: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(4);
  const [showAddExpenses, setShowAddExpenses] = useState<boolean>(false);
  const [extraExpenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = useSelector(selectUserIsAdmin);
  const token = useSelector(selectUserToken);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchExpenses(token);
        if (cancelled) return;
        setExpenses(data);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        console.error("Error fetching extra expenses:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, showAddExpenses]);

  const handleDeleteExpense = async (expenseId: string) => {
    if (!token) return;
    try {
      await deleteExpense(token, expenseId);
      toast.success(t("expenses.delete.success"));
      // Refetch expenses
      const data = await fetchExpenses(token);
      setExpenses(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(t("expenses.delete.error"));
      console.error("Error deleting expense:", error);
    }
  };

  return (
    <div className="extra-expenses" dir="rtl">
      <ToastContainer position="top-right" autoClose={1000} />

      <h2>{t("expenses.title")}</h2>
      {isAdmin ? (
        <></>
      ) : (
        <>
          <button
            type="button"
            className="show-add-expenses"
            onClick={() => {
              setShowAddExpenses(!showAddExpenses);
            }}
            aria-expanded={showAddExpenses}
            aria-controls="add-expenses-form"
          >
            {showAddExpenses ? t("expenses.hideForm") : t("expenses.addToggle")}
          </button>
          {showAddExpenses && (
            <div id="add-expenses-form">
              <AddExpenses />
            </div>
          )}
        </>
      )}

      {loading ? (
        <SpinLoader />
      ) : error ? (
        <p role="alert">{t("common.error")}: {error}</p>
      ) : extraExpenses.length > 0 ? (
        <div className="receipt-details-container">
          {extraExpenses?.map((expense) => (
            <div className="receipt-details" key={expense._id}>
              <div className="container-button-div">
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => {
                    handleDeleteExpense(expense._id);
                  }}
                  aria-label={`${t("expenses.delete")} ${expense.name}`}
                >
                  {t("expenses.delete")}
                </button>
              </div>

              <div className="receipt-detail">
                <p className="detail-name">{t("expenses.fields.name")}:</p>
                <p className="detail-value">{expense?.name}</p>
              </div>

              <div className="receipt-detail">
                <p className="detail-name">{t("expenses.fields.value")}:</p>
                <p className="detail-value">{expense?.value}</p>
              </div>

              <div className="receipt-detail">
                <p className="detail-name">{t("expenses.fields.currency")}:</p>
                <p className="detail-value">{expense?.paymentCurrency}</p>
              </div>

              <div className="receipt-detail">
                <p className="detail-name">{t("expenses.fields.valueUSD")}:</p>
                <p className="detail-value">
                  {typeof expense.valueInUSD === "number"
                    ? expense.valueInUSD.toFixed(2)
                    : expense.valueInUSD}
                </p>
              </div>

              <div className="receipt-detail timestamp">
                <p className="detail-name">{t("expenses.fields.date")}:</p>
                <p className="detail-value">
                  {formatTimestamp(expense.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>{t("expenses.empty")}</p>
      )}
    </div>
  );
};

export default Expenses;
