import { useNavigatorOnline } from "../../../../hooks/useNavigatorOnline";
import { t } from "../../../../utils/i18n";

/**
 * Shows when the device is offline so ops knows the list may not reflect latest server data.
 */
export function AreasConnectivityBar() {
  const online = useNavigatorOnline();

  if (online) return null;

  return (
    <div
      className="areas-connectivity-bar"
      role="status"
      aria-live="polite"
    >
      {t("addresses.areas.offlineHint")}
    </div>
  );
}
