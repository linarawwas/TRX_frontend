import React, { memo, useCallback } from "react";
import { t } from "../../../../utils/i18n";
import type { CustomerRow } from "../customersForAreaTypes";

export type CustomerCardVariant = "pending" | "filled" | "empty" | "default";

export type CustomersForAreaCustomerCardProps = {
  customer: CustomerRow;
  variant: CustomerCardVariant;
  onActivate: (id: string, name: string, phone: string) => void;
};

const CustomersForAreaCustomerCardInner: React.FC<
  CustomersForAreaCustomerCardProps
> = ({ customer, variant, onActivate }) => {
  const handleActivate = useCallback(() => {
    onActivate(customer._id, customer.name, customer.phone);
  }, [customer._id, customer.name, customer.phone, onActivate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleActivate();
      }
    },
    [handleActivate]
  );

  const cardClass =
    variant === "default"
      ? "cfa-card"
      : `cfa-card cfa-card--${variant}`;

  return (
    <div
      className={cardClass}
      onClick={handleActivate}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={
        variant === "pending"
          ? t("customersForArea.pending.cardAriaLabel", { name: customer.name })
          : undefined
      }
    >
      <div className="cfa-card__name">
        {variant === "pending" ? (
          <>
            <span className="cfa-card__name-wrap">
              <span className="cfa-card__pulse" aria-hidden />
              {customer.name}
            </span>
            <span className="cfa-card__badge" aria-hidden>
              🚩
            </span>
          </>
        ) : (
          customer.name
        )}
      </div>
      <div className="cfa-card__details">
        <span>
          {t("customersForArea.customer.address")}: {customer.address}
        </span>
        <span>
          {t("customersForArea.customer.phone")} {customer.phone}
        </span>
      </div>
    </div>
  );
};

export const CustomersForAreaCustomerCard = memo(CustomersForAreaCustomerCardInner);
