import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Customers.css";
import { useDispatch, useSelector } from "react-redux";
import { clearCustomerId } from "../../../redux/Order/action";
import AddCustomers from "../../../components/Customers/AddCustomers/AddCustomers";
import AddCustomer from "../../../components/Customers/AddCustomer/AddCustomer.jsx";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader.jsx";
import AddCustomerInitials from "../../../components/Customers/AddCustomerInitials/AddCustomerInitials";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  address: string;
}

const Customers: React.FC = () => {
  const token: string = useSelector((state: any) => state.user.token);
  const companyId: string = useSelector((state: any) => state.user.companyId);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInsertBulk, setShowInsertBulk] = useState<boolean>(false);
  const [showInsertOne, setShowInsertOne] = useState<boolean>(false);
  const [showInsertInitial, setShowInsertInitial] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCustomerId());

    fetch(`http://localhost:5000/api/customers/company/${companyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data: Customer[]) => {
        setCustomers(data);
        console.log("number of customers in your company: ", data.length);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
        setLoading(false);
      });
  }, [token, companyId, showInsertBulk, showInsertOne]);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customers-body" dir="rtl">
      <div className="customer-header">
        <h2 className="customers-title">الزبائن</h2>
        <div className="customer-adding-options">
          <button
            className="customer-adding-option"
            onClick={() => {
              setShowInsertOne(!showInsertOne);
            }}
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
            placeholder="ابحث عن الزبائن"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <SpinLoader />
      ) : (
        <div>
          {!showInsertOne && (
            <div className="customer-card-list">
              {filteredCustomers.map((customer) => (
                <Link
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
          )}
        </div>
      )}
    </div>
  );
};

export default Customers;
