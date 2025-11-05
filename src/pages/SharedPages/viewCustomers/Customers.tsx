import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Customers.css";
import { useDispatch, useSelector } from "react-redux";
import { clearCustomerId } from "../../../redux/Order/action";
import { selectUserToken } from "../../../redux/selectors/user";
import { fetchCustomersByCompany } from "../../../features/customers/apiCustomers";
import AddCustomer from "../../../components/Customers/AddCustomer/AddCustomer";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader.jsx";
import { t } from "../../../utils/i18n";

interface Customer {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
}

const Customers: React.FC = () => {
  const token = useSelector(selectUserToken);
  const [activeCustomers, setActiveCustomers] = useState<Customer[]>([]);
  const [inactiveCustomers, setInactiveCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showInsertOne, setShowInsertOne] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [openActive, setOpenActive] = useState<boolean>(true);
  const [openInactive, setOpenInactive] = useState<boolean>(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCustomerId());

    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCustomersByCompany(token);
        if (cancelled) return;
        setActiveCustomers(Array.isArray(data?.active) ? data.active : []);
        setInactiveCustomers(Array.isArray(data?.inactive) ? data.inactive : []);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        console.error("Error fetching customers:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, showInsertOne, dispatch]);

  // one filter function applied to BOTH lists
  const matches = (c: Customer) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  };

  const filteredActive = useMemo(
    () => activeCustomers.filter(matches),
    [activeCustomers, searchTerm]
  );
  const filteredInactive = useMemo(
    () => inactiveCustomers.filter(matches),
    [inactiveCustomers, searchTerm]
  );

  const noResults =
    !loading &&
    searchTerm.trim().length > 0 &&
    filteredActive.length === 0 &&
    filteredInactive.length === 0;

  return (
    <div className="customers-body" dir="rtl">
      <div className="customer-header">
        <h2 className="customers-title">{t("customers.title")}</h2>

        <div className="customer-adding-options">
          <button
            type="button"
            className="customer-adding-option"
            onClick={() => setShowInsertOne(!showInsertOne)}
            aria-expanded={showInsertOne}
            aria-controls="add-customer-form"
          >
            {showInsertOne ? t("customers.showCustomers") : t("customers.addToggle")}
          </button>

          {showInsertOne && (
            <div id="add-customer-form" className="customer-form-wrapper">
              <AddCustomer />
            </div>
          )}
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder={t("customers.search.placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label={t("customers.search.placeholder")}
          />
        </div>
      </div>

      {loading ? (
        <SpinLoader />
      ) : error ? (
        <p role="alert">{t("common.error")}: {error}</p>
      ) : (
        !showInsertOne && (
          <div className="accordion">
            {/* ACTIVE */}
            <section className="accordion-section">
              <button
                type="button"
                className="accordion-header"
                aria-expanded={openActive}
                aria-controls="active-panel"
                onClick={() => setOpenActive((s) => !s)}
              >
                <span className={`chev ${openActive ? "open" : ""}`}>▸</span>
                <span className="acc-title">{t("customers.active.title")}</span>
                <span className="badge">
                  {filteredActive.length}/{activeCustomers.length}
                </span>
              </button>

              {openActive && (
                <div id="active-panel" className="accordion-body">
                  {filteredActive.length ? (
                    <div className="customer-card-list">
                      {filteredActive.map((customer) => (
                        <Link
                          key={customer._id}
                          to={`/updateCustomer/${customer._id}`}
                          className="customer-card-link"
                          title={`${t("common.edit")} ${customer.name}`}
                        >
                          <div className="customer-card">
                            <div className="customer-card-content">
                              <span className="customer-name">{customer.name}</span>
                              <span className="edit-customer-icon">📝</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="muted-center">{t("customers.active.empty")}</p>
                  )}
                </div>
              )}
            </section>

            {/* INACTIVE */}
            <section className="accordion-section">
              <button
                type="button"
                className="accordion-header inactive"
                aria-expanded={openInactive}
                aria-controls="inactive-panel"
                onClick={() => setOpenInactive((s) => !s)}
              >
                <span className={`chev ${openInactive ? "open" : ""}`}>▸</span>
                <span className="acc-title">{t("customers.inactive.title")}</span>
                <span className="badge gray">
                  {filteredInactive.length}/{inactiveCustomers.length}
                </span>
              </button>

              {openInactive && (
                <div id="inactive-panel" className="accordion-body">
                  {filteredInactive.length ? (
                    <div className="customer-card-list">
                      {filteredInactive.map((customer) => (
                        <Link
                          key={customer._id}
                          to={`/updateCustomer/${customer._id}`}
                          className="customer-card-link"
                          title={`${t("common.edit")} ${customer.name}`}
                        >
                          <div className="customer-card inactive-card">
                            <div className="customer-card-content">
                              <span className="customer-name">{customer.name}</span>
                              <span className="status-chip">{t("addresses.customer.status.inactive")}</span>
                              <span className="edit-customer-icon">📝</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="muted-center">{t("customers.inactive.empty")}</p>
                  )}
                </div>
              )}
            </section>

            {noResults && (
              <p className="muted-center" style={{ marginTop: 8 }}>
                {t("customers.noResults")}
              </p>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default Customers;
