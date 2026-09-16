import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEmployee, updateEmployee } from '../services/employeeService';
import { getDepartments } from '../services/departmentService';

const initialForm = {
  email: '', first_name: '', last_name: '',
  employee_id: '', department: '', joining_date: '', salary: '',
};

export default function EditEmployee() {
  const { id } = useParams();
  const [employeeData, setEmployeeData] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([getEmployee(id), getDepartments()]);
        const emp = empRes.data;
        setEmployeeData(emp);
        setForm({
          email: emp.user.email || '',
          first_name: emp.user.first_name || '',
          last_name: emp.user.last_name || '',
          employee_id: emp.employee_id || '',
          department: emp.department || '',
          joining_date: emp.joining_date || '',
          salary: emp.salary || '',
        });
        setDepartments(deptRes.data.results || deptRes.data);
      } catch (err) {
        setErrors({ non_field_errors: ['Could not load employee.'] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    try {
      await updateEmployee(id, form);
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

  if (loading) return <p>Loading...</p>;

  const imageUrl = employeeData?.profile_image
    ? `http://127.0.0.1:8000${employeeData.profile_image}`
    : null;

  return (
    <div>
      <h3 className="mb-4">Edit Employee</h3>

      <div className="row">
        {/* Read-only card: what the employee entered themselves */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body text-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  className="rounded-circle mb-3"
                  style={{ width: 100, height: 100, objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: 100, height: 100 }}
                >
                  No Photo
                </div>
              )}
              <h5 className="mb-0">
                {employeeData.user.first_name} {employeeData.user.last_name}
              </h5>
              <p className="text-muted small mb-3">{employeeData.user.username}</p>

              <table className="table table-sm text-start">
                <tbody>
                  <tr><th>Phone</th><td>{employeeData.phone || <span className="text-muted">Not provided yet</span>}</td></tr>
                  <tr><th>Address</th><td>{employeeData.address || <span className="text-muted">Not provided yet</span>}</td></tr>
                  <tr><th>Gender</th><td>{employeeData.gender}</td></tr>
                  <tr><th>Date of Birth</th><td>{employeeData.date_of_birth || <span className="text-muted">Not provided yet</span>}</td></tr>
                  <tr><th>Designation</th><td>{employeeData.designation}</td></tr>
                </tbody>
              </table>
              <div className="form-text text-start">
                These fields are entered by the employee themselves via their Profile page.
              </div>
            </div>
          </div>
        </div>

        {/* Editable: admin-controlled employment fields */}
        <div className="col-md-8">
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm">
            <h5 className="mb-3">Login Details</h5>
            <div className="row mb-3">
              <div className="col">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                {fieldError('email')}
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
              {saving ? 'Saving...' : 'Update Employee'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}