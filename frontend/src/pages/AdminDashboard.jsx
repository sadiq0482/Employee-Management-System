import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getAdminDashboard } from '../services/dashboardService';

const COLORS = ['#0d6efd', '#198754', '#dc3545', '#ffc107', '#6f42c1', '#20c997'];

const StatCard = ({ label, value, color }) => (
  <div className="col-md-3 mb-3">
    <div className={`card border-0 shadow-sm border-start border-4 border-${color}`}>
      <div className="card-body">
        <div className="text-muted small">{label}</div>
        <div className="fs-3 fw-bold">{value}</div>
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminDashboard()
      .then(({ data }) => setData(data))
      .catch(() => setError('Could not load dashboard data.'));
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <p>Loading dashboard...</p>;

  const leavePieData = data.leave_stats.map((s) => ({ name: s.status, value: s.count }));

  return (
    <div>
      <h3 className="mb-4">Admin Dashboard</h3>

      <div className="row">
        <StatCard label="Total Employees" value={data.total_employees} color="primary" />
        <StatCard label="Total Departments" value={data.total_departments} color="info" />
        <StatCard label="Pending Leaves" value={data.pending_leaves} color="warning" />
        <StatCard label="Approved Leaves" value={data.approved_leaves} color="success" />
      </div>
      <div className="row">
        <StatCard label="Rejected Leaves" value={data.rejected_leaves} color="danger" />
        <StatCard label="Present Today" value={data.present_today} color="success" />
        <StatCard label="Absent Today" value={data.absent_today} color="secondary" />
      </div>

      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Employees by Department</h5>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.employees_by_department}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Leave Statistics</h5>
              {leavePieData.length === 0 ? (
                <p className="text-muted">No leave requests yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={leavePieData} dataKey="value" nameKey="name" outerRadius={100} label>
                      {leavePieData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}