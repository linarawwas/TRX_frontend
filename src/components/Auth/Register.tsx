import React, { useState, ChangeEvent, FormEvent } from 'react';
import './Register.css'; // Import your CSS file
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { registerUser } from '../../features/auth/api';

const Register: React.FC = () => {
  const token: string = useSelector((state: any) => state.user.token);
  const companyId: string = useSelector((state: any) => state.user.companyId);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyId: companyId,
  });

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await registerUser(token, formData);
    if (response.error) {
      toast.error(`Registration failed: ${response.error}`);
      return;
    }
    toast.success('User registered successfully');
  };

  return (
    <div className="register-container">
      <ToastContainer position="top-right" autoClose={1000} />
      <h2 className='register-title'>Register A New User</h2>
      <form className='register-form' onSubmit={handleSubmit}>
        <input
          className='register-input'
          type="text"
          placeholder="Name"
          name="name"
          value={name}
          onChange={handleChange}
          required
        />
        <input
          className='register-input'
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={handleChange}
          required
        />
        <input
          className='register-input'
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={handleChange}
          required
        />
        <input
          className='register-input'
          type="password"
          placeholder="Confirm Password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleChange}
          required
        />
        <button className='register-button' type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
