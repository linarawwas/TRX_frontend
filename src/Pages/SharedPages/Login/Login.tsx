// This is the entire Login page wrapper

import "./Login.css"; // Import your CSS file
import { useRef, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginForm from "./LoginForm";
import logo from "../../../images/logo.jpeg";
export default function Login(): JSX.Element {
  const [showLoginForm, setShowLoginForm] = useState<boolean>(true);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    });

    const elements = document.querySelectorAll(".hidden");
    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      elements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);
  return (
    <div className="login-container">
      <ToastContainer position="top-right" autoClose={1000} />

      <div className="white-bg">
        <div className="blue-box">
          <img src={logo} alt="" className="logo" />
        </div>
      </div>

      <div className="blue-bg">
        <div className="white-box">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
