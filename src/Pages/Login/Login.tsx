import './Login.css'; // Import your CSS file
import { useRef, useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginForm from './LoginForm';

export default function Login(): JSX.Element {
  const [showLoginForm, setShowLoginForm] = useState<boolean>(true);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    });

    const elements = document.querySelectorAll('.hidden');
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
    <div className='login-body'>
      <h1 className="login-title">Login</h1>
      <div className="login-container">
        <ToastContainer position="top-right" autoClose={1000} />
        <h2 className='login-title'>{showLoginForm ? "" : ""}</h2>
        {showLoginForm && <LoginForm />}
      </div>
  </div>
  );
};
