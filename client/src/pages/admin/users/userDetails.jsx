import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const token = localStorage.getItem('admin_token'); // เก็บจากตอน login
    if (!token) return;

    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (q.trim()) params.set('q', q.trim());

    fetch(`http://localhost:3000/api/admin/users?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include', // เผื่อจะสลับไปใช้ cookie ในอนาคต
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setUsers(data.data || []);
        setTotal(data.total || 0);
      })
      .catch((err) => {
        console.error('Load users failed:', err);
      });
  }, [page, q]);

  return (
    <div style={{ padding: 16 }}>
      <h1>Users</h1>

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder=\"ค้นหาชื่อหรืออีเมล...\"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ padding: 8, width: 280, marginRight: 8 }}
        />
        <button onClick={() => setPage(1)}>ค้นหา</button>
      </div>

      <table border=\"1\" cellPadding=\"6\" cellSpacing=\"0\">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Full name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created at</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan=\"7\">No data</td></tr>
          ) : users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
              <td>{new Date(u.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span style={{ margin: '0 8px' }}>
          Page {page} / {Math.max(1, Math.ceil(total / pageSize))}
        </span>
        <button disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}