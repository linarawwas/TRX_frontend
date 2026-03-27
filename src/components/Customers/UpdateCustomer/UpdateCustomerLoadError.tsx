import React from "react";
import { t } from "../../../utils/i18n";

type UpdateCustomerLoadErrorProps = {
  message: string;
  onRetry: () => void;
};

export function UpdateCustomerLoadError({
  message,
  onRetry,
}: UpdateCustomerLoadErrorProps): JSX.Element {
  return (
    <div className="ucx-load-error" role="alert">
      <p className="ucx-load-error__text">
        {t("common.error")}: {message}
      </p>
      <button type="button" className="ucx-load-error__retry" onClick={onRetry}>
        {t("updateCustomer.retry")}
      </button>
    </div>
  );
}
