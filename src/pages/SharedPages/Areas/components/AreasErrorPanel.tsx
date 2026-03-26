import { t } from "../../../../utils/i18n";

type Props = {
  message: string;
  onRetry: () => void;
};

export function AreasErrorPanel({ message, onRetry }: Props) {
  return (
    <div className="areas-error-panel" role="alert">
      <p className="areas-error-panel__text">
        {t("common.error")}: {message}
      </p>
      <button
        type="button"
        className="areas-error-panel__retry"
        onClick={onRetry}
      >
        {t("addresses.areas.retry")}
      </button>
    </div>
  );
}
