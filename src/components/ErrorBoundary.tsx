// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";

/** User-friendly fallback for the authenticated app shell (Layout + routers). */
export function AuthAppErrorFallback() {
  return (
    <div
      className="error-boundary-fallback"
      style={{
        padding: "24px",
        maxWidth: "420px",
        margin: "40px auto",
        textAlign: "center",
        color: "var(--text, #1f2937)",
        fontFamily: "system-ui, sans-serif",
      }}
      dir="rtl"
      role="alert"
    >
      <h2 style={{ marginBottom: "8px", fontSize: "1.25rem" }}>
        حدث خطأ
      </h2>
      <p style={{ marginBottom: "16px", color: "var(--muted, #6b7280)" }}>
        عذراً، حدث خطأ غير متوقع. يمكنك تحديث الصفحة أو العودة لتسجيل الدخول.
      </p>
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            background: "#fff",
          }}
        >
          تحديث الصفحة
        </button>
        <a
          href="/login"
          style={{
            padding: "8px 16px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            background: "#fff",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          تسجيل الدخول
        </a>
      </div>
    </div>
  );
}

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
