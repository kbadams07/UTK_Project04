import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api.login(username, password);
      onLogin(data.username, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h1>PetLand Forum</h1>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <div className="error-message">{error}</div>}

        <button type="submit">Login</button>
      </form>
      <p>
        No account? <Link to="/register">Register here</Link>.
      </p>
    </div>
  );
}

export default LoginPage;
