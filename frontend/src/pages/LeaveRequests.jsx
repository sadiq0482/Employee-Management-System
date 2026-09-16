import { useEffect, useState } from 'react';
import { getLeaves, approveLeave, rejectLeave } from '../services/leaveService';

const statusColors = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'secondary',
};

export default function LeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (statusValue = '') => {
    setLoading(true);
    try {
      const { data } = await getLeaves(statusValue ? { status: statusValue } : {});
      setLeaves(data.results || data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    load(value);
  };

  const handleApprove = async (id) => {
    const comment = window.prompt('Optional comment for this approval:', '') || '';
    try {
      await approveLeave(id, comment);
      load(statusFilter);
    } catch (err) {
      alert('Failed to approve. ' + (err.response?.data?.detail || ''));
    }
  };

  const handleReject = async (id) => {
    const comment = window.prompt('Reason for rejection:', '') || '';
    try {
      await rejectLeave(id, comment);
      load(statusFilter);
    } catch (err) {
      alert('Failed to reject. ' + (err.response?.data?.detail || ''));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Leave Requests</h3>
        <select className="form-select" style={{ width: 200 }} value={statusFilter} onChange={handleFilterChange}>
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : leaves.length === 0 ? (
        <p className="text-muted">No leave requests found.</p>
      ) : (
        <table className="table table-hover bg-white">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((lv) => (
              <tr key={lv.id}>
                <td>{lv.employee_name} ({lv.employee_code})</td>
                <td>{lv.leave_type_name}</td>
                <td>{lv.start_date}</td>
                <td>{lv.end_date}</td>
                <td>{lv.reason}</td>
                <td><span className={`badge bg-${statusColors[lv.status]}`}>{lv.status}</span></td>
                <td>
                  {lv.status === 'PENDING' && (
                    <>
                      <button className="btn btn-sm btn-success me-2" onClick={() => handleApprove(lv.id)}>
                        Approve
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleReject(lv.id)}>
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}