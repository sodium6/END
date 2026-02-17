// src/pages/auth/ResetPassword.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOtp, verifyResetOtp, resetPassword } from "../../services/authApi";
import { KeyRound, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [stId, setStId] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    const v = (stId || "").trim();
    if (!v) {
      setErr("กรุณากรอก รหัสนิสิต/รหัสผู้ใช้ (st_id_canonical)");
      return;
    }
    setLoading(true);
    try {
      await requestOtp(v);
      setMsg("ส่งรหัส OTP ไปที่อีเมลของคุณแล้ว (อายุ 10 นาที)");
      setStep(2);
      setCooldown(60);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "ส่ง OTP ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    const v = (otp || "").trim();
    if (!/^\d{6}$/.test(v)) {
      setErr("กรุณากรอก OTP เป็นเลข 6 หลัก");
      return;
    }
    setLoading(true);
    try {
      const data = await verifyResetOtp(stId.trim(), v);
      setResetToken(data.reset_token);
      setMsg("ยืนยัน OTP สำเร็จ กรุณาตั้งรหัสผ่านใหม่");
      setStep(3);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "ยืนยัน OTP ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    if ((newPass || "").length < 8) {
      setErr("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (newPass !== confirmPass) {
      setErr("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(stId.trim(), resetToken, newPass);
      setMsg("ตั้งรหัสผ่านใหม่สำเร็จแล้ว กำลังนำคุณไปหน้าเข้าสู่ระบบ...");
      setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0) return;
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      await requestOtp(stId.trim());
      setMsg("ส่งรหัส OTP ใหม่แล้ว โปรดตรวจสอบอีเมล");
      setCooldown(60);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "ส่ง OTP รอบใหม่ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-t-2xl shadow-xl p-8 border-b-2 border-indigo-100">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            รีเซ็ตรหัสผ่าน
          </h1>
          <p className="text-center text-gray-600 mt-2 text-sm">
            {step === 1 && "กรอกรหัสนิสิตเพื่อขอรหัส OTP"}
            {step === 2 && "ตรวจสอบอีเมลและกรอกรหัส OTP"}
            {step === 3 && "ตั้งรหัสผ่านใหม่ของคุณ"}
          </p>
          <div className="flex justify-center mt-6 gap-2">
            <div className={`h-2 w-16 rounded-full transition-all ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`h-2 w-16 rounded-full transition-all ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`h-2 w-16 rounded-full transition-all ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-xl p-8">
          {err && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{err}</p>
            </div>
          )}
          {msg && (
            <div className="mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-700 text-sm">{msg}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  รหัสนิสิต / รหัสผู้ใช้
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={stId}
                    onChange={(e) => setStId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    placeholder="เช่น 666051000394"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-lg hover:shadow-xl disabled:shadow-none transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? "กำลังส่ง..." : "ขอรหัส OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-6">
                <p className="text-sm text-gray-600">ส่งรหัส OTP ไปที่อีเมลของ</p>
                <p className="font-bold text-indigo-700 text-lg mt-1">{stId}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                  กรอกรหัส OTP (6 หลัก)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 tracking-[0.5em] text-center text-2xl font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                  placeholder="• • • • • •"
                  required
                />
                <div className="text-center mt-4 text-sm text-gray-600">
                  ไม่ได้รับรหัส?{" "}
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={cooldown > 0 || loading}
                    className="font-semibold text-indigo-600 hover:text-indigo-700 underline disabled:text-gray-400 disabled:no-underline transition-colors"
                  >
                    ขอรหัสใหม่
                  </button>
                  {cooldown > 0 && <span className="ml-1 text-gray-500">({cooldown}s)</span>}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-lg hover:shadow-xl disabled:shadow-none transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? "กำลังตรวจสอบ..." : "ยืนยัน OTP"}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100 mb-6">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">ยืนยัน OTP สำเร็จสำหรับ</p>
                <p className="font-bold text-green-700 text-lg mt-1">{stId}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  รหัสผ่านใหม่
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-lg hover:shadow-xl disabled:shadow-none transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/sign-in')}
              className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              ← กลับไปหน้าเข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}