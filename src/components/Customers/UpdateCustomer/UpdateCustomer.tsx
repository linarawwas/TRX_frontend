import React, {
  FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import "./UpdateCustomer.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomerInvoices from "../CustomerInvoices/CustomerInvoices";
import CustomerInfo from "../CustomerInfo/CustomerInfo";
import { fetchAndCacheCustomerInvoice } from "../../../utils/apiHelpers";
import AreaSequencePicker from "../../AreaSequencePicker/AreaSequencePicker";
import AssignDistributorInline from "../../Distributors/AssignDistributorInline";
import { OpeningEditor } from "./OpeningEditor";
import { useUpdateCustomerController } from "./useUpdateCustomerController";

export default function UpdateCustomer() {
  const navigate = useNavigate();
  const {
    areas,
    avatarText,
    companyId,
    confirmOpen,
    customerData,
    customerId,
    deleteStep,
    editOpen,
    fetchCustomer,
    handleChange,
    handleDeactivate,
    handleRecordOrder,
    handleRestoreAuto,
    handleRestoreWithSequence,
    handleSubmit,
    invoiceReady,
    isAdmin,
    isMutating,
    loading,
    openDeleteModal,
    openEdit,
    pendingChanges,
    performHardDelete,
    placementLoading,
    placementOptions,
    restoreSequence,
    setConfirmOpen,
    setDeleteStep,
    setEditOpen,
    setOpenEdit,
    setPendingChanges,
    setRestoreSequence,
    showDeleteModal,
    showRestoreOptions,
    submitUpdate,
    tab,
    targetAreaId,
    token,
    updatedInfo,
    setTab,
    closeDeleteModal,
  } = useUpdateCustomerController();

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

              <div className="ucx-field ucx-field--full">
                <label htmlFor="ucx-placement" className="ucx-label">
                  الموضع داخل المنطقة
                </label>
                <select
                  id="ucx-placement"
                  name="placement"
                  className="ucx-select"
                  value={updatedInfo.placement}
                  onChange={handleChange}
                  disabled={placementLoading || !targetAreaId}
                >
                  <option value="">
                    {targetAreaId
                      ? "(احتفظ بالموضع الحالي)"
                      : "اختر منطقة أولاً"}
                  </option>
                  {placementOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <small className="ucx-hint">
                  {placementLoading
                    ? "جارٍ تحميل مواقع الزبائن…"
                    : "يمكنك تحديد موقع الزبون بالنسبة لباقي زبائن المنطقة."}
                </small>
              </div>

              {customerData?.sequence != null && (
                <div className="ucx-field ucx-field--full">
                  <label className="ucx-label">الترتيب الحالي</label>
                  <div className="ucx-readonly">#{customerData.sequence}</div>
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
                    customerId={customerId}
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
                  customerId={customerId || ""}
                  token={token || ""}
                  onDone={async () => {
                    // refresh invoice cache then re-render
                    try {
                      await fetchAndCacheCustomerInvoice(customerId || "", token || "");
                    } catch {}
                    toast.success("تم الحفظ وتحديث الأرقام");
                    setOpenEdit(false);
                  }}
                />
              )}

              <div className="ucx-card__body">
                {customerData && invoiceReady ? (
                  <CustomerInvoices customerId={customerId || ""} />
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
                  token={token || ""}
                  companyId={companyId}
                  areaId={customerData.areaId._id}
                  currentCustomerId={customerId || ""}
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

      {confirmOpen && pendingChanges && (
        <div className="ucx-modal" role="dialog" aria-modal="true">
          <div className="ucx-modal__panel">
            <div className="ucx-modal__header">
              <h3>تأكيد تحديث الزبون</h3>
              <button
                className="ucx-iconBtn"
                onClick={() => {
                  if (!isMutating) {
                    setConfirmOpen(false);
                    setPendingChanges(null);
                  }
                }}
                aria-label="إغلاق"
                disabled={isMutating}
              >
                ✕
              </button>
            </div>
            <div className="ucx-modal__body">
              <p className="ucx-hint">راجع التعديلات التالية قبل حفظها:</p>
              <ul className="ucx-summary">
                {pendingChanges.name && (
                  <li>
                    <strong>الاسم:</strong> {pendingChanges.name}
                  </li>
                )}
                {pendingChanges.phone && (
                  <li>
                    <strong>الهاتف:</strong> {pendingChanges.phone}
                  </li>
                )}
                {pendingChanges.address && (
                  <li>
                    <strong>العنوان:</strong> {pendingChanges.address}
                  </li>
                )}
                {pendingChanges.areaId && (
                  <li>
                    <strong>المنطقة الجديدة:</strong>{" "}
                    {areas.find((a) => a._id === pendingChanges.areaId)?.name ||
                      pendingChanges.areaId}
                  </li>
                )}
                {pendingChanges.placement && (
                  <li>
                    <strong>الموضع داخل المنطقة:</strong>{" "}
                    {
                      placementOptions.find(
                        (opt) => String(opt.value) === String(pendingChanges.placement)
                      )?.label
                    }
                  </li>
                )}
              </ul>
            </div>
            <div className="ucx-modal__actions">
              <button
                className="ucx-btn secondary"
                onClick={() => {
                  if (!isMutating) {
                    setConfirmOpen(false);
                    setPendingChanges(null);
                  }
                }}
                disabled={isMutating}
              >
                تعديل
              </button>
              <button
                className="ucx-btn primary"
                onClick={submitUpdate}
                disabled={isMutating}
              >
                {isMutating ? "جارٍ الحفظ…" : "تأكيد الحفظ"}
              </button>
            </div>
          </div>
        </div>
      )}

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
