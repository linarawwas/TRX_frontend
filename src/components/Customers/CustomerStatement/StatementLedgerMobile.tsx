import React, { memo } from "react";
import { Link } from "react-router-dom";
import { t } from "../../../utils/i18n";
import type { StatementLedger } from "./customerStatementLedger";
import { fmtUSD } from "./customerStatementLedger";

type Props = {
  ledger: StatementLedger;
};

function remainingClass(remainingUSD: number): string {
  if (remainingUSD > 0) return "due";
  if (remainingUSD < 0) return "credit";
  return "";
}

/**
 * Narrow-viewport ledger: subtotal first, then collapsible card list (newest-first).
 * Desktop/table uses the same row order from buildStatementLedger.
 */
export const StatementLedgerMobile = memo(function StatementLedgerMobile({
  ledger,
}: Props) {
  const { rows, totals, meta } = ledger;

  if (rows.length === 0) {
    return (
      <div className="st-ledger-mobile-root">
        <p className="st-ledger-cards-empty muted" role="status">
          {t("customerStatement.cards.empty")}
        </p>
      </div>
    );
  }

  return (
    <div className="st-ledger-mobile-root">
      <div
        className="st-ledger-cards"
        role="region"
        aria-label={t("customerStatement.cards.listAriaLabel")}
      >
        <section
          className="st-ledger-cards-subtotal"
          aria-label={t("customerStatement.cards.subtotalAria")}
        >
          <h2 className="st-ledger-cards-subtotal__title">
            {t("customerStatement.cards.subtotalTitle")}
          </h2>
          <dl className="st-ledger-cards-subtotal__grid">
            <div className="st-ledger-card__pair">
              <dt>{t("customerStatement.cards.bottlesOrdersTotal")}</dt>
              <dd>{meta.ordersBottles}</dd>
            </div>
            <div className="st-ledger-card__pair">
              <dt>{t("customerStatement.cards.checkoutTotal")}</dt>
              <dd>{fmtUSD(totals.total)}</dd>
            </div>
            <div className="st-ledger-card__pair">
              <dt>{t("customerStatement.cards.paidTotal")}</dt>
              <dd>{fmtUSD(totals.paid)}</dd>
            </div>
            <div className="st-ledger-card__pair">
              <dt>{t("customerStatement.cards.remainingTotal")}</dt>
              <dd className={remainingClass(totals.remaining)}>
                {fmtUSD(Math.abs(totals.remaining))}
              </dd>
            </div>
          </dl>
        </section>

        <details className="st-ledger-orders-details">
          <summary className="st-ledger-orders-details__summary">
            <span className="st-ledger-orders-details__summary-text">
              {t("customerStatement.cards.ordersDetailsToggle", {
                count: rows.length,
              })}
            </span>
            <span className="st-ledger-orders-details__chevron" aria-hidden="true" />
          </summary>
          <div className="st-ledger-orders-details__body">
            <p className="st-ledger-orders-details__hint muted">
              {t("customerStatement.cards.ordersDetailsHint")}
            </p>
            <ul className="st-ledger-cards__list">
              {rows.map((r) => (
                <li key={r.orderId} className="st-ledger-cards__item">
                  <article className="st-ledger-card">
                    <header className="st-ledger-card__head">
                      <span className="st-ledger-card__date">{r.date}</span>
                      <Link
                        to={`/updateOrder/${r.orderId}`}
                        className="st-ledger-card__link"
                        title={`فتح الفاتورة ${r.orderId}`}
                      >
                        {t("customerStatement.cards.invoiceLink")}
                      </Link>
                    </header>

                    <div
                      className={`st-ledger-card__hero ${remainingClass(r.remainingUSD)}`}
                    >
                      <span className="st-ledger-card__hero-label">
                        {t("customerStatement.cards.remainingUsd")}
                      </span>
                      <span className="st-ledger-card__hero-value">
                        {fmtUSD(Math.abs(r.remainingUSD))}
                      </span>
                    </div>

                    <dl className="st-ledger-card__grid">
                      <div className="st-ledger-card__pair">
                        <dt>{t("customerStatement.cards.delivered")}</dt>
                        <dd>{r.delivered}</dd>
                      </div>
                      <div className="st-ledger-card__pair">
                        <dt>{t("customerStatement.cards.returned")}</dt>
                        <dd>{r.returned}</dd>
                      </div>
                      <div className="st-ledger-card__pair">
                        <dt>{t("customerStatement.cards.bottlesNet")}</dt>
                        <dd>{r.bottlesLeft}</dd>
                      </div>
                      <div className="st-ledger-card__pair">
                        <dt>{t("customerStatement.cards.checkout")}</dt>
                        <dd>{fmtUSD(r.totalUSD)}</dd>
                      </div>
                      <div className="st-ledger-card__pair">
                        <dt>{t("customerStatement.cards.paid")}</dt>
                        <dd>{fmtUSD(r.paidUSD)}</dd>
                      </div>
                    </dl>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
});
