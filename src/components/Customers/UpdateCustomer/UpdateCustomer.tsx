// src/Pages/Customers/UpdateCustomer.tsx
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
import CustomerInfo from "../CustomerInfo/CustomerInfo";
import {
  setCustomerId,
  setCustomerName,
  setCustomerPhoneNb,
} from "../../../redux/Order/action";
import { fetchAndCacheCustomerInvoice } from "../../../utils/apiHelpers";
import AreaSequencePicker from "../../AreaSequencePicker/AreaSequencePicker";
import AssignDistributorInline from "../../Distributors/AssignDistributorInline";

type Area = { _id: string; name: string };

// ────────────────────────── Local helpers ──────────────────────────
const API_BASE = "http://localhost:5000"; // TODO: move to env

// Trim only strings
const t = (s: any) => (typeof s === "string" ? s.trim() : "");

// Format date in Beirut for any future additions (kept for parity with other pages)
function yyyyMmDdInBeirut(dateLike?: string | number | Date) {
  const d = dateLike ? new Date(dateLike) : new Date();
  const y = d.toLocaleString("en-CA", {
    timeZone: "Asia/Beirut",
    year: "numeric",
  });
  const m = d.toLocaleString("en-CA", {
    timeZone: "Asia/Beirut",
    month: "2-digit",
  });
  const day = d.toLocaleString("en-CA", {
    timeZone: "Asia/Beirut",
    day: "2-digit",
  });
  return `${y}-${m}-${day}`;
}

function UpdateCustomer() {
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.user.token);
  const companyId = useSelector((state: any) => state.user.companyId);
  const isAdmin = useSelector((state: any) => state.user.isAdmin);
  const navigate = useNavigate();
  const { customerId } = useParams();

  // Remote resources
  const [areas, setAreas] = useState<Area[]>([]);
  const [customerData, setCustomerData] = useState<any>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [invoiceReady, setInvoiceReady] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [showRestoreOptions, setShowRestoreOptions] = useState(false);
  const [restoreSequence, setRestoreSequence] = useState<number | "">("");

  // Shipment state for the external order-quick-action
  const shipmentId = useSelector((state: any) => state.shipment?._id);

  // Local draft for PATCH; empty values mean "don't send"
  const [updatedInfo, setUpdatedInfo] = useState({
    _id: "",
    name: "",
    phone: "",
    address: "",
    areaId: "", // string id
    companyId, // unused in PATCH, but harmless in draft
    hasDiscount: false, // kept for parity if you expose later
    valueAfterDiscount: 0, // ^
    discountCurrency: "", // ^
    noteAboutCustomer: "", // ^
  });

  // ────────────────────────── Data fetching ──────────────────────────

  // areas used by the select
  const fetchAreas = useCallback(() => {
    fetch(`${API_BASE}/api/areas/company`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAreas)
      .catch((err) => console.error("Fetching areas failed:", err));
  }, [token]);

  // customer + invoice + area peers (for pickers)
  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch customer");
      const data = await res.json();
      setCustomerData(data);

      // Prime invoice cache for downstream views
      await fetchAndCacheCustomerInvoice(customerId!, token);
      setInvoiceReady(true);
    } catch (err) {
      console.error("Fetch error:", err);
      setInvoiceReady(true);
    } finally {
      setLoading(false);
    }
  }, [customerId, token]);

  useEffect(() => {
    if (customerId) dispatch(setCustomerId(customerId));
  }, [customerId, dispatch]);

  useEffect(() => {
    fetchAreas();
    fetchCustomer();
  }, [fetchCustomer, fetchAreas]);

  // ────────────────────────── Handlers ──────────────────────────

  // Controlled inputs: only update the draft; empty string means "ignore"
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "phone" && !/^\d*$/.test(value)) {
      toast.error("أدخل أرقام فقط");
      return;
    }
    setUpdatedInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Build minimal PATCH body from non-empty draft fields
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const changes: any = {};
    if (t(updatedInfo.name)) changes.name = t(updatedInfo.name);
    if (t(updatedInfo.phone)) changes.phone = t(updatedInfo.phone);
    if (t(updatedInfo.address)) changes.address = t(updatedInfo.address);
    if (t(updatedInfo.areaId)) changes.areaId = t(updatedInfo.areaId);

    if (Object.keys(changes).length === 0) {
      toast.info("لا توجد تغييرات لإرسالها");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/customers/${customerId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changes),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "فشل التحديث");
      }

      toast.success("تم التحديث بنجاح");
      setFormVisible(false);
      setUpdatedInfo((prev) => ({
        ...prev,
        name: "",
        phone: "",
        address: "",
        areaId: "",
      }));
      fetchCustomer();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "فشل التحديث");
    }
  };

  // Quick external order CTA (requires active shipment)
  const handleRecordOrder = () => {
    if (!customerData?._id) return toast.error("بيانات الزبون غير متوفرة");
    if (!shipmentId) return toast.error("ابدأ الشحنة أولاً قبل تسجيل الطلب");

    dispatch(setCustomerId(customerData._id));
    dispatch(setCustomerName(customerData.name || ""));
    dispatch(setCustomerPhoneNb(customerData.phone || ""));
    navigate("/recordOrderforCustomer", { state: { isExternal: true } });
  };

  // Admin-only HARD delete (two confirms)
  const handleHardDelete = async () => {
    if (!customerId) return;
    if (!isAdmin) return toast.warn("هذه العملية للمشرف فقط");

    const c1 = window.confirm(
      "تحذير: هذا سيحذف الزبون نهائيًا ولا يمكن التراجع. هل أنت متأكد/ة؟"
    );
    if (!c1) return;

    const c2 = window.confirm(
      "تأكيد أخير: سيتم حذف الزبون نهائيًا. هل تريد/ين المتابعة؟"
    );
    if (!c2) return;

    setIsMutating(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers/${customerId}/hard`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          toast.error(
            data?.error ||
              "لا يمكن الحذف: لدى الزبون طلبات مرتبطة. يمكنك إيقافه بدلًا من ذلك."
          );
          return;
        }
        throw new Error(data?.error || "فشل حذف الزبون");
      }
      toast.success("تم حذف الزبون نهائيًا");
      setTimeout(() => navigate(-1), 400);
    } catch (err: any) {
      toast.error(err?.message || "فشل العملية");
    } finally {
      setIsMutating(false);
    }
  };

  // Soft deactivate
  const handleDeactivate = async () => {
    if (!customerId) return;
    if (!window.confirm("هل تريد إيقاف هذا الزبون؟")) return;

    setIsMutating(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/customers/${customerId}/deactivate`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "تعذر إيقاف الزبون");
      toast.success("تم إيقاف الزبون");
      setShowRestoreOptions(false);
      setRestoreSequence("");
      fetchCustomer();
    } catch (err: any) {
      toast.error(err?.message || "فشل العملية");
    } finally {
      setIsMutating(false);
    }
  };

  // Restore helpers
  const restoreRequest = async (body: any) => {
    const res = await fetch(`${API_BASE}/api/customers/${customerId}/restore`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body || {}),
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  };

  const handleRestoreAuto = async () => {
    if (!customerId) return;
    setIsMutating(true);
    try {
      const areaId = customerData?.areaId?._id;
      const { res, data } = await restoreRequest({ areaId });
      if (res.ok) {
        toast.success("تم تنشيط الزبون");
        setShowRestoreOptions(false);
        setRestoreSequence("");
        fetchCustomer();
        return;
      }
      if (res.status === 409) {
        toast.warn("رقم الترتيب مستخدم. اختر رقمًا آخر.");
        setShowRestoreOptions(true);
        return;
      }
      throw new Error(data?.error || "تعذر تنشيط الزبون");
    } catch (err: any) {
      toast.error(err?.message || "فشل العملية");
    } finally {
      setIsMutating(false);
    }
  };

  const handleRestoreWithSequence = async (e: FormEvent) => {
    e.preventDefault();
    if (restoreSequence === "" || Number(restoreSequence) <= 0) {
      toast.error("أدخل رقم ترتيب صحيح (1 أو أكبر)");
      return;
    }
    setIsMutating(true);
    try {
      const areaId = customerData?.areaId?._id;
      const { res, data } = await restoreRequest({
        areaId,
        sequence: Number(restoreSequence),
      });
      if (!res.ok) {
        if (res.status === 409) {
          toast.warn("هذا الرقم ما زال مستخدمًا. جرّب رقمًا مختلفًا.");
          return;
        }
        throw new Error(data?.error || "تعذر تنشيط الزبون");
      }
      toast.success("تم تنشيط الزبون وتعيين الترتيب");
      setShowRestoreOptions(false);
      setRestoreSequence("");
      fetchCustomer();
    } catch (err: any) {
      toast.error(err?.message || "فشل العملية");
    } finally {
      setIsMutating(false);
    }
  };

  // ────────────────────────── Render ──────────────────────────
  return (
    <div className="uc" dir="rtl">
      <ToastContainer position="top-right" autoClose={1000} />

      <header className="uc__header">
        <h1 className="uc__title">معلومات الزبون</h1>
      </header>

      {/* Status + actions */}
      {customerData && (
        <div className="uc__actions">
          <span
            className={`uc-status ${
              customerData.isActive ? "uc-status--ok" : "uc-status--off"
            }`}
          >
            {customerData.isActive ? "نشط" : "غير نشط"}
          </span>

          {customerData.isActive ? (
            <button
              className="uc-btn uc-btn--danger"
              onClick={handleDeactivate}
              disabled={isMutating}
            >
              {isMutating ? "جارٍ الإيقاف..." : "إيقاف الزبون"}
            </button>
          ) : (
            <div className="uc-restore">
              <button
                className="uc-btn uc-btn--primary"
                onClick={handleRestoreAuto}
                disabled={isMutating}
              >
                {isMutating ? "جارٍ التنشيط..." : "تنشيط الزبون"}
              </button>

              {showRestoreOptions && (
                <form
                  className="uc-restore__inline"
                  onSubmit={handleRestoreWithSequence}
                >
                  <label className="uc-restore__label">رقم الترتيب:</label>
                  <input
                    className="uc-restore__input"
                    type="number"
                    min={1}
                    value={restoreSequence}
                    onChange={(e) =>
                      setRestoreSequence(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="مثال: 25"
                  />
                  <button
                    className="uc-btn uc-btn--secondary"
                    type="submit"
                    disabled={isMutating}
                  >
                    حفظ الرقم وتنشيط
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Admin-only hard delete (visible; disabled for non-admin) */}
          <button
            type="button"
            className={`uc-btn ${
              isAdmin ? "uc-btn--hard" : "uc-btn--hard-disabled"
            }`}
            onClick={handleHardDelete}
            disabled={!isAdmin || isMutating}
            aria-disabled={!isAdmin || isMutating}
            title={isAdmin ? "حذف نهائي للزبون" : "هذه العملية للمشرف فقط"}
          >
            {isMutating ? "جارٍ الحذف..." : "حذف نهائي"}
          </button>
        </div>
      )}

      <CustomerInfo customerData={customerData} loading={loading} />

      {customerData && (
        <AssignDistributorInline
          customerId={customerId!}
          currentDistributorId={customerData?.distributorId || null}
        />
      )}

      {customerData && invoiceReady && (
        <>
          <CustomerInvoices customerId={customerId!} />

          <div className="uc-statement">
            <button
              className="uc-btn uc-btn--primary"
              onClick={() => navigate(`/customers/${customerId}/statement`)}
            >
              الذهاب إلى كشف الحساب أو إضافة دفعة
            </button>
          </div>

          {customerData.isActive && (
            <div className="uc-record">
              <button
                className="uc-btn uc-btn--success"
                onClick={handleRecordOrder}
              >
                تسجيل طلب خارجي لهذا الزبون
              </button>
              {!shipmentId && (
                <div className="uc-record__hint">
                  ابدأ الشحنة أولاً من شاشة "بدء الشحنة".
                </div>
              )}
            </div>
          )}
        </>
      )}

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
        className="uc-editToggle"
        onClick={() => setFormVisible(!formVisible)}
      >
        تعديل الزبون؟
      </div>

      {formVisible && (
        <form className="uc-form" onSubmit={handleSubmit}>
          <input
            className="uc-form__input"
            type="text"
            name="name"
            value={updatedInfo.name}
            placeholder="الاسم الجديد"
            onChange={handleChange}
          />
          <input
            className="uc-form__input"
            type="text"
            name="phone"
            value={updatedInfo.phone}
            placeholder="رقم الهاتف الجديد"
            onChange={handleChange}
          />
          <input
            className="uc-form__input"
            type="text"
            name="address"
            value={updatedInfo.address}
            placeholder="العنوان الجديد"
            onChange={handleChange}
          />
          <SelectInput
            label="المنطقة:"
            name="areaId"
            value={updatedInfo.areaId || ""}
            options={areas.map((area) => ({
              value: area._id,
              label: area.name,
            }))}
            onChange={handleChange}
          />
          <button
            className="uc-btn uc-btn--secondary uc-form__submit"
            type="submit"
          >
            تحديث الزبون
          </button>
        </form>
      )}
    </div>
  );
}

export default UpdateCustomer;
