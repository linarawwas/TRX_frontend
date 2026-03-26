import React from "react";
import { t } from "../../../../utils/i18n";
import "./AddressesPageSkeleton.css";

const ROW_COUNT = 6;

export function AddressesPageSkeleton(): JSX.Element {
  return (
    <div className="addresses-page-skeleton" aria-busy="true" aria-live="polite">
      <span className="addresses-page-skeleton__sr">{t("addresses.loading")}</span>
      <div className="addresses-page-skeleton__list">
        {Array.from({ length: ROW_COUNT }, (_, i) => (
          <div key={i} className="addresses-page-skeleton__card">
            <div className="addresses-page-skeleton__pin trx-skeleton-block" />
            <div className="addresses-page-skeleton__main">
              <div className="addresses-page-skeleton__line trx-skeleton-block addresses-page-skeleton__line--title" />
              <div className="addresses-page-skeleton__line trx-skeleton-block addresses-page-skeleton__line--muted" />
              <div className="addresses-page-skeleton__pill trx-skeleton-block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
