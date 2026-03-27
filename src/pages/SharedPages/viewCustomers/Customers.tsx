import React, {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import "./Customers.css";
import { useDispatch, useSelector } from "react-redux";
import { clearCustomerId } from "../../../redux/Order/action";
import { selectUserToken } from "../../../redux/selectors/user";
import {
  fetchCustomersByCompany,
  type Customer,
} from "../../../features/customers/apiCustomers";
import AddCustomer from "../../../components/Customers/AddCustomer/AddCustomer";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader";
import { t } from "../../../utils/i18n";
import { createLogger } from "../../../utils/logger";

const logger = createLogger("customers-list");

function matchesSearch(c: Customer, qLower: string): boolean {
  if (!qLower) return true;
  return (
    Boolean(c.name && c.name.toLowerCase().includes(qLower)) ||
    Boolean(c.phone && c.phone.toLowerCase().includes(qLower)) ||
    Boolean(c.address && c.address.toLowerCase().includes(qLower))
  );
}

type CustomerRowProps = {
  customer: Customer;
  inactive?: boolean;
};

const CustomerRow = memo(function CustomerRow({
  customer,
  inactive = false,
}: CustomerRowProps) {
  return (
    <Link
      to={`/updateCustomer/${customer._id}`}
      className="customer-card-link vc-card-link"
      title={`${t("common.edit")} ${customer.name}`}
    >
      <article
        className={`customer-card vc-customer-card${inactive ? " inactive-card" : ""}`}
      >
        <div className="customer-card-content">
          <span className="customer-name vc-customer-name">{customer.name}</span>
          {inactive ? (
            <span className="status-chip">
              {t("addresses.customer.status.inactive")}
            </span>
          ) : null}
          <span className="edit-customer-icon vc-edit-icon" aria-hidden="true">
            📝
          </span>
        </div>
      </article>
    </Link>
  );
});

function CustomersInner(): JSX.Element {
  const token = useSelector(selectUserToken);
  const [activeCustomers, setActiveCustomers] = useState<Customer[]>([]);
  const [inactiveCustomers, setInactiveCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showInsertOne, setShowInsertOne] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [openActive, setOpenActive] = useState(true);
  const [openInactive, setOpenInactive] = useState(false);

  const dispatch = useDispatch();
  const activePanelId = useId();
  const inactivePanelId = useId();

  const loadCustomers = useCallback(async (signal: AbortSignal) => {
    if (!token) {
      setLoading(false);
      setActiveCustomers([]);
      setInactiveCustomers([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await fetchCustomersByCompany(token);

    if (signal.aborted) return;

    if (result.error || !result.data) {
      const msg = result.error || "Failed to fetch customers";
      logger.warn("fetchCustomersByCompany failed", { message: msg });
      setError(msg);
      setLoading(false);
      return;
    }

    setActiveCustomers(
      Array.isArray(result.data.active) ? result.data.active : []
    );
    setInactiveCustomers(
      Array.isArray(result.data.inactive) ? result.data.inactive : []
    );
    setLoading(false);
  }, [token]);

  useEffect(() => {
    dispatch(clearCustomerId());
    const ac = new AbortController();
    void loadCustomers(ac.signal);
    return () => ac.abort();
  }, [dispatch, showInsertOne, loadCustomers]);

  const qLower = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

  const filteredActive = useMemo(
    () => activeCustomers.filter((c) => matchesSearch(c, qLower)),
    [activeCustomers, qLower]
  );

  const filteredInactive = useMemo(
    () => inactiveCustomers.filter((c) => matchesSearch(c, qLower)),
    [inactiveCustomers, qLower]
  );

  const noResults =
    !loading &&
    searchTerm.trim().length > 0 &&
    filteredActive.length === 0 &&
    filteredInactive.length === 0;

  return (
    <div className="customers-body vc-shell" dir="rtl" lang="ar">
      <header className="customer-header vc-header">
        <h1 className="customers-title vc-title">{t("customers.title")}</h1>

        <div className="customer-adding-options vc-toolbar">
          <button
            type="button"
            className="customer-adding-option vc-btn vc-btn--primary"
            onClick={() => setShowInsertOne(!showInsertOne)}
            aria-expanded={showInsertOne}
            aria-controls="add-customer-form"
          >
            {showInsertOne ? t("customers.showCustomers") : t("customers.addToggle")}
          </button>

          <div className="search-bar vc-search">
            <label className="vc-search__label" htmlFor="customers-search-input">
              {t("customers.search.placeholder")}
            </label>
            <input
              id="customers-search-input"
              type="search"
              placeholder={t("customers.search.placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input vc-search__input"
              autoComplete="off"
            />
          </div>

          {showInsertOne ? (
            <div id="add-customer-form" className="customer-form-wrapper vc-form-wrap">
              <AddCustomer />
            </div>
          ) : null}
        </div>
      </header>

      {loading ? (
        <div className="vc-loading" aria-busy="true" aria-live="polite">
          <SpinLoader />
        </div>
      ) : error ? (
        <div className="vc-inline-error" role="alert">
          <p className="vc-inline-error__text">
            {t("common.error")}: {error}
          </p>
          <button
            type="button"
            className="vc-retry"
            onClick={() => {
              const ac = new AbortController();
              void loadCustomers(ac.signal);
            }}
          >
            {t("updateCustomer.retry")}
          </button>
        </div>
      ) : (
        !showInsertOne && (
          <div className="accordion vc-accordion">
            <section className="accordion-section vc-acc-section">
              <button
                type="button"
                className="accordion-header vc-acc-header"
                aria-expanded={openActive}
                aria-controls={activePanelId}
                onClick={() => setOpenActive((s) => !s)}
              >
                <span
                  className={`chev vc-chev ${openActive ? "open" : ""}`}
                  aria-hidden="true"
                >
                  ▸
                </span>
                <span className="acc-title">{t("customers.active.title")}</span>
                <span className="badge vc-badge">
                  {filteredActive.length}/{activeCustomers.length}
                </span>
              </button>

              {openActive ? (
                <div id={activePanelId} className="accordion-body vc-acc-body">
                  {filteredActive.length ? (
                    <div className="customer-card-list vc-card-list">
                      {filteredActive.map((customer) => (
                        <CustomerRow key={customer._id} customer={customer} />
                      ))}
                    </div>
                  ) : (
                    <p className="muted-center vc-muted">{t("customers.active.empty")}</p>
                  )}
                </div>
              ) : null}
            </section>

            <section className="accordion-section vc-acc-section">
              <button
                type="button"
                className="accordion-header inactive vc-acc-header vc-acc-header--muted"
                aria-expanded={openInactive}
                aria-controls={inactivePanelId}
                onClick={() => setOpenInactive((s) => !s)}
              >
                <span
                  className={`chev vc-chev ${openInactive ? "open" : ""}`}
                  aria-hidden="true"
                >
                  ▸
                </span>
                <span className="acc-title">{t("customers.inactive.title")}</span>
                <span className="badge gray vc-badge vc-badge--gray">
                  {filteredInactive.length}/{inactiveCustomers.length}
                </span>
              </button>

              {openInactive ? (
                <div id={inactivePanelId} className="accordion-body vc-acc-body">
                  {filteredInactive.length ? (
                    <div className="customer-card-list vc-card-list">
                      {filteredInactive.map((customer) => (
                        <CustomerRow
                          key={customer._id}
                          customer={customer}
                          inactive
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="muted-center vc-muted">
                      {t("customers.inactive.empty")}
                    </p>
                  )}
                </div>
              ) : null}
            </section>

            {noResults ? (
              <p className="muted-center vc-muted vc-no-results">
                {t("customers.noResults")}
              </p>
            ) : null}
          </div>
        )
      )}
    </div>
  );
}

type BoundaryState = { hasError: boolean };

class CustomersErrorBoundary extends React.Component<
  { children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo): void {
    logger.error("Customers view crashed", {
      message: err.message,
      stack: err.stack,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="customers-body vc-shell vc-shell--error"
          dir="rtl"
          lang="ar"
          role="alert"
        >
          <div className="vc-error-card">
            <h2 className="vc-error-title">{t("updateCustomer.errorBoundary.title")}</h2>
            <p className="vc-error-body">{t("updateCustomer.errorBoundary.body")}</p>
            <button
              type="button"
              className="vc-error-reload"
              onClick={() => window.location.reload()}
            >
              {t("updateCustomer.errorBoundary.reload")}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Customers(): JSX.Element {
  return (
    <CustomersErrorBoundary>
      <CustomersInner />
    </CustomersErrorBoundary>
  );
}
