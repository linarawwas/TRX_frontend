import "./RecordOrderForCustomer.css";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import RecordOrder from "../../../components/Orders/RecordOrder/RecordOrder";
import { selectOrderCustomerId } from "../../../redux/selectors/order";
import { t } from "../../../utils/i18n";
import { useCustomerDiscountCache } from "./hooks/useCustomerDiscountCache";
import { RecordOrderForCustomerConnectivityBar } from "./components/RecordOrderForCustomerConnectivityBar";
import { RecordOrderForCustomerBackNav } from "./components/RecordOrderForCustomerBackNav";
import { RecordOrderForCustomerDiscountSection } from "./components/RecordOrderForCustomerDiscountSection";

function RecordOrderForCustomer(): JSX.Element {
  const customerId = useSelector(selectOrderCustomerId);
  const { state } = useLocation();
  const isExternal = Boolean((state as { isExternal?: boolean })?.isExternal);

  const { data: discount, loading, error, reload } = useCustomerDiscountCache(
    customerId ?? undefined
  );

  const customerDataForOrder =
    loading || error
      ? null
      : discount
        ? {
            hasDiscount: discount.hasDiscount,
            valueAfterDiscount: discount.valueAfterDiscount,
          }
        : null;

  if (!customerId) {
    return (
      <div className="rofc-page" dir="rtl">
        <RecordOrderForCustomerConnectivityBar />
        <RecordOrderForCustomerBackNav />
        <p className="rofc-missing-customer" role="alert">
          {t("recordOrderForCustomer.missingCustomer")}
        </p>
      </div>
    );
  }

  return (
    <div className="rofc-page" dir="rtl">
      <RecordOrderForCustomerConnectivityBar />
      <RecordOrderForCustomerBackNav />
      <RecordOrderForCustomerDiscountSection
        loading={loading}
        error={error}
        discount={discount}
        onRetry={reload}
      />
      <RecordOrder customerData={customerDataForOrder} isExternal={isExternal} />
    </div>
  );
}

export default RecordOrderForCustomer;
