import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth.js';

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || 'Signup failed');
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
        <p className="eyebrow">Join the conversation</p>
        <h1>Signup</h1>
        {error && <p className="alert alert--error">{error}</p>}
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
          <label>Username</label>
          <input name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="field">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <button className="button button--full" type="submit">Create account</button>
        </form>
        <p className="switch-copy">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </div>
  );
}

export default Signup;
