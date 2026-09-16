import { useEffect, useState } from 'react';
import { getEmployeeDashboard } from '../services/dashboardService';

const statusColors = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'secondary',
};

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getEmployeeDashboard()
      .then(({ data }) => setData(data))
      .catch(() => setError('Could not load dashboard data.'));
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h3 className="mb-1">Welcome, {data.employee_name}</h3>
      <p className="text-muted mb-4">
        {data.employee_id} · {data.department || 'No department'} · {data.designation}
      </p>

      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Today's Attendance</div>
              <div className="fs-5 fw-bold">{data.todays_attendance}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Total Leave Requests</div>
              <div className="fs-4 fw-bold">{data.total_leave_requests}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Pending</div>
              <div className="fs-4 fw-bold">{data.pending_leaves}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Approved</div>
              <div className="fs-4 fw-bold">{data.approved_leaves}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mt-3">
        <div className="card-body">
          <h5 className="mb-3">Recent Leave Requests</h5>
          {data.recent_leave_requests.length === 0 ? (
            <p className="text-muted">No leave requests yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_leave_requests.map((lv) => (
                  <tr key={lv.id}>
                    <td>{lv.leave_type_name}</td>
                    <td>{lv.start_date}</td>
                    <td>{lv.end_date}</td>
                    <td><span className={`badge bg-${statusColors[lv.status]}`}>{lv.status}</span></td>
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