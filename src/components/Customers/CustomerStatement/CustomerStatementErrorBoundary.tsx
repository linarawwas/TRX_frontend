import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { createLogger } from "../../../utils/logger";

const logger = createLogger("customer-statement");

type Props = { children: ReactNode };

type State = { hasError: boolean };

/**
 * Last-resort guard for the statement route so a render error does not white-screen the app.
 */
export class CustomerStatementErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error("render failed", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="customer-st-container customer-st-container--error" dir="rtl">
          <div className="st-error-card" role="alert">
            <h2 className="st-error-title">تعذّر عرض كشف الحساب</h2>
            <p className="st-error-body">
              حدث خطأ غير متوقع. يمكنك إعادة تحميل الصفحة أو الرجوع والمحاولة لاحقًا.
            </p>
            <button
              type="button"
              className="st-error-reload"
              onClick={() => window.location.reload()}
            >
              إعادة تحميل
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
