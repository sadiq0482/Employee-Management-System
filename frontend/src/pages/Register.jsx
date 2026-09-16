import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const initialForm = {
  username: '', email: '', password: '', first_name: '', last_name: '',
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    try {
      await api.post('/auth/register/', form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: ['Something went wrong.'] });
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (name) => errors[name] && (
    <div className="text-danger small">{[].concat(errors[name]).join(' ')}</div>
  );

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-sm p-4" style={{ width: '420px' }}>
        <h3 className="mb-1 text-center">Create Account</h3>
        <p className="text-muted text-center mb-4">Register as an employee</p>

        {success && <div className="alert alert-success">Account created! Redirecting to login...</div>}
        {errors.non_field_errors && (
          <div className="alert alert-danger">{[].concat(errors.non_field_errors).join(' ')}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input name="username" className="form-control" value={form.username} onChange={handleChange} required />
            {fieldError('username')}
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
            {fieldError('email')}
          </div>
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">First Name</label>
              <input name="first_name" className="form-control" value={form.first_name} onChange={handleChange} />
            </div>
            <div className="col">
              <label className="form-label">Last Name</label>
              <input name="last_name" className="form-control" value={form.last_name} onChange={handleChange} />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
            {fieldError('password')}
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={saving}>
            {saving ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}