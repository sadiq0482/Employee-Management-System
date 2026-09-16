import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/password-reset/', { email });
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card auth-card shadow-sm p-4" style={{ width: '380px' }}>
        <h3 className="mb-1 text-center">Forgot Password</h3>
        <p className="text-muted text-center mb-4">We'll send you a reset link</p>

        {submitted ? (
          <div className="alert alert-success">
            If an account with that email exists, a reset link has been sent.
            (For local testing: check your Django terminal — the email prints there.)
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center mt-3 mb-0">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}