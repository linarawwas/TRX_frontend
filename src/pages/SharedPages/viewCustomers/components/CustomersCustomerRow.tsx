import React, { memo } from "react";
import { Link } from "react-router-dom";
import { t } from "../../../../utils/i18n";
import type { CustomersCustomerRowProps } from "../types/customersPage.types";

export const CustomersCustomerRow = memo(function CustomersCustomerRow({
  customer,
  inactive = false,
}: CustomersCustomerRowProps) {
  return (
    <Link
      to={`/updateCustomer/${customer._id}`}
      className="customer-card-link vc-card-link"
      title={`${t("common.edit")} ${customer.name}`}
    >
      <article
        className={`customer-card vc-customer-card${inactive ? " inactive-card" : ""}`}
      >
        <div className="customer-card-content">
          <span className="customer-name vc-customer-name">{customer.name}</span>
          {inactive ? (
            <span className="status-chip">
              {t("addresses.customer.status.inactive")}
            </span>
          ) : null}
          <span className="edit-customer-icon vc-edit-icon" aria-hidden="true">
            📝
          </span>
        </div>
      </article>
    </Link>
  );
});
