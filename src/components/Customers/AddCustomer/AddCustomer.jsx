import React, { useState, useEffect } from "react";
import "./AddCustomer.css";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddCustomer = () => {
  const token = useSelector((state) => state.user.token);
  const companyId = useSelector((state) => state.user.companyId);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    areaId: "",
    address: "",
  });

  const [areas, setAreas] = useState([]);
  const [areaCustomers, setAreaCustomers] = useState([]); // for placement "after"
  const [placement, setPlacement] = useState("__END__"); // "__START__" | "__END__" | <customerId>
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingAreaCustomers, setLoadingAreaCustomers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- Load areas for this company
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setLoadingAreas(true);
        const res = await fetch(
          "http://localhost:5000/api/areas/company",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch areas");
        const data = await res.json();
        setAreas(data || []);
      } catch (err) {
        toast.error("تعذّر جلب المناطق");
      } finally {
        setLoadingAreas(false);
      }
    };
    if (companyId && token) fetchAreas();
  }, [companyId, token]);

  // --- Load customers of selected area (to offer "after X" placement)
  useEffect(() => {
    const fetchAreaCustomers = async () => {
      if (!formData.areaId) {
        setAreaCustomers([]);
        return;
      }
      try {
        setLoadingAreaCustomers(true);
        const res = await fetch(
          `http://localhost:5000/api/customers/area/${formData.areaId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch customers for area");
        const list = await res.json();

        // Sort by sequence (nulls last) then name — mirrors driver view
        const sorted = [...(list || [])].sort((a, b) => {
          const sa = a.sequence ?? Number.POSITIVE_INFINITY;
          const sb = b.sequence ?? Number.POSITIVE_INFINITY;
          if (sa !== sb) return sa - sb;
          return (a.name || "").localeCompare(b.name || "", "ar");
        });
        setAreaCustomers(sorted);
      } catch (err) {
        toast.error("تعذّر جلب زبائن المنطقة");
      } finally {
        setLoadingAreaCustomers(false);
      }
    };
    setPlacement("__END__"); // reset placement when area changes
    fetchAreaCustomers();
  }, [formData.areaId, token]);

  const handleAreaChange = (e) => {
    setFormData((prev) => ({ ...prev, areaId: e.target.value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Basic phone sanitization (digits only)
    if (name === "phone") {
      if (!/^\d*$/.test(value)) {
        toast.error("أدخل أرقام فقط في خانة الهاتف");
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const name = formData.name.trim();
    if (!name) return toast.error("الاسم مطلوب");
    if (!formData.areaId) return toast.error("الرجاء اختيار المنطقة");

    try {
      setSubmitting(true);
      const res = await fetch(
        "http://localhost:5000/api/customers/create-with-sequence",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            phone: formData.phone || "",
            address: formData.address || "",
            areaId: formData.areaId,
            placement, // "__START__" | "__END__" | <customerId>
            startAt: 1, // optional (server defaults to 1)
          }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "فشل إنشاء الزبون");
        return;
      }

      toast.success("✅ تم إنشاء الزبون وتحديد ترتيبه");
      // Reset form to speed up next entry
      setFormData({
        name: "",
        phone: "",
        areaId: formData.areaId,
        address: "",
      });
      setPlacement("__END__");
      // Refresh area customers so the picker reflects the new insert
      // (optional; comment out if not needed)
      try {
        const ref = await fetch(
          `http://localhost:5000/api/customers/area/${formData.areaId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const refList = await ref.json();
        const sorted = [...(refList || [])].sort((a, b) => {
          const sa = a.sequence ?? Number.POSITIVE_INFINITY;
          const sb = b.sequence ?? Number.POSITIVE_INFINITY;
          if (sa !== sb) return sa - sb;
          return (a.name || "").localeCompare(b.name || "", "ar");
        });
        setAreaCustomers(sorted);
      } catch {
        /* ignore */
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-customer-container" dir="rtl">
      <h2>إضافة زبون</h2>
      <ToastContainer position="top-right" autoClose={2000} />

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="customer-input-label">
            الاسم:
          </label>
          <input
            type="text"
            className="customer-text-input"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="customer-input-label">
            الهاتف:
          </label>
          <input
            type="text"
            className="customer-text-input"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>

        <div className="form-group">
          <label htmlFor="areaId" className="customer-input-label">
            المنطقة:
          </label>
          <select
            id="areaId"
            name="areaId"
            value={formData.areaId}
            onChange={handleAreaChange}
            required
            disabled={loadingAreas}
          >
            <option value="">
              {loadingAreas ? "جارٍ التحميل…" : "اختر منطقة"}
            </option>
            {areas.map((area) => (
              <option key={area._id} value={area._id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="customer-input-label" htmlFor="address">
            العنوان:
          </label>
          <input
            type="text"
            className="customer-text-input"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        {/* ---- Placement in area sequence ---- */}
        <div className="form-group">
          <label className="customer-input-label" htmlFor="placement">
            ترتيب في المنطقة:
          </label>
          <select
            id="placement"
            name="placement"
            value={placement}
            onChange={(e) => setPlacement(e.target.value)}
            disabled={!formData.areaId || loadingAreaCustomers}
          >
            <option value="__START__">في بداية القائمة</option>
            <option value="__END__">في نهاية القائمة</option>
            {formData.areaId && (
              <optgroup
                label={
                  loadingAreaCustomers ? "جارٍ تحميل الزبائن…" : "ضعه بعد:"
                }
              >
                {areaCustomers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.sequence ? `#${c.sequence} — ` : ""}
                    {c.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <button
          type="submit"
          className="add-customer-button"
          disabled={submitting || !formData.areaId || !formData.name.trim()}
        >
          {submitting ? "جارٍ الإضافة…" : "إضافة الزبون"}
        </button>
      </form>
    </div>
  );
};

export default AddCustomer;
