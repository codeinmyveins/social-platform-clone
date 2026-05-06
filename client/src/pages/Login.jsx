import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth.js';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || 'Login failed');
      }
      const data = await res.json();
      login(data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-layout">
      <section className="panel auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Login</h1>
        {error && <p className="alert alert--error">{error}</p>}
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <button className="button button--full" type="submit">Login</button>
        </form>
        <p className="switch-copy">
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </section>
    </div>
  );
}

export default Login;
