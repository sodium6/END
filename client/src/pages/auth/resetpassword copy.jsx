// src/pages/auth/ResetPassword.jsx
import React, { useEffect, useState } from "react";
import { requestOtp, verifyOtp, resetPassword } from "../../services/authApi";

export default function ResetPassword() {
  const [step, setStep] = useState(1); // 1=request, 2=verify, 3=reset
  const [stId, setStId] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState(""); // จาก verifyOtp
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // resend OTP cooldown
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
      setCooldown(60); // 60 วิ ก่อนส่งซ้ำ
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
      const data = await verifyOtp(stId.trim(), v);
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
      setMsg("ตั้งรหัสผ่านใหม่สำเร็จแล้ว คุณสามารถเข้าสู่ระบบด้วยรหัสใหม่ได้");
      // จะให้เด้งกลับหน้า login ก็ได้ เช่น:
      // navigate('/login');
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
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">รีเซ็ตรหัสผ่านด้วย OTP</h1>

      {err && (
        <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700">
          {err}
        </div>
      )}
      {msg && (
        <div className="p-3 rounded border border-emerald-200 bg-emerald-50 text-emerald-700">
          {msg}
        </div>
      )}

      {/* STEP 1: ขอ OTP */}
      {step === 1 && (
        <form onSubmit={handleRequestOtp} className="space-y-4 bg-white p-5 rounded border">
          <label className="block text-sm font-medium">รหัสนิสิต/รหัสผู้ใช้ (st_id_canonical)</label>
          <input
            type="text"
            value={stId}
            onChange={(e) => setStId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="เช่น 64011234"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "กำลังส่ง..." : "ขอรหัส OTP"}
          </button>
        </form>
      )}

      {/* STEP 2: กรอก OTP */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4 bg-white p-5 rounded border">
          <div>
            <div className="text-sm text-gray-600 mb-1">
              กำลังรีเซ็ตให้ผู้ใช้: <b>{stId}</b>
            </div>
            <label className="block text-sm font-medium">รหัส OTP (6 หลัก)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full border rounded px-3 py-2 tracking-widest text-center text-lg"
              placeholder="• • • • • •"
              required
            />
            <div className="text-xs text-gray-500 mt-2">
              หากไม่ได้รับรหัส คุณสามารถ{" "}
              <button
                type="button"
                onClick={resendOtp}
                disabled={cooldown > 0 || loading}
                className="text-blue-600 underline disabled:text-gray-400"
              >
                ขอรหัสใหม่
              </button>{" "}
              {cooldown > 0 && <span>(รอ {cooldown}s)</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300"
          >
            {loading ? "กำลังตรวจสอบ..." : "ยืนยัน OTP"}
          </button>
        </form>
      )}

      {/* STEP 3: ตั้งรหัสผ่านใหม่ */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4 bg-white p-5 rounded border">
          <div className="text-sm text-gray-600">
            ยืนยัน OTP สำเร็จสำหรับ <b>{stId}</b> โปรดตั้งรหัสผ่านใหม่
          </div>

          <label className="block text-sm font-medium">รหัสผ่านใหม่</label>
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            required
          />

          <label className="block text-sm font-medium">ยืนยันรหัสผ่านใหม่</label>
          <input
            type="password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {loading ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
          </button>
        </form>
      )}
    </div>
  );
}
