import React from "react";
import { useNavigate } from "react-router-dom";
import "./UpdateCustomer.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomerInfo from "../CustomerInfo/CustomerInfo";
import { fetchAndCacheCustomerInvoice } from "../../../features/customers/apiCustomers";
import AreaSequencePicker from "../../AreaSequencePicker/AreaSequencePicker";
import AssignDistributorInline from "../../Distributors/AssignDistributorInline";
import UpdateCustomerForm from "./UpdateCustomerForm";
import UpdateCustomerHeader from "./UpdateCustomerHeader";
import UpdateCustomerInvoicesPanel from "./UpdateCustomerInvoicesPanel";
import UpdateCustomerModals from "./UpdateCustomerModals";
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
        <UpdateCustomerHeader
          avatarText={avatarText}
          customerData={customerData}
          customerId={customerId}
          editOpen={editOpen}
          isAdmin={isAdmin}
          isMutating={isMutating}
          restoreSequence={restoreSequence}
          showRestoreOptions={showRestoreOptions}
          onDeactivate={handleDeactivate}
          onOpenDeleteModal={openDeleteModal}
          onRecordOrder={handleRecordOrder}
          onRestoreAuto={handleRestoreAuto}
          onRestoreSequenceChange={setRestoreSequence}
          onRestoreWithSequence={handleRestoreWithSequence}
          onToggleEdit={() => setEditOpen((v) => !v)}
          onViewStatement={() => navigate(`/customers/${customerId}/statement`)}
        />

        <UpdateCustomerForm
          areas={areas}
          customerData={customerData}
          editOpen={editOpen}
          placementLoading={placementLoading}
          placementOptions={placementOptions}
          targetAreaId={targetAreaId}
          updatedInfo={updatedInfo}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />

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
            <UpdateCustomerInvoicesPanel
              customerData={customerData}
              customerId={customerId || ""}
              invoiceReady={invoiceReady}
              isAdmin={isAdmin}
              openEdit={openEdit}
              token={token || ""}
              onDoneOpeningEdit={async () => {
                try {
                  await fetchAndCacheCustomerInvoice(customerId || "", token || "");
                } catch {
                  return undefined;
                }
                toast.success("تم الحفظ وتحديث الأرقام");
                setOpenEdit(false);
              }}
              onToggleOpeningEdit={() => setOpenEdit((v: boolean) => !v)}
            />
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

      <UpdateCustomerModals
        areas={areas}
        closeDeleteModal={closeDeleteModal}
        confirmOpen={confirmOpen}
        deleteStep={deleteStep}
        isMutating={isMutating}
        pendingChanges={pendingChanges}
        placementOptions={placementOptions}
        performHardDelete={performHardDelete}
        setConfirmOpen={setConfirmOpen}
        setDeleteStep={setDeleteStep}
        setPendingChanges={setPendingChanges}
        showDeleteModal={showDeleteModal}
        submitUpdate={submitUpdate}
      />
    </div>
  );
}
