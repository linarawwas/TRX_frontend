import DiscountCard from "../DiscountCard";
import { t } from "../../../../utils/i18n";
import type { CustomerDiscountCache } from "../customerDiscountTypes";

type Props = {
  loading: boolean;
  error: string | null;
  discount: CustomerDiscountCache | null;
  onRetry: () => void;
};

/**
 * Discount cache from IndexedDB: loading skeleton, error + retry, or DiscountCard.
 */
export function RecordOrderForCustomerDiscountSection({
  loading,
  error,
  discount,
  onRetry,
}: Props) {
  if (loading) {
    return (
      <div
        className="rofc-discount-skeleton"
        aria-busy="true"
        aria-label={t("common.loading")}
      >
        <div className="rofc-discount-skeleton-line" />
        <div className="rofc-discount-skeleton-line rofc-discount-skeleton-line--short" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rofc-discount-error" role="alert">
        <p className="rofc-discount-error-text">{error}</p>
        <button
          type="button"
          className="rofc-retry-button"
          onClick={() => void onRetry()}
        >
          {t("recordOrderForCustomer.retry")}
        </button>
      </div>
    );
  }

  if (!discount?.hasDiscount) {
    return null;
  }

  return (
    <DiscountCard
      unitPriceUSD={discount.valueAfterDiscount}
      note={discount.noteAboutCustomer}
    />
  );
}
