import { useNavigate } from "react-router-dom";
import { t } from "../../../../utils/i18n";

type Props = {
  /** When false, back is disabled (e.g. missing route context). */
  canGoBack?: boolean;
};

export function RecordOrderForCustomerBackNav({ canGoBack = true }: Props) {
  const navigate = useNavigate();

  return (
    <div className="rofc-back-row">
      <button
        type="button"
        className="rofc-back-button"
        onClick={() => navigate(-1)}
        disabled={!canGoBack}
        aria-label={t("common.back")}
      >
        <svg
          className="rofc-back-icon"
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
        <span className="rofc-back-text">{t("common.back")}</span>
      </button>
    </div>
  );
}
