import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser, getProfile } from "../../services/authApi";

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
            u.first_name_th?.charAt(0) ||
            u.first_name_en?.charAt(0) ||
            "น",
        });
      } catch (err) {
        console.error("โหลดโปรไฟล์ล้มเหลว:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logoutUser(); 
    navigate("/sign-in");
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
              นักเรียนพอร์ทัล
            </span>
            <span className="text-xs text-slate-500">ระบบจัดการการเรียน</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="ค้นหา..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
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
              <span className="text-sm">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/my-portfolio"
              className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <span className="text-sm">My Portfolio</span>
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
              <span className="text-sm">template</span>
            </Link>
          </li>
          <li>
            <button className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-slate-600 hover:bg-slate-100">
              <span className="text-sm">การแจ้งเตือน</span>
              <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                12
              </span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50/30 p-3">
          <div className="flex items-center px-3 py-2 rounded-md bg-white">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-slate-700 font-medium text-sm">
                {loading ? "…" : user?.initial || "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0 ml-2.5">
              <p className="text-sm font-medium text-slate-800 truncate">
                {loading ? "กำลังโหลด..." : user?.displayName || "ไม่พบข้อมูลผู้ใช้"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {loading
                  ? "กำลังโหลด..."
                  : user?.stid
                  ? `รหัสนักศึกษา: ${user.stid}`
                  : "-"}
              </p>
            </div>
            <div
              className="w-2 h-2 bg-green-500 rounded-full ml-2"
              title="ออนไลน์"
            ></div>
          </div>
        </div>

        <div className="p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-red-600 hover:bg-red-50"
          >
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
