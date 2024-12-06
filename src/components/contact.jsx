import React, { useState } from 'react';
import "../styles/contact.css";  

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.name && formData.email && formData.message) {
      console.log('Form Submitted:', formData);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' }); // Reset the form
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div className="contact-us-page">
      <h1>Contact Us</h1>
      <p>We would love to hear from you! Please fill out the form below, and we'll get back to you as soon as possible.</p>

      {/* Check if form is submitted */}
      {isSubmitted ? (
        <div className="submission-success">
          <h2>Thank You!</h2>
          <p>Your message has been sent successfully. We will be in touch shortly.</p>
        </div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your email"
            required
          />

          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your message"
            required
          ></textarea>

          <button type="submit" className="submit-button">Send Message</button>
        </form>
      )}
    </div>
  );
};

export default Contact;
