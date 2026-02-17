// client/src/pages/auth/adminLogin.jsx
import { useState } from 'react';
import { adminLoginSchema } from '../../schemas/admin';
import useAdminAuth from '../../hooks/useAdminAuth';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    const parsed = adminLoginSchema.safeParse(form);
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง');
      return;
    }
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/admin/dashboard', { replace: true });
    } catch (e2) {
      setErr('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  // ถ้าเข้าสู่ระบบแล้ว ให้เด้งไปหน้า dashboard ทันที
  if (isAuthenticated) {
    navigate('/admin/dashboard', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-t-3xl p-8 border-b border-white/10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50 transform rotate-6">
                <Shield className="w-10 h-10 text-white transform -rotate-6" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-slate-900 animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            Admin
          </h1>
          <p className="text-center text-slate-300 text-sm">
            ระบบจัดการสำหรับผู้ดูแลระบบ มหาวิทยาลัยเทคโนโลยีราชมงคล
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-b-3xl p-8 shadow-2xl border border-white/10">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                ชื่อผู้ใช้
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                <input
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  placeholder="กรอกชื่อผู้ใช้"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error Message */}
            {err && (
              <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-300 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm font-medium">{err}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
              <Lock className="h-3.5 w-3.5" />
              <span>การเชื่อมต่อของคุณได้รับการเข้ารหัสอย่างปลอดภัย</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            © 2025 Admin Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}