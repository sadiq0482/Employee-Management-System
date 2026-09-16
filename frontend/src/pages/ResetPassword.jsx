import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const { uid, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/password-reset-confirm/', { uid, token, new_password: newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const data = err.response?.data;
      if (data?.new_password) {
        setError([].concat(data.new_password).join(' '));
      } else if (data?.detail) {
        setError(data.detail);
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card auth-card shadow-sm p-4" style={{ width: '380px' }}>
        <h3 className="mb-1 text-center">Reset Password</h3>
        <p className="text-muted text-center mb-4">Choose a new password</p>

        {success ? (
          <div className="alert alert-success">Password reset! Redirecting to login...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Saving...' : 'Reset Password'}
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