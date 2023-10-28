import React from 'react';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>Welcome to Your App</h1>
        <p>Your catchphrase or brief introduction here</p>
      </header>
      <section className="landing-content">
        <p>
          This is the landing page content. You can provide a warm welcome message, features overview, or any other information you want to showcase.
        </p>
      </section>
      <footer className="landing-footer">
        <p>&copy; 2023 Your Company</p>
      </footer>
    </div>
  );
}

export default LandingPage;
