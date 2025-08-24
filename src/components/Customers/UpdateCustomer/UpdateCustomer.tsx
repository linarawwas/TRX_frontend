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
import AreaSequencePicker from "../../AreaSequencePicker/AreaSequencePicker";

type Area = { _id: string; name: string };
type CustomerLite = { _id: string; name: string; sequence?: number | null };

function UpdateCustomer() {
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.user.token);
  const companyId = useSelector((state: any) => state.user.companyId);
  const navigate = useNavigate();
  const { customerId } = useParams();

  const [areas, setAreas] = useState<Area[]>([]);
  const [customerData, setCustomerData] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
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

  // NEW: data for sequence placement UI
  const [areaCustomers, setAreaCustomers] = useState<CustomerLite[]>([]);
  const [posTarget, setPosTarget] = useState<string>("__END__"); // __START__ | __END__ | <customerId>
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => {
    if (customerId) dispatch(setCustomerId(customerId));
  }, [customerId, dispatch]);

  const fetchAreas = () => {
    fetch("http://localhost:5000/api/areas/company", {
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch customer");
      const data = await res.json();
      setCustomerData(data);
      setOriginalData(data);

      await fetchAndCacheCustomerInvoice(customerId!, token);
      setInvoiceReady(true);

      // also load customers in the same area (ordered by sequence; fallback to client sort)
      if (data?.areaId?._id) {
        const listRes = await fetch(
          `http://localhost:5000/api/customers/area/${data.areaId._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const list: CustomerLite[] = await listRes.json();
        const sorted = [...list].sort((a, b) => {
          const sa = a.sequence ?? Number.POSITIVE_INFINITY;
          const sb = b.sequence ?? Number.POSITIVE_INFINITY;
          if (sa !== sb) return sa - sb;
          return a.name.localeCompare(b.name, "ar");
        });
        setAreaCustomers(sorted);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setInvoiceReady(true);
    } finally {
      setLoading(false);
    }
  }, [customerId, token]);

  useEffect(() => {
    fetchAreas();
    fetchCustomer();
  }, [fetchCustomer]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

  // ====== NEW: place this customer within the area order ======
  const applyPlacement = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerData?.areaId?._id) {
      toast.error("لا يوجد منطقة لهذا الزبون");
      return;
    }
    const areaId = customerData.areaId._id;

    // Build a new order: remove this id, then insert at chosen spot
    const current = areaCustomers.map((c) => c._id);
    const mine = String(customerId);
    const without = current.filter((id) => id !== mine);

    let nextOrder: string[] = [];
    if (posTarget === "__START__") {
      nextOrder = [mine, ...without];
    } else if (posTarget === "__END__") {
      nextOrder = [...without, mine];
    } else {
      const idx = without.indexOf(posTarget);
      if (idx === -1) {
        // fallback to end if target not found
        nextOrder = [...without, mine];
      } else {
        nextOrder = [
          ...without.slice(0, idx + 1),
          mine,
          ...without.slice(idx + 1),
        ];
      }
    }

    setIsPlacing(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/areas/${areaId}/reorder?companyId=${companyId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderedCustomerIds: nextOrder,
            force: true,
            startAt: 1,
          }),
        }
      );

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        toast.error(data?.error || "تعذر تحديث الترتيب");
        return;
      }

      toast.success("تم تحديث ترتيب الزبائن في هذه المنطقة");
      // refresh local list & customer info
      await fetchCustomer();
    } catch (err: any) {
      toast.error(err?.message || "خطأ في الشبكة");
    } finally {
      setIsPlacing(false);
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

      {/* --- Quick placement in area order (admin convenience) --- */}
      {/* Reusable sequence placement (apply-now mode) */}
      {customerData?.areaId?._id && (
        <AreaSequencePicker
          token={token}
          companyId={companyId}
          areaId={customerData.areaId._id}
          currentCustomerId={customerId}
          mode="apply"
          title="تغيير الترتيب داخل المنطقة"
          onApplied={fetchCustomer}
        />
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
