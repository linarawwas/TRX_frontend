import React, { useState } from 'react';
import './Login.css'; // Import your CSS file
import { Link } from 'react-router-dom'; 

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        // Authentication succeeded; you can redirect the user to another page or update the UI accordingly
        console.log('Login successful');
      } else {
        // Authentication failed; you can handle this by displaying an error message to the user
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account?
        <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;
