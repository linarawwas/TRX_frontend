import './Login.css'; // Import your CSS file
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import logo from '../../images/logo.png';

export default function Login(): JSX.Element {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showLoginForm, setShowLoginForm] = useState<Boolean>(false);
  const { email, password } = formData;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSuccess = (token: string) => {
    // Save the token in local storage
    localStorage.setItem('token', token);
    // // Refresh the browser to trigger navigation
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create an object with the user's email and password
    const credentials = {
      email,
      password,
    };

    try {
      // Send a POST request to your authentication endpoint
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        toast.success('Logged In Successfully');
        // Authentication succeeded
        // Retrieve the user's isAdmin status from the response or your authentication system
        const data = await response.json();
        const token = data.token;
        // Save the token and navigate the user
        handleLoginSuccess(token);
      } else {
        // Authentication failed; you can handle this by displaying an error message to the user
        console.error('Login failed');
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.');
      console.error('Login error:', error);
    }
  };

  return (<>
    <div className="login-container">
      <ToastContainer position="top-right" autoClose={1000} />
      <h2 className='login-title'>{showLoginForm ? "Login" : "Welcome to TRX"}</h2>
      {showLoginForm && <form className='login-form' onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={handleChange}
          required
          className='login-input'
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={handleChange}
          required
          className='login-input'
        />
        <button className='login-button' type="submit">Login</button>
      </form>}
    </div>
    <div className='paragraph-div'><p className='login-page-paragraph'> TRX is your go-to Inventory management software for tracking shipments, orders, sales and deliveries. It leaves nothing untracked, and provides you with bills of materials and other production-related documents, keeping expenses, profits, and payments all in your control. </p>
      <p className='login-page-paragraph' >Get rid of all your frustrations, time-consuming checkups, and employee tracking errors, with just one tool! <button onClick={() => { setShowLoginForm(!showLoginForm) }}> Sign up now!</button></p></div>

  </>

  );
};