// client/src/pages/auth/adminLogin.jsx
import { useState } from 'react';
import { adminLoginSchema } from '../../schemas/admin';
import useAdminAuth from '../../hooks/useAdminAuth';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr] = useState(null);
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    // Note: You might need to update adminLoginSchema to use username instead of email
    const parsed = adminLoginSchema.safeParse(form);
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง');
      return;
    }
    try {
      await login(form.username, form.password);
      navigate('/admin/dashboard', { replace: true });
    } catch (e2) {
      setErr('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  // ถ้าเข้าสู่ระบบแล้ว ให้เด้งไปหน้า dashboard ทันที
  if (isAuthenticated) {
    navigate('/admin/dashboard', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-100">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded-2xl shadow w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <input name="username" value={form.username} onChange={onChange} placeholder="Username" className="w-full border rounded px-3 py-2" />
        <input name="password" type="password" value={form.password} onChange={onChange} placeholder="Password" className="w-full border rounded px-3 py-2" />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="w-full rounded-xl bg-slate-900 text-white py-2">เข้าสู่ระบบ</button>
      </form>
    </div>
  );
}
