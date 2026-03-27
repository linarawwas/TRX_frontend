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
import { UpdateCustomerPageSkeleton } from "./UpdateCustomerPageSkeleton";
import { UpdateCustomerLoadError } from "./UpdateCustomerLoadError";
import { UpdateCustomerErrorBoundary } from "./UpdateCustomerErrorBoundary";
import type { CustomerDetail } from "../../../features/customers/apiCustomers";
import { useUpdateCustomerController } from "../../../features/customers/hooks/useUpdateCustomerController";
import { t } from "../../../utils/i18n";
import { createLogger } from "../../../utils/logger";

const logger = createLogger("update-customer-page");

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
    fetchError,
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
    reload,
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

  const hasAreaObject =
    typeof customerData?.areaId === "object" &&
    customerData?.areaId != null &&
    "_id" in customerData.areaId;

  return (
    <div className="ucx ucx--shell" dir="rtl" lang="ar">
      <div className="ucx__glow" aria-hidden />
      <ToastContainer position="top-right" autoClose={1000} />
      <div className="ucx__inner">
        <div className="ucx__surface">
          {loading ? (
            <UpdateCustomerPageSkeleton />
          ) : fetchError ? (
            <UpdateCustomerLoadError
              message={fetchError}
              onRetry={() => void reload()}
            />
          ) : (
            <UpdateCustomerErrorBoundary>
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

                <nav
                  className="ucx-tabs-wrap"
                  aria-label={t("updateCustomer.tabs.navAriaLabel")}
                >
                  <div className="ucx-tabs" role="tablist">
                    <button
                      type="button"
                      role="tab"
                      id="ucx-tab-info"
                      aria-selected={tab === "info"}
                      aria-controls="ucx-panel-info"
                      className={`ucx-tab ${tab === "info" ? "is-active" : ""}`}
                      onClick={() => setTab("info")}
                    >
                      {t("updateCustomer.tab.info")}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      id="ucx-tab-invoices"
                      aria-selected={tab === "invoices"}
                      aria-controls="ucx-panel-invoices"
                      className={`ucx-tab ${tab === "invoices" ? "is-active" : ""}`}
                      onClick={() => setTab("invoices")}
                    >
                      {t("updateCustomer.tab.invoices")}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      id="ucx-tab-area"
                      aria-selected={tab === "area"}
                      aria-controls="ucx-panel-area"
                      className={`ucx-tab ${tab === "area" ? "is-active" : ""}`}
                      onClick={() => setTab("area")}
                    >
                      {t("updateCustomer.tab.area")}
                    </button>
                  </div>
                </nav>

                <main className="ucx-grid" id="ucx-tabpanels">
                  {tab === "info" && (
                    <section
                      className="ucx-card"
                      role="tabpanel"
                      id="ucx-panel-info"
                      aria-labelledby="ucx-tab-info"
                    >
                      <div className="ucx-card__header">{t("updateCustomer.card.infoTitle")}</div>
                      <div className="ucx-card__body">
                        <CustomerInfo customerData={customerData} loading={loading} />
                        {customerData && (
                          <AssignDistributorInline
                            customerId={customerId}
                            currentDistributorId={
                              (
                                customerData as CustomerDetail & {
                                  distributorId?: string | null;
                                }
                              ).distributorId ?? null
                            }
                          />
                        )}
                      </div>
                    </section>
                  )}
                  {tab === "invoices" && (
                    <div
                      className="ucx-tabpanel"
                      role="tabpanel"
                      id="ucx-panel-invoices"
                      aria-labelledby="ucx-tab-invoices"
                    >
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
                        } catch (e) {
                          logger.error("fetchAndCacheCustomerInvoice after opening edit failed", {
                            message: e instanceof Error ? e.message : String(e),
                          });
                          return undefined;
                        }
                        toast.success(t("updateCustomer.invoiceSavedToast"));
                        setOpenEdit(false);
                      }}
                      onToggleOpeningEdit={() => setOpenEdit((v: boolean) => !v)}
                    />
                    </div>
                  )}
                  {tab === "area" && hasAreaObject && (
                    <section
                      className="ucx-card"
                      role="tabpanel"
                      id="ucx-panel-area"
                      aria-labelledby="ucx-tab-area"
                    >
                      <div className="ucx-card__header">{t("updateCustomer.card.areaTitle")}</div>
                      <div className="ucx-card__body">
                        <AreaSequencePicker
                          token={token || ""}
                          companyId={companyId}
                          areaId={(customerData!.areaId as { _id: string })._id}
                          currentCustomerId={customerId || ""}
                          mode="apply"
                          title={t("updateCustomer.areaPicker.title")}
                          onChange={() => undefined}
                          onApplied={fetchCustomer}
                        />
                      </div>
                    </section>
                  )}
                </main>
              </div>
            </UpdateCustomerErrorBoundary>
          )}
        </div>
      </div>

      {!loading && !fetchError && (
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
      )}
    </div>
  );
}
