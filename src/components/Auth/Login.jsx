import './Login.css'; // Import your CSS file
import React, { useState } from 'react';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSuccess = (token) => {
    // Save the token in local storage
    localStorage.setItem('token', token);
    // Refresh the browser to trigger navigation
    window.location.reload();
  };

  const handleSubmit = async (e) => {
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
        // Authentication succeeded
        // Retrieve the user's isAdmin status from the response or your authentication system
        const data = await response.json();
        const token = data.token;
        // Save the token and navigate the user
        handleLoginSuccess(token);
        toast.success("Logged in", { autoClose: 2000 });

      } else {
        // Authentication failed; you can handle this by displaying an error message to the user
        console.error('Login failed');
        toast.error("Invalid email or password", { autoClose: 2000 });

      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.", {
        autoClose: 2000,
      });
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">

      <h2 className='login-title' >Login</h2>
      <ToastContainer />

      <form className='login-form' onSubmit={handleSubmit}>
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
      </form>
    </div>
  );
};

export default Login;