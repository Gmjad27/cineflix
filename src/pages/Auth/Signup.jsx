import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  // const [formData, setFormData] = useState({
  //   name: '',
  //   email: '',
  //   password: '',
  //   confirmPassword: ''
  // });

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate('')
  // const [name, setName] = useState()

  const [error, setError] = useState('');

  // Handle input changes
  // const handleChange = (e) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value
  //   });
  // };

  const handleSignup = async (e) => {
    e.preventDefault();
    // const { name, email, password, confirmPassword } = formData;





    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }


    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }


    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }


    const res = await fetch("https://backend-f7cf.vercel.app/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    });

    const data = await res.json();
    alert(data.message);
    navigate("/login");

    setError('');
    alert(`Welcome to Cineflix, ${name}! Account created.`);
  };


  // console.log('Registering User:', formData);

  return (
    <div className="login-page">
      <div className="background-overlay"></div>

      <div className="login-container" style={{ minHeight: '680px' }}>
        <div className="logo-area">
          <h1 className="logo-text">CINE<span className="logo-highlight">FLIX</span></h1>
        </div>

        <form className="login-form" onSubmit={handleSignup}>
          <h2>Sign Up</h2>

          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
              }}
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
              }}
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={
                (e) => {
                  setPassword(e.target.value)
                }
              }
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
              }}
            />
          </div>

          <button type="submit" className="signin-btn">Register</button>
        </form>

        <div className="login-footer">
          <p>Already have an account? <a href="/login" className="signup-link">Sign in now</a>.</p>
          <p className="recaptcha-text">
            By clicking Register, you agree to our Terms of Use and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );

};

export default Signup;