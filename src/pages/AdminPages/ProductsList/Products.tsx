import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "../../../styles/financeRecords.css";
import "../../../components/Customers/CustomerInvoices/CustomerInvoices.css";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader";
import AddProducts from "../../../components/Products/AddProducts";
import {
  selectUserCompanyId,
  selectUserIsAdmin,
  selectUserToken,
} from "../../../redux/selectors/user";
import { useProducts, Product } from "../../../features/products/hooks/useProducts";
import { updateProduct, UpdateProductPayload } from "../../../features/products/apiProducts";
import { t, TranslationKey } from "../../../utils/i18n";

const PRODUCTS_UPDATE_SUCCESS = "products.update.success" as TranslationKey;
const PRODUCTS_UPDATE_ERROR = "products.update.error" as TranslationKey;
const PRODUCTS_CONFIRM_DELETE = "products.confirmDelete" as TranslationKey;
const PRODUCTS_CONFIRM_UPDATE = "products.confirmUpdate" as TranslationKey;
const COMMON_NO_CHANGES = "common.noChanges" as TranslationKey;

type PendingAction =
  | { type: "delete"; id: string; name: string }
  | { type: "update"; id: string; name: string; payload: UpdateProductPayload };

type ReturnableOption = "true" | "false";

interface EditProductFormState {
  id: string;
  type: string;
  priceInDollars: string;
  isReturnable: ReturnableOption;
  errors: Partial<Record<"type" | "priceInDollars", string>>;
  original: Product;
}

const returnableOptions: ReturnableOption[] = ["true", "false"];

const ProductsList: React.FC = () => {
  const token = useSelector(selectUserToken);
  const companyId = useSelector(selectUserCompanyId);
  const isAdmin = useSelector(selectUserIsAdmin);

  const {
    items: products,
    loading,
    error,
    remove,
    refetch,
    setItems,
  } = useProducts(token, companyId ?? undefined);

  const [showAddProducts, setShowAddProducts] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [editState, setEditState] = useState<EditProductFormState | null>(null);

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

  const openEditModal = useCallback((product: Product) => {
    setEditState({
      id: product._id,
      type: String(product.type ?? ""),
      priceInDollars: String(product.priceInDollars ?? ""),
      isReturnable: product.isReturnable ? "true" : "false",
      errors: {},
      original: product,
    });
  }, []);

  const closeEditModal = useCallback(() => {
    setEditState(null);
  }, []);

  const requestDelete = useCallback((product: Product) => {
    setPendingAction({
      type: "delete",
      id: product._id,
      name: String(product.type ?? ""),
    });
  }, []);

  const handleFieldChange = useCallback(
    (field: "type" | "priceInDollars" | "isReturnable", value: string) => {
      setEditState((prev) => {
        if (!prev) return prev;
        const nextErrors = { ...prev.errors };
        if (field === "type" || field === "priceInDollars") {
          delete nextErrors[field];
        }
        return {
          ...prev,
          [field]: field === "isReturnable" ? (value as ReturnableOption) : value,
          errors: nextErrors,
        };
      });
    },
    []
  );

  const commitAction = useCallback(async () => {
    if (!pendingAction || !token) return;
    setActionLoading(true);

    try {
      if (pendingAction.type === "delete") {
        await remove(pendingAction.id);
        toast.success(t("products.delete.success"));
      } else {
        const updated = await updateProduct(token, pendingAction.id, pendingAction.payload);
        setItems((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
        toast.success(t(PRODUCTS_UPDATE_SUCCESS));
        closeEditModal();
      }
      await refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(
        pendingAction.type === "delete"
          ? t("products.delete.error")
          : t(PRODUCTS_UPDATE_ERROR)
      );
      console.error("Products action error:", message);
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  }, [closeEditModal, pendingAction, refetch, remove, setItems, token]);

  const handleEditSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditState((prev) => {
      if (!prev) return prev;

      const trimmedType = prev.type.trim();
      const priceNumber = Number(prev.priceInDollars);
      const errors: EditProductFormState["errors"] = {};

      if (!trimmedType) {
        errors.type = t("products.fields.type") + " " + t("common.error");
      }
      if (!Number.isFinite(priceNumber) || priceNumber < 0) {
        errors.priceInDollars = t("products.fields.priceInDollars") + " " + t("common.error");
      }

      if (Object.keys(errors).length > 0) {
        return { ...prev, errors };
      }

      const payload: UpdateProductPayload = {};
      if (trimmedType !== prev.original.type) {
        payload.type = trimmedType;
      }
      if (priceNumber !== prev.original.priceInDollars) {
        payload.priceInDollars = priceNumber;
      }
      const isReturnableBool = prev.isReturnable === "true";
      if (isReturnableBool !== prev.original.isReturnable) {
        payload.isReturnable = isReturnableBool;
      }

      if (Object.keys(payload).length === 0) {
        toast.info(t(COMMON_NO_CHANGES));
        return prev;
      }

      setPendingAction({
        type: "update",
        id: prev.id,
        name: trimmedType,
        payload,
      });

      return prev;
    });
  }, []);

  const confirmTitle = pendingAction
    ? pendingAction.type === "delete"
      ? t("products.delete")
      : t("common.edit")
    : "";

  const confirmMessage = pendingAction
    ? pendingAction.type === "delete"
      ? t(PRODUCTS_CONFIRM_DELETE, { name: pendingAction.name })
      : t(PRODUCTS_CONFIRM_UPDATE, { name: pendingAction.name })
    : "";

  const errorMessage = error ? t("products.fetch.error") : "";

  return (
    <div className="finance-page" dir="rtl">
      <ToastContainer position="top-right" autoClose={1500} rtl />

      <header className="finance-header">
        <div className="finance-header__titles">
          <h2 className="finance-title">{t("products.title")}</h2>
          <p className="finance-subtitle">
            {t("products.fields.type")}, {t("products.fields.priceInDollars")} • {t("products.fields.returnable")}
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="finance-btn finance-btn--primary"
            onClick={() => setShowAddProducts((prev) => !prev)}
            aria-expanded={showAddProducts}
            aria-controls="add-products-form"
          >
            {showAddProducts ? t("products.add.toggleHide") : t("products.add.toggleShow")}
          </button>
        )}
      </header>

      {isAdmin && showAddProducts && (
        <section id="add-products-form" className="finance-section">
          <AddProducts
            config={{
              modelName: t("products.title"),
              title: t("products.add.title"),
              buttonLabel: t("products.add.buttonLabel"),
              fields: {
                type: { label: t("products.fields.type"), "input-type": "text" },
                priceInDollars: {
                  label: t("products.fields.priceInDollars"),
                  "input-type": "number",
                },
                isReturnable: {
                  label: t("products.fields.returnable"),
                  "input-type": "selectOption",
                  options: [
                    { value: true, label: t("products.returnable.yes") },
                    { value: false, label: t("products.returnable.no") },
                  ],
                },
              },
            }}
            onSuccess={() => {
              setShowAddProducts(false);
              refetch();
            }}
            onError={(err) => {
              const message = err instanceof Error ? err.message : String(err);
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
            {errorMessage}
          </p>
        ) : !products.length ? (
          <p className="finance-state">{t("products.none")}</p>
        ) : (
          <ul className="finance-list">
            {products.map((product) => {
              const returnableLabel = product.isReturnable
                ? t("products.returnable.yes")
                : t("products.returnable.no");
              const returnableBadgeClass = product.isReturnable
                ? "finance-badge--success"
                : "finance-badge--danger";

              return (
                <li key={product._id} className="finance-card">
                  <div className="finance-card__header">
                    <div className="finance-card__title-group">
                      <h3 className="finance-card__title">{product.type}</h3>
                    </div>
                    <span className={`finance-badge ${returnableBadgeClass}`}>
                      {returnableLabel}
                    </span>
                  </div>

                  <div className="finance-card__content">
                    <dl className="finance-grid">
                      <div className="finance-grid__item">
                        <dt>{t("products.fields.priceInDollars")}</dt>
                        <dd>{formatAmount(product.priceInDollars)}</dd>
                      </div>
                      <div className="finance-grid__item">
                        <dt>{t("products.fields.returnable")}</dt>
                        <dd>{returnableLabel}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="finance-card__actions">
                    <button
                      type="button"
                      className="finance-btn finance-btn--ghost"
                      onClick={() => openEditModal(product)}
                      aria-label={`${t("common.edit")} ${product.type}`}
                    >
                      {t("common.edit")}
                    </button>
                    <button
                      type="button"
                      className="finance-btn finance-btn--danger"
                      onClick={() => requestDelete(product)}
                      aria-label={`${t("products.delete")} ${product.type}`}
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {editState && (
        <div className="finance-modal-overlay" role="presentation">
          <div className="finance-modal" role="dialog" aria-modal="true" aria-labelledby="edit-product-title">
            <header className="finance-modal__header">
              <h3 id="edit-product-title" className="finance-modal__title">
                {t("common.edit")}: {editState.type}
              </h3>
              <button
                type="button"
                className="finance-modal__close"
                onClick={closeEditModal}
                aria-label={t("common.cancel")}
              >
                ×
              </button>
            </header>

            <form className="finance-form" onSubmit={handleEditSubmit}>
              <div className="finance-field">
                <label htmlFor="product-type">{t("products.fields.type")}</label>
                <input
                  id="product-type"
                  name="type"
                  value={editState.type}
                  onChange={(event) => handleFieldChange("type", event.target.value)}
                  required
                />
                {editState.errors.type && (
                  <span className="finance-field__error">{editState.errors.type}</span>
                )}
              </div>

              <div className="finance-field">
                <label htmlFor="product-price">{t("products.fields.priceInDollars")}</label>
                <input
                  id="product-price"
                  name="priceInDollars"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={editState.priceInDollars}
                  onChange={(event) => handleFieldChange("priceInDollars", event.target.value)}
                  required
                />
                {editState.errors.priceInDollars && (
                  <span className="finance-field__error">{editState.errors.priceInDollars}</span>
                )}
              </div>

              <div className="finance-field">
                <label htmlFor="product-returnable">{t("products.fields.returnable")}</label>
                <select
                  id="product-returnable"
                  name="isReturnable"
                  value={editState.isReturnable}
                  onChange={(event) => handleFieldChange("isReturnable", event.target.value)}
                >
                  {returnableOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "true"
                        ? t("products.returnable.yes")
                        : t("products.returnable.no")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="finance-modal__actions">
                <button
                  type="button"
                  className="finance-btn finance-btn--ghost"
                  onClick={closeEditModal}
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
          <div className="finance-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-product-title">
            <header className="finance-modal__header">
              <h3 id="confirm-product-title" className="finance-modal__title">
                {confirmTitle}
              </h3>
            </header>
            <p className="finance-modal__body">{confirmMessage}</p>
            <div className="finance-modal__actions">
              <button
                type="button"
                className="finance-btn finance-btn--ghost"
                onClick={() => setPendingAction(null)}
                disabled={actionLoading}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className={`finance-btn ${
                  pendingAction.type === "delete" ? "finance-btn--danger" : "finance-btn--primary"
                }`}
                onClick={commitAction}
                disabled={actionLoading}
              >
                {actionLoading
                  ? t("common.loading")
                  : pendingAction.type === "delete"
                  ? t("common.delete")
                  : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
