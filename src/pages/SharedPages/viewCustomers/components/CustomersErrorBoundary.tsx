import React, { type ReactNode } from "react";
import { createLogger } from "../../../../utils/logger";
import { t } from "../../../../utils/i18n";

const logger = createLogger("customers-list");

type BoundaryState = { hasError: boolean };

export class CustomersErrorBoundary extends React.Component<
  { children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo): void {
    logger.error("Customers view crashed", {
      message: err.message,
      stack: err.stack,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="customers-body vc-shell vc-shell--error"
          dir="rtl"
          lang="ar"
          role="alert"
        >
          <div className="vc-error-card">
            <h2 className="vc-error-title">{t("updateCustomer.errorBoundary.title")}</h2>
            <p className="vc-error-body">{t("updateCustomer.errorBoundary.body")}</p>
            <button
              type="button"
              className="vc-error-reload"
              onClick={() => window.location.reload()}
            >
              {t("updateCustomer.errorBoundary.reload")}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
