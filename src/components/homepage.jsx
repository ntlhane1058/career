import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';

const Homepage = () => {
  return (
    <div className="homepage">
      <nav className="navbar">
        <div className="logo">CareerGuidance</div>
        <ul className="nav-links center">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/universities">Universities</Link></li>
          <li><Link to="/courses">Courses</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/login">Login</Link></li>
        </ul>
      </nav>

      <div className="hero-section">
        <div className="overlay">
          <h1 className="heading">Shape Your Future with CareerGuidance for University for Lesotho</h1>
          <p className="subheading">
            Discover the best universities and courses to achieve your dreams.
          </p>
          <Link to="/universities" className="hero-button">Explore Universities</Link>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
