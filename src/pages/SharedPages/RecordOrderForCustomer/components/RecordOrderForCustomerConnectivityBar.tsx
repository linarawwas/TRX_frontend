import { useNavigatorOnline } from "../../../../hooks/useNavigatorOnline";
import { t } from "../../../../utils/i18n";

/**
 * Compact connectivity strip for field pages: shows when offline so drivers know sync is deferred.
 */
export function RecordOrderForCustomerConnectivityBar() {
  const online = useNavigatorOnline();

  if (online) return null;

  return (
    <div
      className="rofc-connectivity-bar"
      role="status"
      aria-live="polite"
    >
      {t("recordOrderForCustomer.offlineHint")}
    </div>
  );
}
