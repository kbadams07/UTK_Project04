import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user changes field
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await api.register(form);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      if (err.field) {
        setErrors((prev) => ({ ...prev, [err.field]: err.message }));
      } else {
        setErrors((prev) => ({ ...prev, general: err.message }));
      }
    }
  };

  return (
    <div className="auth-container">
      <h1>PetLand Forum</h1>
      <h2>Register user</h2>

      <form onSubmit={handleSubmit} className="auth-form register-form">
        <div className="field-row">
          <label>
            Username
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
            />
          </label>
          {errors.username && (
            <span className="field-error">{errors.username}</span>
          )}
        </div>

        <div className="field-row">
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
          </label>
          {errors.password && (
            <span className="field-error">{errors.password}</span>
          )}
        </div>

        <div className="field-row">
          <label>
            Repeat Password
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </label>
          {errors.confirmPassword && (
            <span className="field-error">{errors.confirmPassword}</span>
          )}
        </div>

        <div className="field-row checkbox-row">
          <label>
            <input
              type="checkbox"
              name="acceptedTerms"
              checked={form.acceptedTerms}
              onChange={handleChange}
            />{' '}
            I agree to the Terms and Conditions and Privacy Policy
          </label>
          {errors.acceptedTerms && (
            <span className="field-error">{errors.acceptedTerms}</span>
          )}
        </div>

        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        <button type="submit">Register</button>
      </form>

      <p>
        Already registered? <Link to="/login">Login here</Link>.
      </p>
    </div>
  );
}

export default RegisterPage;
