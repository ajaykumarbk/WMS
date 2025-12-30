import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api'; // ✅ shared API client

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      return setError('Passwords do not match');
    }

    setError('');
    setSuccess('');

    try {
      // ✅ SAME-DOMAIN API CALL
      const res = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password
      });

      // Save token
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

      setSuccess('Registered! Redirecting...');
      setTimeout(() => navigate('/'), 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Register</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Full Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.t
