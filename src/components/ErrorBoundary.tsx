// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  errorTitle?: ReactNode;
  errorMessage?: ReactNode;
  errorDetailsLabel?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "#b91c1c",
          }}
          role="alert"
        >
          <h2>{this.props.errorTitle || "حدث خطأ"}</h2>
          <p>
            {this.props.errorMessage ||
              "عذراً، حدث خطأ غير متوقع. يرجى تحديث الصفحة."}
          </p>
          {this.state.error && (
            <details style={{ marginTop: "10px", textAlign: "right" }}>
              <summary>
                {this.props.errorDetailsLabel || "تفاصيل الخطأ"}
              </summary>
              <pre style={{ fontSize: "12px", overflow: "auto" }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
