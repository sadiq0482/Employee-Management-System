import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEmployee } from '../services/employeeService';
import { getDepartments } from '../services/departmentService';

const initialForm = {
  username: '', email: '', password: '', first_name: '', last_name: '',
  employee_id: '', department: '', joining_date: '', salary: '',
};

export default function AddEmployee() {
  const [form, setForm] = useState(initialForm);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getDepartments().then(({ data }) => setDepartments(data.results || data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    try {
      await createEmployee(form);
      navigate('/admin/employees');
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ non_field_errors: ['Something went wrong.'] });
      }
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (name) => errors[name] && (
    <div className="text-danger small">{[].concat(errors[name]).join(' ')}</div>
  );

  return (
    <div>
      <h3 className="mb-4">Add Employee</h3>
      <div className="alert alert-info">
        You're creating the login account and assigning them to a department. The employee
        will fill in their own phone, address, gender, and job title after logging in.
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm" style={{ maxWidth: 700 }}>
        <h5 className="mb-3">Login Details</h5>
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Username</label>
            <input name="username" className="form-control" value={form.username} onChange={handleChange} required />
            {fieldError('username')}
          </div>
          <div className="col">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
            {fieldError('email')}
          </div>
        </div>
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
            {fieldError('password')}
          </div>
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

        <h5 className="mb-3 mt-4">Employment Details</h5>
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Employee ID</label>
            <input name="employee_id" className="form-control" value={form.employee_id} onChange={handleChange} required />
            {fieldError('employee_id')}
          </div>
          <div className="col">
            <label className="form-label">Department</label>
            <select name="department" className="form-select" value={form.department} onChange={handleChange} required>
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {fieldError('department')}
          </div>
        </div>
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Joining Date</label>
            <input type="date" name="joining_date" className="form-control" value={form.joining_date} onChange={handleChange} required />
          </div>
          <div className="col">
            <label className="form-label">Salary</label>
            <input type="number" step="0.01" name="salary" className="form-control" value={form.salary} onChange={handleChange} required />
            {fieldError('salary')}
          </div>
        </div>

        {errors.non_field_errors && (
          <div className="alert alert-danger">{[].concat(errors.non_field_errors).join(' ')}</div>
        )}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Employee'}
        </button>
      </form>
    </div>
  );
}