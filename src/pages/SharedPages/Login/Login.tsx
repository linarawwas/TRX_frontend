import "./Login.css";
import React, { useEffect, type ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginForm from "./LoginForm";
import logo from "../../../images/logo.jpeg";
import { createLogger } from "../../../utils/logger";

const logger = createLogger("login-page");

type BoundaryState = { hasError: boolean };

class LoginErrorBoundary extends React.Component<
  { children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error("Login page crashed", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="login-wrapper lp-shell lp-shell--error" dir="rtl" lang="ar" role="alert">
          <div className="lp-error-card">
            <p className="lp-error-text">تعذّر عرض صفحة تسجيل الدخول.</p>
            <button
              type="button"
              className="lp-error-reload"
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

function LoginShell(): JSX.Element {
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  return (
    <div className="login-wrapper lp-shell" dir="rtl" lang="ar">
      <ToastContainer position="top-right" autoClose={1000} />

      <header className="header lp-header" role="banner">
        <h1 className="lp-sr-only">تسجيل الدخول</h1>
        <img src={logo} alt="TRX Logo" className="logo lp-logo" />
      </header>

      <main className="form-section lp-main-card">
        <LoginForm />
      </main>
    </div>
  );
}

export default function Login(): JSX.Element {
  return (
    <LoginErrorBoundary>
      <LoginShell />
    </LoginErrorBoundary>
  );
}
