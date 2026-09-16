import { useEffect, useState } from 'react';
import { getAttendance, checkIn, checkOut } from '../services/attendanceService';

const statusColors = {
  PRESENT: 'success',
  ABSENT: 'danger',
  HALF_DAY: 'warning',
  LEAVE: 'secondary',
};

const formatTime = (t) => (t ? t.slice(0, 8) : '-');

export default function MyAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAttendance();
      setRecords(data.results || data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCheckIn = async () => {
    setError('');
    setMessage('');
    try {
      await checkIn();
      setMessage('Checked in successfully!');
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to check in.');
    }
  };

  const handleCheckOut = async () => {
    setError('');
    setMessage('');
    try {
      await checkOut();
      setMessage('Checked out successfully!');
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to check out.');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todaysRecord = records.find((r) => r.date === today);

  return (
    <div>
      <h3 className="mb-4">My Attendance</h3>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex align-items-center justify-content-between">
          <div>
            <div className="text-muted small">Today</div>
            <div className="fw-bold">
              {todaysRecord
                ? `Checked in: ${formatTime(todaysRecord.check_in)} · Checked out: ${formatTime(todaysRecord.check_out)}`
                : 'Not checked in yet'}
            </div>
          </div>
          <div>
            <button className="btn btn-success me-2" onClick={handleCheckIn}>
              Check In
            </button>
            <button className="btn btn-outline-secondary" onClick={handleCheckOut}>
              Check Out
            </button>
          </div>
        </div>
        {message && <div className="alert alert-success m-3 mb-0 py-2">{message}</div>}
        {error && <div className="alert alert-danger m-3 mb-0 py-2">{error}</div>}
      </div>

      <h5 className="mb-3">History</h5>
      {loading ? (
        <p>Loading...</p>
      ) : records.length === 0 ? (
        <p className="text-muted">No attendance records yet.</p>
      ) : (
        <table className="table table-hover bg-white">
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{formatTime(r.check_in)}</td>
                <td>{formatTime(r.check_out)}</td>
                <td><span className={`badge bg-${statusColors[r.status]}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}