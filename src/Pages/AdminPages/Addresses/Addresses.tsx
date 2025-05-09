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
  const [searchTerm, setSearchTerm] = useState<string>(""); // State for the search term
  const { areaId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch customers data from your API
    fetch(`https://trx-api.linarawas.com/api/customers/area/${areaId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCustomers(data);
        console.log(`number of customers in this area: ${data.length}`);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
        setLoading(false);
      });
  }, [areaId, token]);

  const handleDeleteArea = async () => {
    try {
      const response = await fetch(
        `https://trx-api.linarawas.com/api/areas/${areaId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Area deleted successfully");

        setTimeout(() => {
          navigate("/areas");
        }, 1500);
      } else {
        toast.error("Error deleting Area");

        // Handle errors here
        console.error("Error deleting Area");
      }
    } catch (error) {
      toast.error("Error deleting Area");

      console.error("Error deleting Area:", error);
    }
  };

  // Filter customers by the search term
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="address-body"
      style={{ direction: "rtl", textAlign: "right" }}
    >
      <ToastContainer position="top-right" autoClose={1000} />

      <div className="address-header">
        <h1 className="address-title">معلومات العناوين:</h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="بحث بالاسم"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>

      {loading ? (
        <p className="loading">جارٍ التحميل...</p>
      ) : (
        <table className="address-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الهاتف</th>
              <th>العنوان</th>
              <th>المزيد</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer._id}>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
                <td>{customer.address}</td>

                <td>
                  <Link to={`/updateCustomer/${customer._id}`}>تعديل</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
