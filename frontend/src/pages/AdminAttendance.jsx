import { useEffect, useState } from 'react';
import { getAttendance, createAttendance, updateAttendance } from '../services/attendanceService';
import { getEmployees } from '../services/employeeService';
import LoadingSpinner from '../components/LoadingSpinner';

const statusColors = {
  PRESENT: 'success',
  ABSENT: 'danger',
  HALF_DAY: 'warning',
  LEAVE: 'secondary',
};

const formatTime = (t) => (t ? t.slice(0, 8) : '-');

const emptyForm = { employee: '', date: '', status: 'PRESENT', check_in: '', check_out: '' };

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ employee: '', date: '', status: '' });
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getEmployees().then(({ data }) => setEmployees(data.results || data));
  }, []);

  const load = async (activeFilters = filters) => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(activeFilters).filter(([, v]) => v !== '')
      );
      const { data } = await getAttendance(params);
      setRecords(data.results || data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    load(updated);
  };

  const clearFilters = () => {
    const cleared = { employee: '', date: '', status: '' };
    setFilters(cleared);
    load(cleared);
  };

  const hasActiveFilters = filters.employee || filters.date || filters.status;

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setForm({
      employee: record.employee,
      date: record.date,
      status: record.status,
      check_in: record.check_in ? record.check_in.slice(0, 5) : '',
      check_out: record.check_out ? record.check_out.slice(0, 5) : '',
    });
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.check_in) delete payload.check_in;
      if (!payload.check_out) delete payload.check_out;

      if (editingId) {
        await updateAttendance(editingId, payload);
      } else {
        await createAttendance(payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
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
      <h3 className="mb-4">Attendance</h3>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3">{editingId ? 'Edit Attendance Record' : 'Register Attendance'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Employee</label>
                <select name="employee" className="form-select" value={form.employee} onChange={handleFormChange} required>
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employee_id} - {emp.user.first_name} {emp.user.last_name}
                    </option>
                  ))}
                </select>
                {fieldError('employee')}
              </div>
              <div className="col-md-4">
                <label className="form-label">Date</label>
                <input type="date" name="date" className="form-control" value={form.date} onChange={handleFormChange} required />
                {fieldError('date')}
              </div>
              <div className="col-md-4">
                <label className="form-label">Status</label>
                <select name="status" className="form-select" value={form.status} onChange={handleFormChange}>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="LEAVE">Leave</option>
                </select>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Check In (optional)</label>
                <input type="time" name="check_in" className="form-control" value={form.check_in} onChange={handleFormChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Check Out (optional)</label>
                <input type="time" name="check_out" className="form-control" value={form.check_out} onChange={handleFormChange} />
                {fieldError('check_out')}
              </div>
            </div>

            {errors.non_field_errors && (
              <div className="alert alert-danger py-2">{[].concat(errors.non_field_errors).join(' ')}</div>
            )}

            <button type="submit" className="btn btn-primary me-2" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Record' : 'Register Attendance'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">All Records</h5>
        {hasActiveFilters && (
          <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <select name="employee" className="form-select" value={filters.employee} onChange={handleFilterChange}>
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.employee_id} - {emp.user.first_name} {emp.user.last_name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <input type="date" name="date" className="form-control" value={filters.date} onChange={handleFilterChange} />
        </div>
        <div className="col-md-4">
          <select name="status" className="form-select" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="LEAVE">Leave</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading attendance..." />
      ) : records.length === 0 ? (
        <p className="text-muted">No attendance records found.</p>
      ) : (
        <table className="table table-hover bg-white">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>{r.employee_name} ({r.employee_code})</td>
                <td>{r.date}</td>
                <td>{formatTime(r.check_in)}</td>
                <td>{formatTime(r.check_out)}</td>
                <td><span className={`badge bg-${statusColors[r.status]}`}>{r.status}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(r)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}