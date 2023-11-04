import React from 'react';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>Welcome to OrdrTrkr</h1>
        <p>Your Order Management and Delivery Tracking Solution</p>
      </header>
      <section className="landing-content">
        <p>
          OrdrTrkr is your all-in-one platform for streamlining order management, tracking deliveries, and ensuring a seamless customer experience. With OrdrTrkr, you can easily manage orders, monitor deliveries in real-time, and delight your customers.
        </p>
<div>
Key Features:
          <ul>
            <li>Effortless Order Management</li>
            <li>Real-time Delivery Tracking</li>
            <li>Customer-Focused Approach</li>
            <li>Easy Payment Integration</li>
          </ul>
</div>
        <p>
          Join us on a journey to simplify your business operations and elevate your customer satisfaction. Experience the future of order and delivery management with OrdrTrkr!
        </p>
      </section>
      <footer className="landing-footer">
        <p>&copy; 2023 OrdrTrkr</p>
      </footer>
    </div>
  );
}

export default LandingPage;
