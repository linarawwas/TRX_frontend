import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./Addresses.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

interface Customer {
  _id: string;
  address: string;
  name: string;
  phone: string;
}

export default function Addresses(): JSX.Element {
  const token: string = useSelector((state: any) => state.user.token);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { areaId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://trx-api.linarawas.com/api/customers/area/${areaId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
        setLoading(false);
      });
  }, [areaId, token]);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="address-card-body" dir="rtl">
      <ToastContainer position="top-right" autoClose={1000} />

      <div className="address-card-header">
        <h2 className="address-card-title">عناوين الزبائن</h2>
        <input
          type="text"
          placeholder="بحث بالاسم"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="address-card-search-bar"
        />
      </div>

      {loading ? (
        <p className="address-card-loading">جارٍ التحميل...</p>
      ) : filteredCustomers.length === 0 ? (
        <p className="address-card-empty">لا يوجد زبائن بهذه المواصفات</p>
      ) : (
        <div className="address-card-list">
          {filteredCustomers.map((customer) => (
            <Link
              to={`/updateCustomer/${customer._id}`}
              className="address-card-link"
              key={customer._id}
            >
              <div className="address-card">
                <p>
                  <span className="address-card-label">الاسم:</span>{" "}
                  {customer.name}
                </p>
                <p>
                  <span className="address-card-label">الهاتف:</span>{" "}
                  {customer.phone}
                </p>
                <p>
                  <span className="address-card-label">العنوان:</span>{" "}
                  {customer.address}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
