import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../services/profileService';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const buildForm = (data) => ({
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    email: data.email || '',
    phone: data.employee?.phone || '',
    address: data.employee?.address || '',
    date_of_birth: data.employee?.date_of_birth || '',
    designation: data.employee?.designation || '',
    gender: data.employee?.gender || 'OTHER',
  });

  const load = async () => {
    const { data } = await getProfile();
    setProfile(data);
    setForm(buildForm(data));
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditClick = () => {
    setErrors({});
    setSuccess(false);
    setEditing(true);
  };

  const handleCancel = () => {
    setForm(buildForm(profile));
    setImageFile(null);
    setErrors({});
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (imageFile) {
        formData.append('profile_image', imageFile);
      }
      await updateProfile(formData);
      setSuccess(true);
      setImageFile(null);
      setEditing(false);
      load();
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: ['Something went wrong.'] });
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <p>Loading...</p>;

  const isEmployee = !!profile.employee;
  const imageUrl = profile.employee?.profile_image
    ? `http://127.0.0.1:8000${profile.employee.profile_image}`
    : null;

  const genderLabel = { MALE: 'Male', FEMALE: 'Female', OTHER: 'Other' };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">My Profile</h3>
        {!editing && (
          <button className="btn btn-primary" onClick={handleEditClick}>
            Edit Profile
          </button>
        )}
      </div>

      {success && <div className="alert alert-success">Profile updated!</div>}

      <div className="row">
        <div className="col-md-8">
          {!editing ? (
            // ---------- VIEW MODE (read-only) ----------
            <div className="card">
              <div className="card-body">
                <h5 className="mb-3">Account</h5>
                <table className="table table-sm">
                  <tbody>
                    <tr><th style={{ width: 180 }}>Username</th><td>{profile.username}</td></tr>
                    <tr><th>Name</th><td>{profile.first_name} {profile.last_name}</td></tr>
                    <tr><th>Email</th><td>{profile.email}</td></tr>
                  </tbody>
                </table>

                {isEmployee && (
                  <>
                    <h5 className="mb-3 mt-4">Employee Details</h5>
                    <table className="table table-sm">
                      <tbody>
                        <tr><th style={{ width: 180 }}>Employee ID</th><td>{profile.employee.employee_id}</td></tr>
                        <tr><th>Phone</th><td>{profile.employee.phone || <span className="text-muted">Not provided</span>}</td></tr>
                        <tr><th>Address</th><td>{profile.employee.address || <span className="text-muted">Not provided</span>}</td></tr>
                        <tr><th>Date of Birth</th><td>{profile.employee.date_of_birth || <span className="text-muted">Not provided</span>}</td></tr>
                        <tr><th>Gender</th><td>{genderLabel[profile.employee.gender] || profile.employee.gender}</td></tr>
                        <tr><th>Designation</th><td>{profile.employee.designation || <span className="text-muted">Not set</span>}</td></tr>
                        <tr><th>Department</th><td>{profile.employee.department_name || <span className="text-muted">Not assigned yet</span>}</td></tr>
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          ) : (
            // ---------- EDIT MODE ----------
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm">
              {errors.non_field_errors && (
                <div className="alert alert-danger">{[].concat(errors.non_field_errors).join(' ')}</div>
              )}

              <h5 className="mb-3">Account</h5>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input className="form-control" value={profile.username} disabled />
                <div className="form-text">Username cannot be changed.</div>
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
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} />
              </div>

              {isEmployee && (
                <>
                  <h5 className="mb-3 mt-4">Employee Details</h5>
                  <div className="mb-3">
                    <label className="form-label">Employee ID</label>
                    <input className="form-control" value={profile.employee.employee_id} disabled />
                    <div className="form-text">Assigned and confirmed by an admin.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input name="phone" className="form-control" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <textarea name="address" className="form-control" value={form.address} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" name="date_of_birth" className="form-control" value={form.date_of_birth || ''} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Gender</label>
                    <select name="gender" className="form-select" value={form.gender} onChange={handleChange}>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Designation</label>
                    <input name="designation" className="form-control" value={form.designation} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Department</label>
                    <input className="form-control" value={profile.employee.department_name || 'Not assigned yet'} disabled />
                    <div className="form-text">Department and salary are managed by an admin.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Profile Photo</label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="form-control"
                      onChange={(e) => setImageFile(e.target.files[0])}
                    />
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary me-2" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </form>
          )}
        </div>

        {isEmployee && (
          <div className="col-md-4 text-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Profile"
                className="rounded-circle shadow-sm"
                style={{ width: 160, height: 160, objectFit: 'cover' }}
              />
            ) : (
              <div
                className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center mx-auto"
                style={{ width: 160, height: 160 }}
              >
                No Photo
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}