import React, { memo } from "react";
import { t } from "../../../../utils/i18n";

export type CustomersForAreaPendingBannerProps = {
  isOnline: boolean;
  pendingCount: number;
};

/** Shipment “pending order” customers — separate from device offline; uses count in copy. */
const CustomersForAreaPendingBannerInner: React.FC<
  CustomersForAreaPendingBannerProps
> = ({ isOnline, pendingCount }) => (
  <div
    className={`cfa-pending-banner ${isOnline ? "cfa-pending-banner--online" : "cfa-pending-banner--offline"}`}
    role="status"
  >
    <div className="cfa-pending-banner__dot" aria-hidden />
    <div className="cfa-pending-banner__text">
      {isOnline
        ? t("customersForArea.pending.banner.online", { count: pendingCount })
        : t("customersForArea.pending.banner.offline", { count: pendingCount })}
    </div>
  </div>
);

export const CustomersForAreaPendingBanner = memo(
  CustomersForAreaPendingBannerInner
);
