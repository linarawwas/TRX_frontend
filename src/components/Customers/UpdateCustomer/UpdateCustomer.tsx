import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./UpdateCustomer.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import SelectInput from "../../UI reusables/SelectInput/SelectInput";
import CustomerInvoices from "../CustomerInvoices/CustomerInvoices";
import CustomerOrders from "../CustomerOrders/CustomerOrders";
import CustomerInfo from "../CustomerInfo/CustomerInfo";
import { setCustomerId } from "../../../redux/Order/action";
import { fetchAndCacheCustomerInvoice } from "../../../utils/apiHelpers";

function UpdateCustomer() {
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.user.token);
  const companyId = useSelector((state: any) => state.user.companyId);
  const navigate = useNavigate();
  const { customerId } = useParams();

  const [areas, setAreas] = useState([]);
  const [customerData, setCustomerData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoiceReady, setInvoiceReady] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState({
    _id: "",
    name: "",
    phone: "",
    address: "",
    areaId: { _id: "", name: "" },
    companyId: companyId,
    hasDiscount: false,
    valueAfterDiscount: 0,
    discountCurrency: "",
    noteAboutCustomer: "",
  });

  useEffect(() => {
    if (customerId) {
      dispatch(setCustomerId(customerId));
    }
  }, [customerId, dispatch]);

  const fetchAreas = () => {
    fetch(`http://localhost:5000/api/areas/company/${companyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAreas)
      .catch((err) => console.error("Fetching areas failed:", err));
  };

  const fetchCustomer = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/customers/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setCustomerData(data);
        setOriginalData(data);

        await fetchAndCacheCustomerInvoice(customerId, token);
        setInvoiceReady(true);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setInvoiceReady(true); // Proceed even if invoice fetch fails
    } finally {
      setLoading(false);
    }
  }, [customerId, token]);

  useEffect(() => {
    fetchAreas();
    fetchCustomer();
  }, [fetchCustomer]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "phone" && !/^\d*$/.test(value))
      return toast.error("أدخل أرقام فقط");
    setUpdatedInfo({ ...updatedInfo, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const updated = {
      ...originalData,
      ...updatedInfo,
      areaId: updatedInfo.areaId._id ? updatedInfo.areaId : originalData.areaId,
    };

    try {
      const res = await fetch(
        `http://localhost:5000/api/customers/${customerId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updated),
        }
      );
      if (res.ok) {
        toast.success("تم التحديث بنجاح");
        fetchCustomer();
      } else {
        toast.error("فشل التحديث");
      }
    } catch (err) {
      console.error(err);
      toast.error("فشل التحديث");
    }
  };

  return (
    <div className="update-customer-container">
      <ToastContainer position="top-right" autoClose={1000} />

      <div className="update-header">
        <h1>معلومات الزبون:</h1>
      </div>

      <CustomerInfo customerData={customerData} loading={loading} />

      {customerData && invoiceReady && (
        <>
          <CustomerInvoices customerId={customerId!} />
          <CustomerOrders />
        </>
      )}

      <div
        className="update-toggle"
        onClick={() => setFormVisible(!formVisible)}
      >
        تعديل الزبون؟
      </div>

      {formVisible && (
        <form className="update-customer-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={updatedInfo.name}
            placeholder="الاسم الجديد"
            onChange={handleChange}
          />
          <input
            type="text"
            name="phone"
            value={updatedInfo.phone}
            placeholder="رقم الهاتف الجديد"
            onChange={handleChange}
          />
          <input
            type="text"
            name="address"
            value={updatedInfo.address}
            placeholder="العنوان الجديد"
            onChange={handleChange}
          />
          <br />
          <SelectInput
            label="المنطقة:"
            name="areaId"
            value={updatedInfo.areaId._id}
            options={areas.map((area) => ({
              value: area._id,
              label: area.name,
            }))}
            onChange={handleChange}
          />

          <button type="submit">تحديث الزبون</button>
        </form>
      )}
    </div>
  );
}

export default UpdateCustomer;
