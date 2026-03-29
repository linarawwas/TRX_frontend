import React, { memo } from "react";
import AddCustomer from "../../../../components/Customers/AddCustomer/AddCustomer";
import { t } from "../../../../utils/i18n";
import type { CustomersPageViewModel } from "../types/customersPage.types";
import { CustomersCustomerRow } from "./CustomersCustomerRow";
import { CustomersListSkeleton } from "./CustomersListSkeleton";

export type CustomersShellProps = CustomersPageViewModel;

/**
 * Presentational shell: layout only. No Redux, no fetch.
 */
const CustomersShellInner: React.FC<CustomersShellProps> = ({
  loading,
  error,
  filteredActive,
  filteredInactive,
  activeCustomers,
  inactiveCustomers,
  searchTerm,
  onSearchTermChange,
  showInsertOne,
  onToggleShowInsertOne,
  openActive,
  onToggleOpenActive,
  openInactive,
  onToggleOpenInactive,
  noResults,
  onRetry,
  activePanelId,
  inactivePanelId,
}) => {
  return (
    <div className="customers-body vc-shell" dir="rtl" lang="ar">
      <header className="customer-header vc-header">
        <h1 className="customers-title vc-title">{t("customers.title")}</h1>

        <div className="customer-adding-options vc-toolbar">
          <button
            type="button"
            className="customer-adding-option vc-btn vc-btn--primary"
            onClick={onToggleShowInsertOne}
            aria-expanded={showInsertOne}
            aria-controls="add-customer-form"
          >
            {showInsertOne ? t("customers.showCustomers") : t("customers.addToggle")}
          </button>

          <div className="search-bar vc-search">
            <label className="vc-search__label" htmlFor="customers-search-input">
              {t("customers.search.placeholder")}
            </label>
            <input
              id="customers-search-input"
              type="search"
              placeholder={t("customers.search.placeholder")}
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="search-input vc-search__input"
              autoComplete="off"
            />
          </div>

          {showInsertOne ? (
            <div id="add-customer-form" className="customer-form-wrapper vc-form-wrap">
              <AddCustomer />
            </div>
          ) : null}
        </div>
      </header>

      {loading ? (
        <CustomersListSkeleton />
      ) : error ? (
        <div className="vc-inline-error" role="alert">
          <p className="vc-inline-error__text">
            {t("common.error")}: {error}
          </p>
          <button type="button" className="vc-retry" onClick={onRetry}>
            {t("updateCustomer.retry")}
          </button>
        </div>
      ) : (
        !showInsertOne && (
          <div className="accordion vc-accordion">
            <section className="accordion-section vc-acc-section">
              <button
                type="button"
                className="accordion-header vc-acc-header"
                aria-expanded={openActive}
                aria-controls={activePanelId}
                onClick={onToggleOpenActive}
              >
                <span
                  className={`chev vc-chev ${openActive ? "open" : ""}`}
                  aria-hidden="true"
                >
                  ▸
                </span>
                <span className="acc-title">{t("customers.active.title")}</span>
                <span className="badge vc-badge">
                  {filteredActive.length}/{activeCustomers.length}
                </span>
              </button>

              {openActive ? (
                <div id={activePanelId} className="accordion-body vc-acc-body">
                  {filteredActive.length ? (
                    <div className="customer-card-list vc-card-list">
                      {filteredActive.map((customer) => (
                        <CustomersCustomerRow key={customer._id} customer={customer} />
                      ))}
                    </div>
                  ) : (
                    <p className="muted-center vc-muted">{t("customers.active.empty")}</p>
                  )}
                </div>
              ) : null}
            </section>

            <section className="accordion-section vc-acc-section">
              <button
                type="button"
                className="accordion-header inactive vc-acc-header vc-acc-header--muted"
                aria-expanded={openInactive}
                aria-controls={inactivePanelId}
                onClick={onToggleOpenInactive}
              >
                <span
                  className={`chev vc-chev ${openInactive ? "open" : ""}`}
                  aria-hidden="true"
                >
                  ▸
                </span>
                <span className="acc-title">{t("customers.inactive.title")}</span>
                <span className="badge gray vc-badge vc-badge--gray">
                  {filteredInactive.length}/{inactiveCustomers.length}
                </span>
              </button>

              {openInactive ? (
                <div id={inactivePanelId} className="accordion-body vc-acc-body">
                  {filteredInactive.length ? (
                    <div className="customer-card-list vc-card-list">
                      {filteredInactive.map((customer) => (
                        <CustomersCustomerRow
                          key={customer._id}
                          customer={customer}
                          inactive
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="muted-center vc-muted">
                      {t("customers.inactive.empty")}
                    </p>
                  )}
                </div>
              ) : null}
            </section>

            {noResults ? (
              <p className="muted-center vc-muted vc-no-results">
                {t("customers.noResults")}
              </p>
            ) : null}
          </div>
        )
      )}
    </div>
  );
};

export const CustomersShell = memo(CustomersShellInner);
