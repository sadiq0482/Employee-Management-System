import { useEffect, useState } from 'react';
import { getLeaves, cancelLeave } from '../services/leaveService';

const statusColors = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'secondary',
};

export default function LeaveHistory() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getLeaves();
      setLeaves(data.results || data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this leave request?')) return;
    try {
      await cancelLeave(id);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel.');
    }
  };

  return (
    <div>
      <h3 className="mb-4">My Leave History</h3>
      {loading ? (
        <p>Loading...</p>
      ) : leaves.length === 0 ? (
        <p className="text-muted">No leave requests yet.</p>
      ) : (
        <table className="table table-hover bg-white">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Admin Comment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((lv) => (
              <tr key={lv.id}>
                <td>{lv.leave_type_name}</td>
                <td>{lv.start_date}</td>
                <td>{lv.end_date}</td>
                <td>{lv.reason}</td>
                <td><span className={`badge bg-${statusColors[lv.status]}`}>{lv.status}</span></td>
                <td>{lv.admin_comment || '-'}</td>
                <td>
                  {lv.status === 'PENDING' && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(lv.id)}>
                      Cancel
                    </button>
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