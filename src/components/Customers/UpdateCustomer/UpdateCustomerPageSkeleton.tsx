import React from "react";
import { t } from "../../../utils/i18n";
import "../../../components/skeletons/TrxSkeleton.css";
import "./UpdateCustomerPageSkeleton.css";

export function UpdateCustomerPageSkeleton(): JSX.Element {
  return (
    <div className="ucx-page-skeleton" aria-busy="true" aria-live="polite">
      <span className="ucx-page-skeleton__sr">{t("common.loading")}</span>
      <div className="ucx-page-skeleton__hero">
        <div className="ucx-page-skeleton__avatar trx-skeleton-block" />
        <div className="ucx-page-skeleton__hero-text">
          <div className="ucx-page-skeleton__line trx-skeleton-block ucx-page-skeleton__line--title" />
          <div className="ucx-page-skeleton__line trx-skeleton-block ucx-page-skeleton__line--sub" />
        </div>
      </div>
      <div className="ucx-page-skeleton__tabs">
        <div className="ucx-page-skeleton__tab trx-skeleton-block" />
        <div className="ucx-page-skeleton__tab trx-skeleton-block" />
        <div className="ucx-page-skeleton__tab trx-skeleton-block" />
      </div>
      <div className="ucx-page-skeleton__card trx-skeleton-block">
        <div className="ucx-page-skeleton__card-head trx-skeleton-block" />
        <div className="ucx-page-skeleton__row trx-skeleton-block" />
        <div className="ucx-page-skeleton__row trx-skeleton-block" />
        <div className="ucx-page-skeleton__row trx-skeleton-block ucx-page-skeleton__row--short" />
      </div>
    </div>
  );
}
