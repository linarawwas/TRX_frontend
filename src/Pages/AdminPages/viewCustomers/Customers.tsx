import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Customers.css";
import { useDispatch, useSelector } from "react-redux";
import { clearCustomerId } from "../../../redux/Order/action";
import AddCustomer from "../../../components/Customers/AddCustomer/AddCustomer.tsx";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader.jsx";

interface Customer {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
}

const Customers: React.FC = () => {
  const token: string = useSelector((state: any) => state.user.token);
  // companyId not needed anymore (the backend infers it from auth)
  const [activeCustomers, setActiveCustomers] = useState<Customer[]>([]);
  const [inactiveCustomers, setInactiveCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showInsertOne, setShowInsertOne] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [openActive, setOpenActive] = useState<boolean>(true);
  const [openInactive, setOpenInactive] = useState<boolean>(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCustomerId());

    setLoading(true);
    fetch(`https://trx-api.linarawas.com/api/customers/company`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: { active: Customer[]; inactive: Customer[] }) => {
        setActiveCustomers(Array.isArray(data?.active) ? data.active : []);
        setInactiveCustomers(Array.isArray(data?.inactive) ? data.inactive : []);
      })
      .catch((err) => {
        console.error("Error fetching customers:", err);
      })
      .finally(() => setLoading(false));
  }, [token, showInsertOne]);

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
        <h2 className="customers-title">الزبائن</h2>

        <div className="customer-adding-options">
          <button
            className="customer-adding-option"
            onClick={() => setShowInsertOne(!showInsertOne)}
          >
            {showInsertOne ? "عرض الزبائن" : "إضافة زبون؟"}
          </button>

          {showInsertOne && (
            <div className="customer-form-wrapper">
              <AddCustomer />
            </div>
          )}
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="ابحث عن الزبائن (نشط وغير نشط)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <SpinLoader />
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
                <span className="acc-title">الزبائن الناشطون</span>
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
                          title={`تعديل ${customer.name}`}
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
                    <p className="muted-center">لا نتائج ضمن الناشطين</p>
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
                <span className="acc-title">الزبائن غير الناشطين</span>
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
                          title={`تعديل ${customer.name}`}
                        >
                          <div className="customer-card inactive-card">
                            <div className="customer-card-content">
                              <span className="customer-name">{customer.name}</span>
                              <span className="status-chip">غير نشط</span>
                              <span className="edit-customer-icon">📝</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="muted-center">لا نتائج ضمن غير الناشطين</p>
                  )}
                </div>
              )}
            </section>

            {noResults && (
              <p className="muted-center" style={{ marginTop: 8 }}>
                لا توجد نتائج للبحث الحالي
              </p>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default Customers;
