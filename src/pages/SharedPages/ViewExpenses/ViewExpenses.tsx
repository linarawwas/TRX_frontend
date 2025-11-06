import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "../../../styles/financeRecords.css";
import "../../../components/Customers/CustomerInvoices/CustomerInvoices.css";
import { selectUserToken, selectUserIsAdmin } from "../../../redux/selectors/user";
import {
  fetchExpenses,
  deleteExpense,
  updateExpense,
  Expense,
  UpdateExpensePayload,
} from "../../../features/finance/apiFinance";
import { formatTimestamp } from "../../../features/finance/utils/formatTimestamp";
import AddExpenses from "../../../components/Expenses/AddExpenses/AddExpenses";
import FinanceCardSkeleton from "../../../components/Finance/FinanceCardSkeleton";
import { t, TranslationKey } from "../../../utils/i18n";
const EXPENSES_UPDATE_SUCCESS = "expenses.update.success" as TranslationKey;
const EXPENSES_UPDATE_ERROR = "expenses.update.error" as TranslationKey;
const EXPENSES_CONFIRM_DELETE = "expenses.confirmDelete" as TranslationKey;
const EXPENSES_CONFIRM_UPDATE = "expenses.confirmUpdate" as TranslationKey;
const COMMON_NO_CHANGES = "common.noChanges" as TranslationKey;

type PendingAction =
  | {
      type: "delete";
      id: string;
      name: string;
    }
  | {
      type: "update";
      id: string;
      name: string;
      payload: UpdateExpensePayload;
    };

type CurrencyOption = "USD" | "LBP";

interface EditFormState {
  id: string;
  name: string;
  value: string;
  paymentCurrency: CurrencyOption;
  shipmentId?: string;
  errors: Partial<Record<"name" | "value", string>>;
  original: Expense;
}

const currencyOptions: CurrencyOption[] = ["USD", "LBP"];

const Expenses: React.FC = () => {
  const isAdmin = useSelector(selectUserIsAdmin);
  const token = useSelector(selectUserToken);

  const [showAddExpenses, setShowAddExpenses] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [editState, setEditState] = useState<EditFormState | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
      }),
    []
  );

  const formatAmount = useCallback(
    (value: number | string): string => {
      const numeric = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(numeric)) {
        return String(value ?? "-");
      }
      return numberFormatter.format(numeric);
    },
    [numberFormatter]
  );

  const refreshExpenses = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchExpenses(token);
      setExpenses(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error("Error refreshing expenses:", err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    let active = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchExpenses(token);
        if (active) {
          setExpenses(data);
        }
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        console.error("Error fetching expenses:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [token, showAddExpenses]);

  const openEditModal = useCallback((expense: Expense) => {
    setEditState({
      id: expense._id,
      name: String(expense.name ?? ""),
      value: String(expense.value ?? ""),
      paymentCurrency: (String(expense.paymentCurrency).toUpperCase() as CurrencyOption) || "USD",
      shipmentId: expense.shipmentId,
      errors: {},
      original: expense,
    });
    setOpenMenuId(null);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditState(null);
  }, []);

  const requestDelete = useCallback((expense: Expense) => {
    setPendingAction({
      type: "delete",
      id: expense._id,
      name: String(expense.name ?? ""),
    });
    setOpenMenuId(null);
  }, []);

  const toggleMenu = useCallback((id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  const closeMenu = useCallback(() => setOpenMenuId(null), []);

  useEffect(() => {
    if (!openMenuId) return;

    const handleClickAway = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-menu-root="true"]')) {
        setOpenMenuId(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handleClickAway);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleClickAway);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMenuId]);

  const handleEditFieldChange = useCallback(
    (field: "name" | "value" | "paymentCurrency", value: string) => {
      setEditState((prev) => {
        if (!prev) return prev;
        const nextErrors = { ...prev.errors };
        delete nextErrors[field as keyof EditFormState["errors"]];
        return {
          ...prev,
          [field]: field === "paymentCurrency" ? (value as CurrencyOption) : value,
          errors: nextErrors,
        };
      });
    },
    []
  );

  const commitEdit = useCallback(async () => {
    if (!pendingAction || !token) return;
    setActionLoading(true);

    try {
      if (pendingAction.type === "delete") {
        await deleteExpense(token, pendingAction.id);
        toast.success(t("expenses.delete.success"));
      } else {
        await updateExpense(token, pendingAction.id, pendingAction.payload);
        toast.success(t(EXPENSES_UPDATE_SUCCESS));
        closeEditModal();
      }
      await refreshExpenses();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(
        pendingAction.type === "delete"
          ? t("expenses.delete.error")
          : t(EXPENSES_UPDATE_ERROR)
      );
      console.error("Finance action error:", message);
    } finally {
      setActionLoading(false);
      setPendingAction(null);
      closeMenu();
    }
  }, [closeEditModal, closeMenu, pendingAction, refreshExpenses, token]);

  const handleEditSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      closeMenu();
      setEditState((prev) => {
        if (!prev) return prev;

        const trimmedName = prev.name.trim();
        const valueNumber = Number(prev.value);
        const errors: EditFormState["errors"] = {};

        if (!trimmedName) {
          errors.name = t("expenses.fields.name") + " " + t("common.error");
        }
        if (!Number.isFinite(valueNumber) || valueNumber < 0) {
          errors.value = t("expenses.fields.value") + " " + t("common.error");
        }

        if (Object.keys(errors).length > 0) {
          return { ...prev, errors };
        }

        const payload: UpdateExpensePayload = {};
        if (trimmedName !== prev.original.name) {
          payload.name = trimmedName;
        }
        if (Number(prev.original.value) !== valueNumber) {
          payload.value = valueNumber;
        }
        if (prev.paymentCurrency !== prev.original.paymentCurrency) {
          payload.paymentCurrency = prev.paymentCurrency;
        }

        if (Object.keys(payload).length === 0) {
          toast.info(t(COMMON_NO_CHANGES));
          return prev;
        }

        setPendingAction({
          type: "update",
          id: prev.id,
          name: trimmedName,
          payload,
        });

        return prev;
      });
    },
    [closeMenu]
  );

  const confirmTitle = pendingAction
    ? pendingAction.type === "delete"
      ? t("expenses.delete")
      : t("common.edit")
    : "";

  const confirmMessage = pendingAction
    ? pendingAction.type === "delete"
      ? t(EXPENSES_CONFIRM_DELETE, { name: pendingAction.name })
      : t(EXPENSES_CONFIRM_UPDATE, { name: pendingAction.name })
    : "";

  return (
    <div className="finance-page" dir="rtl">
      <ToastContainer position="top-right" autoClose={1500} rtl />

      <header className="finance-header">
        <div className="finance-header__titles">
          <h2 className="finance-title">{t("expenses.title")}</h2>
          <p className="finance-subtitle">
            {t("expenses.fields.currency")}: {t("expenses.currency.usd")} • {t("expenses.currency.lbp")} |
            {" "}
            {t("expenses.fields.date")}
          </p>
        </div>

        {!isAdmin && (
          <button
            type="button"
            className="finance-btn finance-btn--primary"
            onClick={() => setShowAddExpenses((prev) => !prev)}
            aria-expanded={showAddExpenses}
            aria-controls="add-expenses-form"
          >
            {showAddExpenses ? t("expenses.hideForm") : t("expenses.addToggle")}
          </button>
        )}
      </header>

      {!isAdmin && showAddExpenses && (
        <section id="add-expenses-form" className="finance-section">
          <AddExpenses
            config={{
              modelName: t("expenses.title"),
              title: t("expenses.add.title"),
              buttonLabel: t("expenses.add.buttonLabel"),
              fields: {
                name: { label: t("expenses.fields.name"), "input-type": "text" },
                value: { label: t("expenses.fields.value"), "input-type": "number" },
                paymentCurrency: {
                  label: t("expenses.fields.paymentCurrency"),
                  "input-type": "selectOption",
                  options: [
                    { value: "USD", label: t("expenses.currency.usd") },
                    { value: "LBP", label: t("expenses.currency.lbp") },
                  ],
                },
              },
            }}
            onSuccess={() => {
              setShowAddExpenses(false);
              refreshExpenses();
            }}
            onError={(addError) => {
              const message = addError instanceof Error ? addError.message : String(addError);
              toast.error(message);
            }}
          />
        </section>
      )}

      <section className="finance-section">
        {loading ? (
          <FinanceCardSkeleton count={4} />
        ) : error ? (
          <p role="alert" className="finance-state finance-state--error">
            {t("common.error")}: {error}
          </p>
        ) : expenses.length === 0 ? (
          <p className="finance-state">{t("expenses.empty")}</p>
        ) : (
          <ul className="finance-list">
            {expenses.map((expense) => {
              const currencyLabel =
                expense.paymentCurrency === "USD"
                  ? t("expenses.currency.usd")
                  : t("expenses.currency.lbp");
              return (
                <li key={expense._id} className="finance-card">
                  <div className="finance-card__header">
                    <div className="finance-card__title-group">
                      <h3 className="finance-card__title">{expense.name}</h3>
                      <span className="finance-card__date">
                        {formatTimestamp(expense.timestamp)}
                      </span>
                    </div>
                    <span
                      className={`finance-badge finance-badge--${String(
                        expense.paymentCurrency
                      ).toLowerCase()}`}
                    >
                      {currencyLabel}
                    </span>
                    <div className="finance-card__menu" data-menu-root="true">
                      <button
                        type="button"
                        className="finance-card__menu-btn"
                        onClick={() => toggleMenu(expense._id)}
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === expense._id}
                        aria-label={t("common.moreOptions", { name: expense.name })}
                      >
                        ⋮
                      </button>
                      {openMenuId === expense._id && (
                        <div className="finance-card__menu-popover" role="menu">
                          <button
                            type="button"
                            className="finance-card__menu-item"
                            onClick={() => openEditModal(expense)}
                            role="menuitem"
                          >
                            {t("common.edit")}
                          </button>
                          <button
                            type="button"
                            className="finance-card__menu-item finance-card__menu-item--danger"
                            onClick={() => requestDelete(expense)}
                            role="menuitem"
                          >
                            {t("common.delete")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="finance-card__content">
                    <dl className="finance-grid">
                      <div className="finance-grid__item">
                        <dt>{t("expenses.fields.value")}</dt>
                        <dd>{formatAmount(expense.value)}</dd>
                      </div>
                      <div className="finance-grid__item">
                        <dt>{t("expenses.fields.valueUSD")}</dt>
                        <dd>
                          {Number.isFinite(Number(expense.valueInUSD))
                            ? numberFormatter.format(Number(expense.valueInUSD))
                            : String(expense.valueInUSD)}
                        </dd>
                      </div>
                      <div className="finance-grid__item">
                        <dt>{t("expenses.fields.paymentCurrency")}</dt>
                        <dd>{currencyLabel}</dd>
                      </div>
                    </dl>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {editState && (
        <div className="finance-modal-overlay" role="presentation">
          <div
            className="finance-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-expense-title"
          >
            <header className="finance-modal__header">
              <h3 id="edit-expense-title" className="finance-modal__title">
                {t("common.edit")}: {editState.name}
              </h3>
              <button
                type="button"
                className="finance-modal__close"
                onClick={() => {
                  closeEditModal();
                  closeMenu();
                }}
                aria-label={t("common.cancel")}
              >
                ×
              </button>
            </header>

            <form className="finance-form" onSubmit={handleEditSubmit}>
              <div className="finance-field">
                <label htmlFor="expense-name">{t("expenses.fields.name")}</label>
                <input
                  id="expense-name"
                  name="name"
                  value={editState.name}
                  onChange={(event) => handleEditFieldChange("name", event.target.value)}
                  required
                />
                {editState.errors.name && (
                  <span className="finance-field__error">{editState.errors.name}</span>
                )}
              </div>

              <div className="finance-field">
                <label htmlFor="expense-value">{t("expenses.fields.value")}</label>
                <input
                  id="expense-value"
                  name="value"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={editState.value}
                  onChange={(event) => handleEditFieldChange("value", event.target.value)}
                  required
                />
                {editState.errors.value && (
                  <span className="finance-field__error">{editState.errors.value}</span>
                )}
              </div>

              <div className="finance-field">
                <label htmlFor="expense-currency">{t("expenses.fields.paymentCurrency")}</label>
                <select
                  id="expense-currency"
                  name="paymentCurrency"
                  value={editState.paymentCurrency}
                  onChange={(event) => handleEditFieldChange("paymentCurrency", event.target.value)}
                >
                  {currencyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "USD"
                        ? t("expenses.currency.usd")
                        : t("expenses.currency.lbp")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="finance-modal__actions">
                <button
                  type="button"
                  className="finance-btn finance-btn--ghost"
                  onClick={() => {
                    closeEditModal();
                    closeMenu();
                  }}
                >
                  {t("common.cancel")}
                </button>
                <button type="submit" className="finance-btn finance-btn--primary">
                  {t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingAction && (
        <div className="finance-modal-overlay" role="presentation">
          <div
            className="finance-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-expense-title"
          >
            <header className="finance-modal__header">
              <h3 id="confirm-expense-title" className="finance-modal__title">
                {confirmTitle}
              </h3>
            </header>
            <p className="finance-modal__body">{confirmMessage}</p>
            <div className="finance-modal__actions">
              <button
                type="button"
                className="finance-btn finance-btn--ghost"
                onClick={() => {
                  setPendingAction(null);
                  closeMenu();
                }}
                disabled={actionLoading}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className={`finance-btn ${
                  pendingAction.type === "delete"
                    ? "finance-btn--danger"
                    : "finance-btn--primary"
                }`}
                onClick={commitEdit}
                disabled={actionLoading}
              >
                {actionLoading ? t("common.loading") : pendingAction.type === "delete" ? t("common.delete") : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
