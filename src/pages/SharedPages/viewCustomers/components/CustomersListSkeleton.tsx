import React, { memo } from "react";
import { t } from "../../../../utils/i18n";

export const CustomersListSkeleton = memo(function CustomersListSkeleton() {
  return (
    <div
      className="vc-skeleton-root"
      role="status"
      aria-busy="true"
      aria-label={t("common.loading")}
    >
      <div className="vc-skeleton-accordion">
        <section className="vc-skeleton-section" aria-hidden="true">
          <div className="vc-skeleton-acc-header" />
          <div className="vc-skeleton-cards">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="vc-skeleton-card">
                <div className="vc-skeleton-line vc-skeleton-line--name" />
                <div className="vc-skeleton-icon" />
              </div>
            ))}
          </div>
        </section>
        <section className="vc-skeleton-section vc-skeleton-section--collapsed" aria-hidden="true">
          <div className="vc-skeleton-acc-header vc-skeleton-acc-header--muted" />
        </section>
      </div>
    </div>
  );
});
