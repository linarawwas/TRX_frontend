// src/pages/Customers/UpdateCustomer.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
  useMemo,
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
import { OpeningEditor } from "./OpeningEditor";

type Area = { _id: string; name: string };

// ——— helpers ———
const API_BASE = "http://localhost:5000";
const t = (s: any) => (typeof s === "string" ? s.trim() : "");
const initials = (name?: string) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "??";

export default function UpdateCustomer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customerId } = useParams();

  // auth/role
  const token = useSelector((s: any) => s.user.token);
  const companyId = useSelector((s: any) => s.user.companyId);
  const isAdmin = useSelector((s: any) => s.user?.isAdmin);
  // at the top of UpdateCustomer component (with other state)
  const [openEdit, setOpenEdit] = React.useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [customerData, setCustomerData] = useState<any>(null);

  // ui state
  const [loading, setLoading] = useState(true);
  const [invoiceReady, setInvoiceReady] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [showRestoreOptions, setShowRestoreOptions] = useState(false);
  const [restoreSequence, setRestoreSequence] = useState<number | "">("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [editOpen, setEditOpen] = useState(false);
  const [tab, setTab] = useState<"info" | "invoices" | "area">("info");

  // shipment (for quick external order)
  const shipmentId = useSelector((s: any) => s.shipment?._id);

  // draft (only non-empty keys are sent)
  const [updatedInfo, setUpdatedInfo] = useState({
    _id: "",
    name: "",
    phone: "",
    address: "",
    areaId: "", // string id
    companyId, // kept for parity; not used in PATCH
    hasDiscount: false,
    valueAfterDiscount: 0,
    discountCurrency: "",
    noteAboutCustomer: "",
    sequence: "",
  });
  const [areaSequenceInfo, setAreaSequenceInfo] = useState<{
    loading: boolean;
    taken: number[];
    next: number;
  }>({ loading: false, taken: [], next: 1 });

  // ——— fetchers ———
  const fetchAreas = useCallback(() => {
    fetch(`${API_BASE}/api/areas/company`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setAreas)
      .catch((e) => console.error("Areas load failed:", e));
  }, [token]);

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch customer");
      const data = await res.json();
      setCustomerData(data);
      await fetchAndCacheCustomerInvoice(customerId!, token);
      setInvoiceReady(true);
    } catch (e) {
      console.error("Fetch error:", e);
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
  }, [fetchAreas, fetchCustomer]);

  const currentAreaId = customerData?.areaId?._id || "";
  const areaChanged =
    !!updatedInfo.areaId && updatedInfo.areaId !== currentAreaId;

  useEffect(() => {
    if (!areaChanged || !updatedInfo.areaId) {
      setAreaSequenceInfo({ loading: false, taken: [], next: 1 });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setAreaSequenceInfo((prev) => ({ ...prev, loading: true }));
        const res = await fetch(
          `${API_BASE}/api/customers/area/${updatedInfo.areaId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (cancelled) return;
        const taken = Array.isArray(data)
          ? data
              .map((c: any) =>
                typeof c.sequence === "number" ? c.sequence : null
              )
              .filter((n: number | null): n is number =>
                n != null && Number.isInteger(n) && n >= 1
              )
              .sort((a: number, b: number) => a - b)
          : [];
        const next = taken.length ? taken[taken.length - 1] + 1 : 1;
        setAreaSequenceInfo({ loading: false, taken, next });
      } catch (err) {
        if (cancelled) return;
        console.error("load area sequences error", err);
        setAreaSequenceInfo({ loading: false, taken: [], next: 1 });
        toast.error("تعذر تحميل الترتيب الحالي للمنطقة المختارة");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [areaChanged, updatedInfo.areaId, token]);

  // ——— handlers ———
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "phone" && !/^\d*$/.test(value))
      return toast.error("أدخل أرقام فقط");
    if (name === "sequence") {
      if (value === "" || /^\d*$/.test(value)) {
        setUpdatedInfo((prev) => ({ ...prev, sequence: value }));
      }
      return;
    }
    if (name === "areaId") {
      setUpdatedInfo((prev) => ({
        ...prev,
        areaId: value,
        sequence:
          value && customerData?.areaId?._id === value ? prev.sequence : "",
      }));
      return;
    }
    setUpdatedInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const changes: any = {};
    if (t(updatedInfo.name)) changes.name = t(updatedInfo.name);
    if (t(updatedInfo.phone)) changes.phone = t(updatedInfo.phone);
    if (t(updatedInfo.address)) changes.address = t(updatedInfo.address);
    if (areaChanged && !updatedInfo.sequence) {
      return toast.error("عيّن رقم الترتيب الجديد قبل الحفظ");
    }

    if (t(updatedInfo.areaId) && areaChanged)
      changes.areaId = t(updatedInfo.areaId);

    if (updatedInfo.sequence) {
      changes.sequence = Number(updatedInfo.sequence);
    }

    if (Object.keys(changes).length === 0)
      return toast.info("لا توجد تغييرات لإرسالها");

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
      setEditOpen(false);
      setUpdatedInfo((p) => ({
        ...p,
        name: "",
        phone: "",
        address: "",
        areaId: "",
        sequence: "",
      }));
      fetchCustomer();
    } catch (e: any) {
      toast.error(e?.message || "فشل التحديث");
    }
  };

  const handleRecordOrder = () => {
    if (!customerData?._id) return toast.error("بيانات الزبون غير متوفرة");
    if (!shipmentId) return toast.error("ابدأ الشحنة أولاً قبل تسجيل الطلب");
    dispatch(setCustomerId(customerData._id));
    dispatch(setCustomerName(customerData.name || ""));
    dispatch(setCustomerPhoneNb(customerData.phone || ""));
    navigate("/recordOrderforCustomer", { state: { isExternal: true } });
  };

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
    } catch (e: any) {
      toast.error(e?.message || "فشل العملية");
    } finally {
      setIsMutating(false);
    }
  };

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
    } catch (e: any) {
      toast.error(e?.message || "فشل العملية");
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
        if (res.status === 409)
          return toast.warn("هذا الرقم ما زال مستخدمًا. جرّب رقمًا مختلفًا.");
        throw new Error(data?.error || "تعذر تنشيط الزبون");
      }
      toast.success("تم تنشيط الزبون وتعيين الترتيب");
      setShowRestoreOptions(false);
      setRestoreSequence("");
      fetchCustomer();
    } catch (e: any) {
      toast.error(e?.message || "فشل العملية");
    } finally {
      setIsMutating(false);
    }
  };

  // hard delete (modal two-step)
  const openDeleteModal = () => {
    if (!isAdmin) return toast.warn("هذه العملية للمشرف فقط");
    setDeleteStep(1);
    setShowDeleteModal(true);
  };
  const closeDeleteModal = () => setShowDeleteModal(false);

  const performHardDelete = async () => {
    setIsMutating(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers/${customerId}/hard`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409)
          toast.error(data?.error || "لا يمكن الحذف: لدى الزبون طلبات مرتبطة.");
        else toast.error(data?.error || "فشل حذف الزبون");
        return;
      }
      toast.success("تم حذف الزبون نهائيًا");
      setShowDeleteModal(false);
      setTimeout(() => navigate(-1), 300);
    } catch (e: any) {
      toast.error(e?.message || "فشل العملية");
    } finally {
      setIsMutating(false);
    }
  };

  const avatarText = useMemo(
    () => initials(customerData?.name),
    [customerData?.name]
  );

  return (
    <div className="ucx" dir="rtl">
      <ToastContainer position="top-right" autoClose={1000} />
      <div className="ucx__container">
        {/* Hero */}
        <header className="ucx-hero">
          <div className="ucx-hero__left">
            <div className="ucx-avatar" aria-hidden="true">
              {avatarText}
            </div>
            <div className="ucx-hero__text">
              <h1 className="ucx-title">{customerData?.name || "الزبون"}</h1>
              <div className="ucx-sub">
                {customerData?.phone ? `📞 ${customerData.phone}` : "—"}
                {customerData?.address ? ` · 📍 ${customerData.address}` : ""}
              </div>
            </div>
          </div>

          {customerData && (
            <div className="ucx-hero__right">
              <span
                className={`ucx-chip ${customerData.isActive ? "ok" : "off"}`}
              >
                {customerData.isActive ? "نشط" : "غير نشط"}
              </span>
              {customerData.isActive ? (
                <button
                  className="ucx-btn danger sm"
                  onClick={handleDeactivate}
                  disabled={isMutating}
                >
                  إيقاف
                </button>
              ) : (
                <div className="ucx-restoreBar">
                  <button
                    className="ucx-btn primary sm"
                    onClick={handleRestoreAuto}
                    disabled={isMutating}
                  >
                    تنشيط
                  </button>
                  {showRestoreOptions && (
                    <form
                      className="ucx-restoreInline"
                      onSubmit={handleRestoreWithSequence}
                    >
                      <label className="ucx-restoreLabel">الترتيب:</label>
                      <input
                        className="ucx-input sm"
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
                        className="ucx-btn secondary sm"
                        type="submit"
                        disabled={isMutating}
                      >
                        حفظ
                      </button>
                    </form>
                  )}
                </div>
              )}
              <button
                className={`ucx-btn ${isAdmin ? "hard sm" : "hardDisabled sm"}`}
                onClick={openDeleteModal}
                disabled={!isAdmin || isMutating}
                title={isAdmin ? "حذف نهائي" : "للمشرف فقط"}
              >
                حذف نهائي
              </button>
            </div>
          )}
        </header>

        {/* Actions row - horizontal */}
        <div className="ucx-actionsRow">
          {customerData?.isActive && !isAdmin && (
            <button className="ucx-btn success" onClick={handleRecordOrder}>
              تسجيل طلب خارجي
            </button>
          )}
          <button
            className="ucx-btn primary outline"
            onClick={() => navigate(`/customers/${customerId}/statement`)}
          >
            كشف الحساب / إضافة دفعة
          </button>
          <button
            className="ucx-btn secondary"
            onClick={() => setEditOpen((v) => !v)}
            aria-expanded={editOpen}
          >
            {editOpen ? "إخفاء التعديل" : "تعديل معلومات الزبون"}
          </button>
        </div>

        {/* Edit form (compact, neat) */}
        {editOpen && (
          <form className="ucx-formCard" onSubmit={handleSubmit}>
            <h3 className="ucx-formCard__title">تعديل بيانات الزبون</h3>

            <div className="ucx-fields">
              <div className="ucx-field">
                <label htmlFor="ucx-name" className="ucx-label">
                  الاسم
                </label>
                <input
                  id="ucx-name"
                  className="ucx-input"
                  type="text"
                  name="name"
                  value={updatedInfo.name}
                  placeholder={customerData?.name || "الاسم الجديد"}
                  onChange={handleChange}
                />
              </div>

              <div className="ucx-field">
                <label htmlFor="ucx-phone" className="ucx-label">
                  الهاتف
                </label>
                <input
                  id="ucx-phone"
                  className="ucx-input"
                  type="text"
                  name="phone"
                  value={updatedInfo.phone}
                  placeholder={customerData?.phone || "رقم الهاتف الجديد"}
                  onChange={handleChange}
                />
              </div>

              <div className="ucx-field ucx-field--full">
                <label htmlFor="ucx-address" className="ucx-label">
                  العنوان
                </label>
                <input
                  id="ucx-address"
                  className="ucx-input"
                  type="text"
                  name="address"
                  value={updatedInfo.address}
                  placeholder={customerData?.address || "العنوان الجديد"}
                  onChange={handleChange}
                />
              </div>

              {/* ✅ Native select to guarantee area names show */}
              <div className="ucx-field ucx-field--full">
                <label htmlFor="ucx-area" className="ucx-label">
                  المنطقة
                </label>
                <select
                  id="ucx-area"
                  name="areaId"
                  className="ucx-select"
                  value={updatedInfo.areaId || ""}
                  onChange={handleChange}
                >
                  <option value="">اختر المنطقة…</option>
                  {areas.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {(areaChanged || customerData?.sequence) && (
                <div className="ucx-field ucx-field--full">
                  <label htmlFor="ucx-sequence" className="ucx-label">
                    الترتيب داخل المنطقة
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <input
                      id="ucx-sequence"
                      className="ucx-input"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      name="sequence"
                      value={updatedInfo.sequence}
                      placeholder={
                        areaChanged
                          ? areaSequenceInfo.loading
                            ? "جارٍ التحميل…"
                            : `مثال: ${areaSequenceInfo.next}`
                          : customerData?.sequence
                          ? String(customerData.sequence)
                          : "أدخل الرقم"
                      }
                      onChange={handleChange}
                    />
                    {areaChanged && (
                      <button
                        type="button"
                        className="ucx-btn secondary sm"
                        onClick={() =>
                          setUpdatedInfo((prev) => ({
                            ...prev,
                            sequence: String(areaSequenceInfo.next || 1),
                          }))
                        }
                        disabled={areaSequenceInfo.loading}
                      >
                        استخدام {areaSequenceInfo.next}
                      </button>
                    )}
                  </div>
                  {areaChanged ? (
                    <small className="ucx-hint">
                      {areaSequenceInfo.loading
                        ? "جارٍ تحميل مواقع الزبائن في المنطقة الجديدة…"
                        : areaSequenceInfo.taken.length
                        ? `الأرقام المستخدمة حاليًا: ${areaSequenceInfo.taken
                            .slice(0, 12)
                            .join(", ")}${
                            areaSequenceInfo.taken.length > 12 ? " …" : ""
                          }. الرقم التالي المتاح: ${areaSequenceInfo.next}`
                        : "لا يوجد زبائن نشطون في هذه المنطقة. أي رقم يبدأ من 1 متاح."}
                    </small>
                  ) : customerData?.sequence ? (
                    <small className="ucx-hint">
                      الترتيب الحالي: #{customerData.sequence}
                    </small>
                  ) : null}
                </div>
              )}
            </div>

            <div className="ucx-formCard__actions">
              {/* compact button (not full width) */}
              <button className="ucx-btn primary ucx-btn--sm" type="submit">
                حفظ التعديلات
              </button>
            </div>
          </form>
        )}

        {/* Tabs to reduce scroll */}
        <div className="ucx-tabs">
          <button
            className={`ucx-tab ${tab === "info" ? "is-active" : ""}`}
            onClick={() => setTab("info")}
          >
            البيانات
          </button>
          <button
            className={`ucx-tab ${tab === "invoices" ? "is-active" : ""}`}
            onClick={() => setTab("invoices")}
          >
            الرصيد{" "}
          </button>
          <button
            className={`ucx-tab ${tab === "area" ? "is-active" : ""}`}
            onClick={() => setTab("area")}
          >
            الترتيب
          </button>
        </div>

        <main className="ucx-grid">
          {tab === "info" && (
            <section className="ucx-card">
              <div className="ucx-card__header">البيانات</div>
              <div className="ucx-card__body">
                <CustomerInfo customerData={customerData} loading={loading} />
                {customerData && (
                  <AssignDistributorInline
                    customerId={customerId!}
                    currentDistributorId={customerData?.distributorId || null}
                  />
                )}
              </div>
            </section>
          )}
          {tab === "invoices" && (
            <section className="ucx-card">
              <div
                className="ucx-card__header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
<span>الرصيد الحالي</span>
{isAdmin && (
  <button
    type="button"
    className="ucx-btn danger"
    onClick={() => setOpenEdit((v: boolean) => !v)}
    title="هذه الأداة مخصّصة لتصحيح فروقات صغيرة فقط: فرق القناني المسموح به لا يتجاوز ±2. يمكن تعديل الرصيد الافتتاحي لأي قيمة."
  >
    ✎ تعديل (إداري)
  </button>
)}

              </div>

              {/* Admin opening editor (collapsible) */}
              {isAdmin && openEdit && (
                <OpeningEditor
                  customerId={customerId!}
                  token={token}
                  onDone={async () => {
                    // refresh invoice cache then re-render
                    try {
                      await fetchAndCacheCustomerInvoice(customerId!, token);
                    } catch {}
                    toast.success("تم الحفظ وتحديث الأرقام");
                    setOpenEdit(false);
                  }}
                />
              )}

              <div className="ucx-card__body">
                {customerData && invoiceReady ? (
                  <CustomerInvoices customerId={customerId!} />
                ) : (
                  <div className="ucx-skeleton">جارٍ التحميل…</div>
                )}
              </div>
            </section>
          )}
          {tab === "area" && customerData?.areaId?._id && (
            <section className="ucx-card">
              <div className="ucx-card__header">الترتيب في المنطقة</div>
              <div className="ucx-card__body">
                <AreaSequencePicker
                  token={token}
                  companyId={companyId}
                  areaId={customerData.areaId._id}
                  currentCustomerId={customerId}
                  mode="apply"
                  title="تغيير الترتيب داخل المنطقة"
                  onChange={() => {}} // No-op for apply mode
                  onApplied={fetchCustomer}
                />
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div
          className="ucx-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delTitle"
        >
          <div className="ucx-modal__panel">
            <div className="ucx-modal__header">
              <h3 id="delTitle">حذف نهائي للزبون</h3>
              <button
                className="ucx-iconBtn"
                onClick={closeDeleteModal}
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>

            {deleteStep === 1 && (
              <div className="ucx-modal__body">
                <p>
                  هذا الإجراء <strong>لا يمكن التراجع عنه</strong>. سيتم حذف
                  الزبون نهائيًا من النظام.
                </p>
                <div className="ucx-modal__actions">
                  <button
                    className="ucx-btn secondary"
                    onClick={closeDeleteModal}
                  >
                    إلغاء
                  </button>
                  <button
                    className="ucx-btn danger"
                    onClick={() => setDeleteStep(2)}
                  >
                    متابعة
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 2 && (
              <div className="ucx-modal__body">
                <p className="ucx-dangerText">
                  تأكيد أخير: قد يكون لدى الزبون <strong>طلبات مرتبطة</strong>.
                  إن وُجدت سيُرفض الحذف.
                </p>
                <div className="ucx-modal__actions">
                  <button
                    className="ucx-btn secondary"
                    onClick={closeDeleteModal}
                  >
                    إلغاء
                  </button>
                  <button
                    className="ucx-btn hard"
                    onClick={performHardDelete}
                    disabled={isMutating}
                  >
                    {isMutating ? "جارٍ الحذف..." : "حذف نهائي"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
