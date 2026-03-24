import "./Login.css";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginForm from "./LoginForm";
import logo from "../../../images/logo.jpeg";

export default function Login(): JSX.Element {
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  return (
    <div className="login-wrapper">
      <ToastContainer position="top-right" autoClose={1000} />
      <div className="header">
        <img src={logo} alt="TRX Logo" className="logo" />
      </div>
      <div className="form-section">
        <LoginForm />
      </div>
    </div>
  );
}
