import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import "../../../components/Customers/CustomerInvoices/CustomerInvoices.css";
import "../../../styles/financeRecords.css";
import { ToastContainer, toast } from "react-toastify";
import {
  selectUserToken,
  selectUserCompanyId,
  selectUserIsAdmin,
} from "../../../redux/selectors/user";
import {
  fetchExtraProfits,
  deleteExtraProfit,
  updateExtraProfit,
  ExtraProfit,
  UpdateExtraProfitPayload,
} from "../../../features/finance/apiFinance";
import { formatTimestamp } from "../../../features/finance/utils/formatTimestamp";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader";
import AddProfits from "../../../components/Profits/AddProfits/AddProfits";
import { t, TranslationKey } from "../../../utils/i18n";
const PROFITS_UPDATE_SUCCESS = "profits.update.success" as TranslationKey;
const PROFITS_UPDATE_ERROR = "profits.update.error" as TranslationKey;
const PROFITS_CONFIRM_DELETE = "profits.confirmDelete" as TranslationKey;
const PROFITS_CONFIRM_UPDATE = "profits.confirmUpdate" as TranslationKey;
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
      payload: UpdateExtraProfitPayload;
    };

type CurrencyOption = "USD" | "LBP";

interface EditFormState {
  id: string;
  name: string;
  value: string;
  paymentCurrency: CurrencyOption;
  shipmentId?: string;
  errors: Partial<Record<"name" | "value", string>>;
  original: ExtraProfit;
}

const currencyOptions: CurrencyOption[] = ["USD", "LBP"];

const ExtraProfits: React.FC = () => {
  const isAdmin = useSelector(selectUserIsAdmin);
  const token = useSelector(selectUserToken);
  const companyId = useSelector(selectUserCompanyId);

  const [showAddProfits, setShowAddProfits] = useState(false);
  const [profits, setProfits] = useState<ExtraProfit[]>([]);
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

  const refreshProfits = useCallback(async () => {
    if (!token || !companyId) return;
    try {
      const data = await fetchExtraProfits(token, companyId);
      setProfits(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error("Error refreshing profits:", err);
    }
  }, [companyId, token]);

  useEffect(() => {
    if (!token || !companyId) {
      setProfits([]);
      setLoading(false);
      return;
    }

    let active = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchExtraProfits(token, companyId);
        if (active) {
          setProfits(data);
        }
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        console.error("Error fetching extra profits:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [companyId, token, showAddProfits]);

  const openEditModal = useCallback((profit: ExtraProfit) => {
    setEditState({
      id: profit._id,
      name: String(profit.name ?? ""),
      value: String(profit.value ?? ""),
      paymentCurrency: (String(profit.paymentCurrency).toUpperCase() as CurrencyOption) || "USD",
      shipmentId: profit.shipmentId,
      errors: {},
      original: profit,
    });
    setOpenMenuId(null);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditState(null);
  }, []);

  const requestDelete = useCallback((profit: ExtraProfit) => {
    setPendingAction({
      type: "delete",
      id: profit._id,
      name: String(profit.name ?? ""),
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
        await deleteExtraProfit(token, pendingAction.id);
        toast.success(t("profits.delete.success"));
      } else {
        await updateExtraProfit(token, pendingAction.id, pendingAction.payload);
        toast.success(t(PROFITS_UPDATE_SUCCESS));
        closeEditModal();
      }
      await refreshProfits();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(
        pendingAction.type === "delete"
          ? t("profits.delete.error")
          : t(PROFITS_UPDATE_ERROR)
      );
      console.error("Extra profits action error:", message);
    } finally {
      setActionLoading(false);
      setPendingAction(null);
      closeMenu();
    }
  }, [closeEditModal, closeMenu, pendingAction, refreshProfits, token]);

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
          errors.name = t("profits.fields.name") + " " + t("common.error");
        }
        if (!Number.isFinite(valueNumber) || valueNumber < 0) {
          errors.value = t("profits.fields.value") + " " + t("common.error");
        }

        if (Object.keys(errors).length > 0) {
          return { ...prev, errors };
        }

        const payload: UpdateExtraProfitPayload = {};
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
      ? t("profits.delete")
      : t("common.edit")
    : "";

  const confirmMessage = pendingAction
    ? pendingAction.type === "delete"
      ? t(PROFITS_CONFIRM_DELETE, { name: pendingAction.name })
      : t(PROFITS_CONFIRM_UPDATE, { name: pendingAction.name })
    : "";

  return (
    <div className="finance-page" dir="rtl">
      <ToastContainer position="top-right" autoClose={1500} rtl />

      <header className="finance-header">
        <div className="finance-header__titles">
          <h2 className="finance-title">{t("profits.title")}</h2>
          <p className="finance-subtitle">
            {t("profits.fields.currency")}: {t("profits.currency.usd")} • {t("profits.currency.lbp")} |
            {" "}
            {t("profits.fields.date")}
          </p>
        </div>

        {!isAdmin && (
          <button
            type="button"
            className="finance-btn finance-btn--primary"
            onClick={() => setShowAddProfits((prev) => !prev)}
            aria-expanded={showAddProfits}
            aria-controls="add-profits-form"
          >
            {showAddProfits ? t("profits.hideForm") : t("profits.addToggle")}
          </button>
        )}
      </header>

      {!isAdmin && showAddProfits && (
        <section id="add-profits-form" className="finance-section">
          <AddProfits
            config={{
              modelName: t("profits.title"),
              title: t("profits.add.title"),
              buttonLabel: t("profits.add.buttonLabel"),
              fields: {
                name: { label: t("profits.fields.name"), "input-type": "text" },
                value: { label: t("profits.fields.value"), "input-type": "number" },
                paymentCurrency: {
                  label: t("profits.fields.paymentCurrency"),
                  "input-type": "selectOption",
                  options: [
                    { value: "USD", label: t("profits.currency.usd") },
                    { value: "LBP", label: t("profits.currency.lbp") },
                  ],
                },
              },
            }}
            onSuccess={() => {
              setShowAddProfits(false);
              refreshProfits();
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
          <div className="finance-state">
            <SpinLoader />
          </div>
        ) : error ? (
          <p role="alert" className="finance-state finance-state--error">
            {t("common.error")}: {error}
          </p>
        ) : profits.length === 0 ? (
          <p className="finance-state">{t("profits.empty")}</p>
        ) : (
          <ul className="finance-list">
            {profits.map((profit) => {
              const currencyLabel =
                profit.paymentCurrency === "USD"
                  ? t("profits.currency.usd")
                  : t("profits.currency.lbp");
              return (
                <li key={profit._id} className="finance-card">
                  <div className="finance-card__header">
                    <div className="finance-card__title-group">
                      <h3 className="finance-card__title">{profit.name}</h3>
                      <span className="finance-card__date">
                        {formatTimestamp(profit.timestamp)}
                      </span>
                    </div>
                    <span
                      className={`finance-badge finance-badge--${String(
                        profit.paymentCurrency
                      ).toLowerCase()}`}
                    >
                      {currencyLabel}
                    </span>
                    <div className="finance-card__menu" data-menu-root="true">
                      <button
                        type="button"
                        className="finance-card__menu-btn"
                        onClick={() => toggleMenu(profit._id)}
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === profit._id}
                        aria-label={t("common.moreOptions", { name: profit.name })}
                      >
                        ⋮
                      </button>
                      {openMenuId === profit._id && (
                        <div className="finance-card__menu-popover" role="menu">
                          <button
                            type="button"
                            className="finance-card__menu-item"
                            onClick={() => openEditModal(profit)}
                            role="menuitem"
                          >
                            {t("common.edit")}
                          </button>
                          <button
                            type="button"
                            className="finance-card__menu-item finance-card__menu-item--danger"
                            onClick={() => requestDelete(profit)}
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
                        <dt>{t("profits.fields.value")}</dt>
                        <dd>{formatAmount(profit.value)}</dd>
                      </div>
                      <div className="finance-grid__item">
                        <dt>{t("profits.fields.valueUSD")}</dt>
                        <dd>
                          {Number.isFinite(Number(profit.valueInUSD))
                            ? numberFormatter.format(Number(profit.valueInUSD))
                            : String(profit.valueInUSD)}
                        </dd>
                      </div>
                      <div className="finance-grid__item">
                        <dt>{t("profits.fields.paymentCurrency")}</dt>
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
            aria-labelledby="edit-profit-title"
          >
            <header className="finance-modal__header">
              <h3 id="edit-profit-title" className="finance-modal__title">
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
                <label htmlFor="profit-name">{t("profits.fields.name")}</label>
                <input
                  id="profit-name"
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
                <label htmlFor="profit-value">{t("profits.fields.value")}</label>
                <input
                  id="profit-value"
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
                <label htmlFor="profit-currency">{t("profits.fields.paymentCurrency")}</label>
                <select
                  id="profit-currency"
                  name="paymentCurrency"
                  value={editState.paymentCurrency}
                  onChange={(event) => handleEditFieldChange("paymentCurrency", event.target.value)}
                >
                  {currencyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "USD"
                        ? t("profits.currency.usd")
                        : t("profits.currency.lbp")}
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
            aria-labelledby="confirm-profit-title"
          >
            <header className="finance-modal__header">
              <h3 id="confirm-profit-title" className="finance-modal__title">
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

export default ExtraProfits;
