// this is only the form portion of the login form page
import "./Login.css"; // Import your CSS file
import React, { useState, ChangeEvent, FormEvent } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function LoginForm(): JSX.Element {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { email, password } = formData;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSuccess = (token: string) => {
    // Save the token in local storage
    localStorage.setItem("token", token);
    // // Refresh the browser to trigger navigation
    setTimeout(() => {
      window.location.reload();
    }, 1000);
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
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensures cookies and tokens are sent

        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        toast.success("Logged In Successfully");
        // Authentication succeeded
        // Retrieve the user's isAdmin status from the response or your authentication system
        const data = await response.json();
        const token = data.token;
        // Save the token and navigate the user
        handleLoginSuccess(token);
      } else {
        // Authentication failed; you can handle this by displaying an error message to the user
        console.error("Login failed");
        toast.error("Invalid email or password");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
      console.error("Login error:", error);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        name="email"
        value={email}
        onChange={handleChange}
        required
        className="login-input"
      />
      <input
        type="password"
        placeholder="Password"
        name="password"
        value={password}
        onChange={handleChange}
        required
        className="login-input"
      />
      <button className="login-button" type="submit">
        Login
      </button>
    </form>
  );
}
