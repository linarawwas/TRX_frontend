// This is the entire signIn page wrapper 

import './signIn.css'; // Import your CSS file
import { useRef, useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import signInForm from './signInForm';

export default function signIn(): JSX.Element {
  const [showsignInForm, setShowsignInForm] = useState<boolean>(true);
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
    <div className='signIn-body'>
      <h1 className="signIn-title">signIn</h1>
      <div className="signIn-container">
        <ToastContainer position="top-right" autoClose={1000} />
        <h2 className='signIn-title'>{showsignInForm ? "" : ""}</h2>
        {showsignInForm && <signInForm />}
      </div>
  </div>
  );
};
