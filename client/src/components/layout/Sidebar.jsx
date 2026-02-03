import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser, getProfile, deleteAccount } from "../../services/authApi";
import { User, Settings, Lock, LogOut, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fmtStid = (raw) => {
      if (!raw) return "-";
      const d = String(raw).replace(/\D/g, "");
      return d.length === 12 ? d.slice(0, 11) + "-" + d.slice(11) : raw;
    };

    const fetchProfile = async () => {
      try {
        const payload = await getProfile(); // ✅ ได้ data ตรง ๆ เลย
        const u = payload?.user ?? payload;

        if (!u) {
          setUser(null);
          return;
        }

        setUser({
          displayName:
            u.display_name ||
            u.fullName ||               // ✅ ใช้ fullName จาก BE
            u.name ||                   // เผื่อ BE ส่ง name
            u.email ||
            "ผู้ใช้",
          stid: u.st_id || fmtStid(u.st_id_canonical),
          initial:
            u.first_name_en?.charAt(0) ||
            "น",
          profile_pic: u.profile_pic,
        });
      } catch (err) {
        console.error("โหลดโปรไฟล์ล้มเหลว:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    window.addEventListener('user-profile-updated', fetchProfile);
    return () => window.removeEventListener('user-profile-updated', fetchProfile);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/sign-in");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ คำเตือน: คุณแน่ใจหรือไม่ที่จะลบบัญชี?")) return;
    try {
      await deleteAccount();
      alert("ลบบัญชีเรียบร้อย");
      navigate("/sign-in");
    } catch (e) {
      alert("ลบบัญชีไม่สำเร็จ");
    }
  };

  return (
    <div className="fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-40 flex flex-col w-78">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-green-50/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg
              className="text-white h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 text-base">
              E-Portfolio
            </span>
            <span className="text-xs text-slate-500">ระบบช่วยทำ Portfolio</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <ul className="space-y-0.5">
          <li>
            <Link
              to="/dashboard"
              className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <span className="text-sm">หน้าแดชน์บอร์ด</span>
            </Link>
          </li>
          <li>
            <Link
              to="/my-portfolio"
              className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <span className="text-sm">ข้อมูลในพอร์ตฟอลิโอ</span>
            </Link>
          </li>
          <li>
            <Link
              to="/public-relations"
              className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <span className="text-sm">ประชาสัมพันธ์</span>
            </Link>
          </li>
          <li>
            <Link
              to="/template/view"
              className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <span className="text-sm">เทมเพลต พอร์ตฟอลิโอ</span>
            </Link>
          </li>
          <li>
            <Link
              to="/certificate"
              className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <span className="text-sm">ใบเกียรติบัตร</span>
            </Link>
          </li>




        </ul>
      </nav>

      {/* Footer User Menu */}
      <div className="mt-auto border-t border-slate-200 relative p-3">

        {/* Dropdown Popup (Above Footer) */}
        {showMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl shadow-lg border border-slate-100 py-2 animate-in fade-in slide-in-from-bottom-2 z-50">
            <Link to="/profile" className="flex items-center space-x-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors">
              <User size={18} />
              <span className="text-sm">ข้อมูลส่วนตัว</span>
            </Link>
            <Link to="/profile" className="flex items-center space-x-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors">
              <Settings size={18} />
              <span className="text-sm">ตั้งค่าโปรไฟล์</span>
            </Link>
            <Link to="/reset-password" className="flex items-center space-x-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors">
              <Lock size={18} />
              <span className="text-sm">เปลี่ยนรหัสผ่าน</span>
            </Link>
            <button onClick={handleDeleteAccount} className="w-full flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-left">
              <Trash2 size={18} />
              <span className="text-sm">ลบบัญชีผู้ใช้งาน</span>
            </button>
            <div className="h-px bg-slate-100 my-1"></div>
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-left">
              <LogOut size={18} />
              <span className="text-sm">ออกจากระบบ</span>
            </button>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`w-full flex items-center p-2 rounded-xl border transition-all duration-200 
            ${showMenu ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-slate-200 hover:border-green-300 hover:shadow-sm'}
          `}
        >
          <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
            {user?.profile_pic ? (
              <img
                src={`${import.meta.env.VITE_API_BASE.replace('/api', '')}${user.profile_pic}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-slate-600 font-bold text-xs">{loading ? "..." : user?.initial || "U"}</span>
            )}
          </div>
          <div className="flex-1 min-w-0 ml-3 text-left">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {loading ? "กำลังโหลด..." : user?.displayName || "ผู้ใช้"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.stid ? `รหัส: ${user.stid}` : "นักศึกษา"}
            </p>
          </div>
          <div className={`ml-2 text-slate-400 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`}>
            <ChevronUp size={16} />
          </div>
        </button>
      </div>
    </div>
  );
}
