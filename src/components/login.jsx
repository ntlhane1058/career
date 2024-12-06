import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import "../styles/login.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [userType, setUserType] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Login successful');
        setError('');
        const userType = data.user.user_type;

        if (userType === 'admin') {
          navigate('/admin');
        } else if (userType === 'institute') {
          navigate('/institution');
        } else if (userType === 'student') {
          navigate('/universities');
        } else {
          setError('Unknown user type. Please contact support.');
        }
      } else {
        setError(data.error || 'Unknown error occurred.');
        setSuccess('');
      }
    } catch (err) {
      setError('Error logging in. Please try again later.');
      setSuccess('');
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file); // Store the original file for upload
    } else {
      setProfilePicture(null);
      setError('Please upload a valid profile picture.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password || !name || !profilePicture) {
      setError('Please fill in all required fields and upload a profile picture.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('user_type', userType);
    formData.append('profilePicture', profilePicture); // Append the original file

    try {
      const response = await fetch('http://localhost:8081/register', {
        method: 'POST',
        body: formData, 
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Registration successful. You can now log in.');
        setError('');
        setEmail('');
        setPassword('');
        setName('');
        setProfilePicture(null);
        setIsRegistering(false); 
      } else {
        setError(data.error || 'Unknown registration error.');
        setSuccess('');
      }
    } catch (err) {
      setError('Error registering. Please try again later.');
      setSuccess('');
    }
  };

  const handleBackButtonClick = () => {
    navigate('/'); // Redirect to the home page
  };

  return (
    <div className="login-page">
      <h1>{isRegistering ? 'Register' : 'Login'}</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={isRegistering ? handleRegister : handleLogin} className="login-form">
        {isRegistering && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              required
            />
            {profilePicture && (
              <img
                src={URL.createObjectURL(profilePicture)}
                alt="Profile Preview"
                className="profile-picture-preview"
              />
            )}
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              required
            >
              <option value="student">Student</option>
              <option value="institute">Institute</option>
              <option value="admin">Admin</option>
            </select>
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">
          {isRegistering ? 'Register' : 'Login'}
        </button>
        <button type="button" className="back-button" onClick={handleBackButtonClick} style={{ marginTop: '10px' }}>
          Back to Home
        </button>
      </form>
      <p>
        {isRegistering ? 'Already have an account?' : 'Don’t have an account?'}
        <span
          onClick={() => setIsRegistering(!isRegistering)}
          className="toggle-register"
        >
          {isRegistering ? ' Login' : ' Register'}
        </span>
      </p>
    </div>
  );
};

export default Login;