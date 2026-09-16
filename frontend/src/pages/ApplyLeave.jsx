import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaveTypes, applyLeave } from '../services/leaveService';

const initialForm = { leave_type: '', start_date: '', end_date: '', reason: '' };

export default function ApplyLeave() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getLeaveTypes().then(({ data }) => setLeaveTypes(data.results || data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    setSaving(true);
    try {
      await applyLeave(form);
      setSuccess(true);
      setForm(initialForm);
      setTimeout(() => navigate('/employee/leaves/history'), 1200);
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
    <div>
      <h3 className="mb-4">Apply for Leave</h3>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm" style={{ maxWidth: 600 }}>
        {success && <div className="alert alert-success">Leave request submitted!</div>}

        <div className="mb-3">
          <label className="form-label">Leave Type</label>
          <select name="leave_type" className="form-select" value={form.leave_type} onChange={handleChange} required>
            <option value="">Select leave type</option>
            {leaveTypes.map((lt) => (
              <option key={lt.id} value={lt.id}>{lt.name} (max {lt.maximum_days} days)</option>
            ))}
          </select>
          {fieldError('leave_type')}
        </div>

        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Start Date</label>
            <input type="date" name="start_date" className="form-control" value={form.start_date} onChange={handleChange} required />
            {fieldError('start_date')}
          </div>
          <div className="col">
            <label className="form-label">End Date</label>
            <input type="date" name="end_date" className="form-control" value={form.end_date} onChange={handleChange} required />
            {fieldError('end_date')}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Reason</label>
          <textarea name="reason" className="form-control" rows="3" value={form.reason} onChange={handleChange} required />
          {fieldError('reason')}
        </div>

        {errors.non_field_errors && (
          <div className="alert alert-danger">{[].concat(errors.non_field_errors).join(' ')}</div>
        )}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}