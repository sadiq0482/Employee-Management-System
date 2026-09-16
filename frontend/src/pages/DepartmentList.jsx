import { useEffect, useState } from 'react';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../services/departmentService';

const emptyForm = { name: '', description: '' };

export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const { data } = await getDepartments();
      setDepartments(data.results || data);
    } catch (err) {
      setErrors({ non_field_errors: ['Could not load departments.'] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (dept) => {
    setEditingId(dept.id);
    setForm({ name: dept.name, description: dept.description || '' });
    setErrors({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    try {
      if (editingId) {
        await updateDepartment(editingId, form);
      } else {
        await createDepartment(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      loadDepartments();
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: ['Something went wrong.'] });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete department "${name}"? Employees in it will be unassigned, not deleted.`)) return;
    try {
      await deleteDepartment(id);
      loadDepartments();
    } catch (err) {
      alert('Failed to delete department.');
    }
  };

  const fieldError = (name) => errors[name] && (
    <div className="text-danger small">{[].concat(errors[name]).join(' ')}</div>
  );

  return (
    <div>
      <h3 className="mb-4">Departments</h3>

      <div className="row">
        <div className="col-md-5 mb-4">
          <div className="bg-white p-4 rounded shadow-sm">
            <h5 className="mb-3">{editingId ? 'Edit Department' : 'Add Department'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                {fieldError('name')}
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              {errors.non_field_errors && (
                <div className="alert alert-danger py-2">
                  {[].concat(errors.non_field_errors).join(' ')}
                </div>
              )}

              <button type="submit" className="btn btn-primary me-2" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add Department'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="col-md-7">
          {loading ? (
            <p>Loading...</p>
          ) : departments.length === 0 ? (
            <p className="text-muted">No departments yet.</p>
          ) : (
            <table className="table table-hover bg-white">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Employees</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id}>
                    <td>{dept.name}</td>
                    <td>{dept.description || '-'}</td>
                    <td>{dept.employee_count}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(dept)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(dept.id, dept.name)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}