import { useSelector } from "react-redux";
import "./RecordOrderForCustomer.css";
import { useLocation, useNavigate } from "react-router-dom";

import RecordOrder from "../../../components/Orders/RecordOrder/RecordOrder";
import DiscountCard from "./DiscountCard";
import { selectOrderCustomerId } from "../../../redux/selectors/order";
import { selectShipmentExchangeRateLBP } from "../../../redux/selectors/shipment";
import { t } from "../../../utils/i18n";
import { useCustomerDiscountFromCache } from "./useCustomerDiscountFromCache";

function RecordOrderForCustomer(): JSX.Element {
  const customerId = useSelector(selectOrderCustomerId);
  const rateLBP = useSelector(selectShipmentExchangeRateLBP);
  const { customerData, loading: discountLoading } =
    useCustomerDiscountFromCache(customerId || undefined);
  const navigate = useNavigate();
  const { state } = useLocation();
  const isExternal = Boolean((state as { isExternal?: boolean })?.isExternal);

  return (
    <div
      className="rofc-page"
      dir="rtl"
      lang="ar"
    >
      <div className="rofc-inner">
        <div className="back-row">
          <button
            type="button"
            className="back-pill"
            onClick={() => navigate(-1)}
            aria-label={t("common.back")}
          >
            <svg
              className="back-icon"
              viewBox="0 0 24 24"
              focusable="false"
              aria-hidden="true"
            >
              <path
                d="M10 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="back-text">{t("common.back")}</span>
          </button>
        </div>

        {discountLoading && (
          <div
            className="rofc-discount-skeleton"
            role="status"
            aria-busy="true"
            aria-label={t("recordOrderForCustomer.discount.loadingHint")}
          >
            <div className="rofc-discount-skeleton__shine" />
            <span className="rofc-discount-skeleton__text">
              {t("recordOrderForCustomer.discount.loadingHint")}
            </span>
          </div>
        )}

        {!discountLoading && customerData?.hasDiscount && (
          <DiscountCard
            unitPriceUSD={customerData.valueAfterDiscount ?? 0}
            note={customerData.noteAboutCustomer}
            rateLBP={rateLBP}
          />
        )}

        <RecordOrder
          customerData={customerData || null}
          isExternal={isExternal}
        />
      </div>
    </div>
  );
}

export default RecordOrderForCustomer;
