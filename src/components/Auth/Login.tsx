import './Login.css'; // Import your CSS file
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginForm from './LoginForm';

export default function Login(): JSX.Element {
  const [showLoginForm, setShowLoginForm] = useState<Boolean>(false);


  return (<div className='login-body'>
    <div className="login-container">
      <ToastContainer position="top-right" autoClose={1000} />
      <h2 className='login-title'>{showLoginForm ? "" : ""}</h2>
      {showLoginForm && <LoginForm />}
    </div>
    <div className='paragraph-div'><p className='login-page-paragraph'> TRX is your go-to Inventory management software for tracking shipments, orders, sales and deliveries. It leaves nothing untracked, and provides you with bills of materials and other production-related documents, keeping expenses, profits, and payments all in your control. </p>
      <p className='login-page-paragraph' >Get rid of all your frustrations, time-consuming checkups, and employee tracking errors, with just one tool! <button onClick={() => { setShowLoginForm(!showLoginForm) }}> Sign up now!</button></p></div>

  </div>

  );
};