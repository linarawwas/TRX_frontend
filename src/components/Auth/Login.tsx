import './Login.css'; // Import your CSS file
import { useRef, useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginForm from './LoginForm';

export default function Login(): JSX.Element {
  const [showLoginForm, setShowLoginForm] = useState<boolean>(false);
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
      <div className="login-container">
        {!showLoginForm && <button className='login-page-paragraph hidden sign-up' onClick={() => { setShowLoginForm(!showLoginForm) }}> Sign up now!</button>}
        <ToastContainer position="top-right" autoClose={1000} />
        <h2 className='login-title'>{showLoginForm ? "" : ""}</h2>
        {showLoginForm && <LoginForm />}
      </div>
      <div className='paragraph-div hidden one  login-page-paragraph'> TRX is your go-to Inventory management software  </div><br />
      <div className='paragraph-div hidden two login-page-paragraph'> for tracking shipments, orders, sales, and deliveries.  </div><br />
      <div className='paragraph-div hidden three login-page-paragraph'>It leaves nothing untracked. </div><br />
      <div className='paragraph-div hidden four login-page-paragraph'> and provides you with bills of materials and other production-related documents, </div>
      <div className='paragraph-div hidden five login-page-paragraph'> keeping expenses, profits, and payments all in your control.   </div><br />
      <div className='paragraph-div hidden six login-page-paragraph'>Get rid of all your frustrations, time-consuming checkups, and employee tracking errors, with just one tool! </div>
    </div>
  );
};
