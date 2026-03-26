import React from "react";
import { t } from "../../../../utils/i18n";
import "./AreasPageSkeleton.css";

const TILE_COUNT = 8;

export function AreasPageSkeleton(): JSX.Element {
  return (
    <div className="areas-page-skeleton" aria-busy="true" aria-live="polite">
      <span className="areas-page-skeleton__sr">{t("common.loading")}</span>
      <div className="areas-page-skeleton__grid">
        {Array.from({ length: TILE_COUNT }, (_, i) => (
          <div
            key={i}
            className="areas-page-skeleton__tile trx-skeleton-block"
          />
        ))}
      </div>
    </div>
  );
}
