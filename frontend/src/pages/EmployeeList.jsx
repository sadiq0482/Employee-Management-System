import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEmployees, deleteEmployee } from '../services/employeeService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const loadEmployees = async (searchTerm = search, pageNum = page) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: pageNum };
      if (searchTerm) params.search = searchTerm;
      const { data } = await getEmployees(params);
      setEmployees(data.results || data);
      setCount(data.count ?? (data.results || data).length);
    } catch (err) {
      setError('Could not load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees(search, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadEmployees(search, 1);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete employee "${name}"? This cannot be undone.`)) return;
    try {
      await deleteEmployee(id);
      loadEmployees(search, page);
    } catch (err) {
      alert('Failed to delete employee.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Employees</h3>
        <Link to="/admin/employees/add" className="btn btn-primary">+ Add Employee</Link>
      </div>

      <form className="d-flex mb-3" onSubmit={handleSearch}>
        <input
          type="text"
          className="form-control me-2"
          placeholder="Search by name, employee ID, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-outline-secondary" type="submit">Search</button>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <LoadingSpinner label="Loading employees..." />
      ) : employees.length === 0 ? (
        <p className="text-muted">No employees found.</p>
      ) : (
        <>
          <table className="table table-hover bg-white">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.employee_id}</td>
                  <td>{emp.user.first_name} {emp.user.last_name}</td>
                  <td>{emp.department_name || '-'}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.phone}</td>
                  <td>
                    <Link to={`/admin/employees/${emp.id}/edit`} className="btn btn-sm btn-outline-primary me-2">
                      Edit
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(emp.id, `${emp.user.first_name} ${emp.user.last_name}`)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <nav>
              <ul className="pagination">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
}