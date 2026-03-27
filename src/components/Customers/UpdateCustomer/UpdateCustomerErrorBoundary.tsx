import React, { type ErrorInfo, type ReactNode } from "react";
import { t } from "../../../utils/i18n";
import { createLogger } from "../../../utils/logger";

const logger = createLogger("update-customer-boundary");

type Props = { children: ReactNode };

type State = { hasError: boolean };

export class UpdateCustomerErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error("UpdateCustomer subtree render failed", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="ucx-error-boundary" role="alert">
          <h2 className="ucx-error-boundary__title">{t("updateCustomer.errorBoundary.title")}</h2>
          <p className="ucx-error-boundary__body">{t("updateCustomer.errorBoundary.body")}</p>
          <button
            type="button"
            className="ucx-error-boundary__reload"
            onClick={() => window.location.reload()}
          >
            {t("updateCustomer.errorBoundary.reload")}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
