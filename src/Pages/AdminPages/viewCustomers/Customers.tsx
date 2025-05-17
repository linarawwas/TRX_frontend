import React, { useState, useEffect } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
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
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<number>(0);
  const [showInsertBulk, setShowInsertBulk] = useState<boolean>(false);
  const [showInsertOne, setShowInsertOne] = useState<boolean>(false);
  const [showInsertInitial, setShowInsertInitial] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCustomerId());

    fetch(`https://trx-api.linarawas.com/api/customers/company/${companyId}`, {
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

  // Filter customers by the search term
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customers-body" dir="rtl">
      <div className="customer-header">
        <h2 className="customers-title">الزبائن</h2>
        <div className="customer-adding-options">
          {/* <button
            className="customer-adding-option"
            onClick={() => {
              setShowInsertBulk(!showInsertBulk);
            }}
          >
            {showInsertBulk ? "إخفاء النموذج" : "إضافة مجموعة؟"}
          </button> */}
          <button
            className="customer-adding-option"
            onClick={() => {
              setShowInsertOne(!showInsertOne);
            }}
          >
            {showInsertOne ? "عرض الزبائن" : "إضافة زبون؟"}
          </button>
          {/* <button
            className="customer-adding-option"
            onClick={() => {
              setShowInsertInitial(!showInsertInitial);
            }}
          >
            {showInsertInitial ? "عودة" : "إضافة زبائن أولية حسب المنطقة"}
          </button> */}
          {showInsertBulk && <AddCustomers />}
          {showInsertOne && <AddCustomer />}
          {showInsertInitial && <AddCustomerInitials />}
        </div>

        {/* Search Bar */}
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
            <table className="customers-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>تعديل</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers?.map((customer) => (
                  <tr key={customer._id}>
                    <td>{customer?.name}</td>
                    <td className="link-to-edit">
                      <Link to={`/updateCustomer/${customer._id}`}>📝</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Customers;
