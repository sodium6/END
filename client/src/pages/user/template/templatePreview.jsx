import React, { useEffect, useMemo, useState } from "react";
import {
  File as FileIcon,
  Download,
  Printer,
  User,
  Briefcase,
  Users,
  Zap,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { getPortfolioData } from "../../../services/getPortfolioDataApi";

// ----------------- Helper: ปรับโครงข้อมูลจาก API -> รูปแบบที่ UI ใช้ -----------------
function normalizePortfolio(api) {
  const p = api || {};

  // ----- user -----
  const u = p.personalInfo || p.user || {};
  const user = {
    id: u.id ?? null,
    firstNameTh: u.first_name_th ?? u.firstNameTh ?? "",
    lastNameTh: u.last_name_th ?? u.lastNameTh ?? "",
    firstNameEn: u.first_name_en ?? u.firstNameEn ?? "",
    lastNameEn: u.last_name_en ?? u.lastNameEn ?? "",
    education: u.education ?? "",
    phone: u.phone ?? "",
    email: u.email ?? "",
    // API ส่ง st_id (ไม่มี st_id_display) → map มาไว้ที่ st_id_display ให้ UI ใช้ได้เลย
    st_id_display: u.st_id_display ?? u.st_id ?? "",
  };

  // ----- works -----
  const works = (p.workExperiences ?? p.works ?? []).map((w) => ({
    id: w.id,
    userId: w.userId ?? w.user_id ?? user.id,
    jobTitle: w.jobTitle ?? w.job_title ?? "",
    startDate: w.startDate ?? w.start_date ?? null,
    endDate: w.endDate ?? w.end_date ?? null,
    jobDescription: w.jobDescription ?? w.job_description ?? "",
    portfolioLink: w.portfolioLink ?? w.portfolio_link ?? null,
    createdAt: w.createdAt ?? w.created_at ?? null,
    files: (w.files ?? []).map((f) => {
      const filePath = f.filePath ?? f.file_path ?? "";
      return {
        id: f.id,
        wkId: f.wkId ?? f.wk_id,
        userId: f.userId ?? f.user_id,
        filePath,
        url: f.url ?? filePath, // ให้มี url เสมอ
        // ชื่อไฟล์: ใช้ name ถ้ามี, รองลงมา original_name, สุดท้าย basename จาก path
        name:
          f.name ??
          f.original_name ??
          (filePath ? filePath.split("/").pop() : "file"),
        size: f.size ?? f.sizeBytes ?? f.size_bytes ?? 0,
      };
    }),
  }));

  // ----- activities -----
  const activities = (p.activities ?? []).map((a) => ({
    id: a.id,
    name: a.name ?? "",
    type: a.type ?? "",
    startDate: a.startDate ?? a.start_date ?? null,
    endDate: a.endDate ?? a.end_date ?? null,
    description: a.description ?? "",
    photos: (a.photos ?? []).map((ph) => {
      const pth = ph.filePath ?? ph.image_path ?? ph.file_path ?? "";
      return {
        id: ph.id,
        actId: ph.actId ?? ph.activity_id,
        filePath: pth,
        url: ph.url ?? pth, // ให้มี url เสมอ
        name:
          ph.name ??
          ph.originalName ??
          ph.original_name ??
          (pth ? pth.split("/").pop() : "image"),
        size: ph.size ?? ph.sizeBytes ?? ph.size_bytes ?? 0,
      };
    }),
  }));

  // ----- sports -----
  const sports = (p.sports ?? []).map((s) => ({
    id: s.id,
    name: s.name ?? "",
    type: s.type ?? "",
    date: s.date ?? null,
    result: s.result ?? "",
    description: s.description ?? "",
  }));

  return { user, works, activities, sports };
}

export default function PortfolioView({ userId: propUserId }) {
  // ===== URL base & utils =====
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const toAbsUrl = (p) => {
    if (!p) return "";
    const s = String(p);
    const abs = s.startsWith("http")
      ? s
      : `${API_BASE}${s.startsWith("/") ? s : `/${s}`}`;
    // ถ้าเจอ %HH แปลว่า encode มาแล้ว -> อย่า encode ซ้ำ
    const alreadyEncoded = /%[0-9A-Fa-f]{2}/.test(abs);
    if (!alreadyEncoded && /[^\x20-\x7E]/.test(abs)) return encodeURI(abs);
    return abs;
  };

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  // ===== Resolve userId =====
  const userIdFromToken = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded?.id ?? null;
    } catch {
      return null;
    }
  }, []);
  const userId = propUserId ?? userIdFromToken;

  // ===== State =====
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);
  const [showSection, setShowSection] = useState({
    personal: true,
    works: true,
    activities: true,
    sports: true,
  });

  // Helper function to transform API response to expected format
  const transformApiResponse = (response) => {
    console.log('Raw API response:', response);
    
    let responseData = response;
    
    // Handle different response formats
    if (response && typeof response === 'object') {
      // Case 1: Response has a data property (common with axios)
      if (response.data) {
        responseData = response.data;
      }
    }
    
    // Transform the data to match our expected format
    if (responseData) {
      const transformed = {
        user: {
          id: responseData.user?.id,
          firstNameTh: responseData.user?.first_name_th || responseData.user?.firstNameTh || '',
          lastNameTh: responseData.user?.last_name_th || responseData.user?.lastNameTh || '',
          firstNameEn: responseData.user?.first_name_en || responseData.user?.firstNameEn || '',
          lastNameEn: responseData.user?.last_name_en || responseData.user?.lastNameEn || '',
          education: responseData.user?.education || '',
          phone: responseData.user?.phone || '',
          email: responseData.user?.email || '',
          st_id_display: responseData.user?.st_id_display || responseData.user?.st_id || ''
        },
        works: responseData.workExperiences || responseData.works || [],
        activities: responseData.activities || [],
        sports: responseData.sports || []
      };
      
      console.log('Transformed data:', transformed);
      return transformed;
    }
    
    return {
      user: {
        id: '',
        firstNameTh: '',
        lastNameTh: '',
        firstNameEn: '',
        lastNameEn: '',
        education: '',
        phone: '',
        email: '',
        st_id_display: ''
      },
      works: [],
      activities: [],
      sports: []
    };
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!userId) {
        setErr("ไม่พบผู้ใช้");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching portfolio data for user:', userId);
        const response = await getPortfolioData(userId);
        
        // Transform and normalize the API response
        const transformedData = transformApiResponse(response);
        console.log('Transformed data before normalization:', transformedData);
        
        if (!transformedData) {
          throw new Error('No valid data received from server');
        }
        
        // Normalize the data structure
        const normalized = normalizePortfolio(transformedData);
        console.log('Normalized portfolio data:', normalized);
        
        if (!mounted) return;
        setData(normalized);
        setErr("");
      } catch (e) {
        if (!mounted) return;
        setErr(
          e?.response?.data?.message || e?.message || "โหลดข้อมูลล้มเหลว"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const onPrint = () => window.print();

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        กรุณาเข้าสู่ระบบก่อน
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="h-6 w-52 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-4">
              <div className="h-40 bg-white rounded-xl shadow-sm animate-pulse" />
              <div className="h-40 bg-white rounded-xl shadow-sm animate-pulse" />
              <div className="h-40 bg-white rounded-xl shadow-sm animate-pulse" />
            </div>
            <div className="h-64 bg-white rounded-xl shadow-sm animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto p-6">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {err}
          </div>
        </div>
      </div>
    );
  }

  // Ensure we have default values for all data
  const safeData = data || {};
  const user = {
    id: safeData.user?.id || userId || '',
    firstNameTh: safeData.user?.firstNameTh || '',
    lastNameTh: safeData.user?.lastNameTh || '',
    firstNameEn: safeData.user?.firstNameEn || '',
    lastNameEn: safeData.user?.lastNameEn || '',
    education: safeData.user?.education || '',
    phone: safeData.user?.phone || '',
    email: safeData.user?.email || '',
    st_id_display: safeData.user?.st_id_display || ''
  };
  
  const works = Array.isArray(safeData.works) ? safeData.works : [];
  const activities = Array.isArray(safeData.activities) ? safeData.activities : [];
  const sports = Array.isArray(safeData.sports) ? safeData.sports : [];

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white font-['Sarabun',sans-serif]">
      <div className="max-w-6xl mx-auto p-6 print:p-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 print:mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Portfolio</h1>
            <p className="text-gray-500">User ID: {user?.id}</p>
          </div>
          <button
            onClick={onPrint}
            className="hidden print:hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Printer className="w-5 h-5" />
            พิมพ์ / PDF
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Main */}
          <main className="space-y-6">
            {/* Personal */}
            {showSection.personal && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 print:shadow-none print:border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold">
                    {String(user?.firstNameTh || user?.firstNameEn || "U").charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-600" />
                      ข้อมูลส่วนตัว
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {user?.firstNameTh} {user?.lastNameTh}{" "}
                      {(user?.firstNameEn || user?.lastNameEn) && (
                        <span className="text-gray-400">
                          ({user?.firstNameEn} {user?.lastNameEn})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <InfoRow label="ชื่อ-นามสกุล" value={`${user?.firstNameTh} ${user?.lastNameTh}`} />
                  <InfoRow label="ชื่อ-นามสกุล (ภาษาอังกฤษ)" value={`${user?.firstNameEn} ${user?.lastNameEn}`} />
                  <InfoRow label="การศึกษา" value={user?.education || "-"} />
                  <InfoRow label="อีเมล" value={user?.email || "-"} />
                  <InfoRow label="โทรศัพท์" value={user?.phone || "-"} />
                  <InfoRow
                    label="รหัสนักศึกษา"
                    value={user?.st_id_display || "-"}
                  />
                </div>
              </section>
            )}

            {/* Works */}
            {showSection.works && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 print:shadow-none print:border">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                  ประวัติการทำงาน
                </h2>

                {works.length === 0 ? (
                  <Empty text="ยังไม่มีประสบการณ์ทำงาน" />
                ) : (
                  <div className="space-y-4">
                    {works.map((w) => (
                      <div key={w.id} className="rounded-xl border border-gray-100 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {w.jobTitle || "-"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(w.startDate)} — {formatDate(w.endDate)}
                            </div>
                          </div>
                          {w.portfolioLink ? (
                            <a
                              href={w.portfolioLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800"
                            >
                              <Eye className="w-4 h-4" />
                              ดูลิงก์ผลงาน
                            </a>
                          ) : null}
                        </div>

                        {w.jobDescription ? (
                          <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">
                            {w.jobDescription}
                          </p>
                        ) : null}

                        {/* Files */}
                        {Array.isArray(w.files) && w.files.length > 0 && (
                          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {w.files.map((f) => {
                              const href = toAbsUrl(f.url || f.filePath);
                              const name =
                                f.name ||
                                (f.filePath || "").split("/").pop() ||
                                "file";
                              return (
                                <a
                                  key={f.id}
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 hover:border-emerald-300 hover:bg-emerald-50"
                                  download
                                >
                                  <FileIcon className="w-4 h-4 text-gray-500 group-hover:text-emerald-700" />
                                  <span className="text-sm text-gray-700 truncate">
                                    {name}
                                  </span>
                                  <Download className="ml-auto w-4 h-4 text-gray-400 group-hover:text-emerald-700" />
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Activities */}
            {showSection.activities && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 print:shadow-none print:border">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-emerald-600" />
                  กิจกรรม
                </h2>

                {activities.length === 0 ? (
                  <Empty text="ยังไม่มีกิจกรรม" />
                ) : (
                  <div className="space-y-4">
                    {activities.map((a) => (
                      <div key={a.id} className="rounded-xl border border-gray-100 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {a.name || "-"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {a.type || "-"} • {formatDate(a.startDate)} —{" "}
                              {formatDate(a.endDate)}
                            </div>
                          </div>
                        </div>
                        {a.description ? (
                          <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">
                            {a.description}
                          </p>
                        ) : null}

                        {/* Photos */}
                        {Array.isArray(a.photos) && a.photos.length > 0 && (
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {a.photos.map((p) => {
                              const src = toAbsUrl(p.url || p.filePath);
                              const alt =
                                p.name ||
                                (p.filePath || "").split("/").pop() ||
                                "activity";
                              return (
                                <a
                                  key={p.id}
                                  href={src}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block group"
                                >
                                  <div className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-200">
                                    <img
                                      src={src}
                                      alt={alt}
                                      className="w-full h-full object-cover group-hover:opacity-90"
                                      loading="lazy"
                                    />
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500 truncate">
                                    {alt}
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Sports */}
            {showSection.sports && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 print:shadow-none print:border">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  กีฬา
                </h2>

                {sports.length === 0 ? (
                  <Empty text="ยังไม่มีกิจกรรมกีฬา" />
                ) : (
                  <div className="grid gap-3">
                    {sports.map((s) => (
                      <div key={s.id} className="rounded-xl border border-gray-100 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="font-semibold text-gray-900">
                            {s.name || "-"}{" "}
                            <span className="text-gray-500">
                              ({s.type || "-"})
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(s.date)}
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-emerald-700">
                          ผลการแข่งขัน:{" "}
                          <span className="font-medium">
                            {s.result || "-"}
                          </span>
                        </div>
                        {s.description ? (
                          <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                            {s.description}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </main>

          {/* Right Sidebar (hidden in print) */}
          <aside className="lg:sticky lg:top-6 lg:h-fit print:hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Printer className="w-5 h-5 text-emerald-600" />
                <div className="font-semibold">การพิมพ์ / PDF</div>
              </div>
              <button
                onClick={onPrint}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Printer className="w-4 h-4" />
                พิมพ์เป็น PDF
              </button>

              <div className="mt-5 border-t pt-4">
                <div className="font-semibold mb-2">แสดงผลส่วนต่างๆ</div>
                <ToggleLine
                  label="ข้อมูลส่วนตัว"
                  checked={showSection.personal}
                  onChange={(v) =>
                    setShowSection((s) => ({ ...s, personal: v }))
                  }
                />
                <ToggleLine
                  label="ประวัติการทำงาน"
                  checked={showSection.works}
                  onChange={(v) => setShowSection((s) => ({ ...s, works: v }))}
                />
                <ToggleLine
                  label="กิจกรรม"
                  checked={showSection.activities}
                  onChange={(v) =>
                    setShowSection((s) => ({ ...s, activities: v }))
                  }
                />
                <ToggleLine
                  label="กีฬา"
                  checked={showSection.sports}
                  onChange={(v) => setShowSection((s) => ({ ...s, sports: v }))}
                />
                <p className="mt-3 text-xs text-gray-500">
                  * ส่วนที่ถูกปิดจะไม่แสดงในตอนพิมพ์
                </p>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-400">
              เคล็ดลับ: ไปที่หน้าต่าง Print แล้วตั้งค่าขอบกระดาษเป็น “None”
              หรือ “Minimal” เพื่อให้กรอบสวยขึ้น
            </div>
          </aside>
        </div>
      </div>

      {/* สไตล์เฉพาะตอนพิมพ์ */}
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          a[href]:after { content: ""; }
          img { break-inside: avoid; }
          .shadow-sm, .shadow, .shadow-lg { box-shadow: none !important; }
          .bg-gray-50 { background: white !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------- Small UI utils ---------- */
function InfoRow({ label, value }) {
  return (
    <div className="flex gap-3">
      <div className="w-32 shrink-0 text-gray-500">{label}</div>
      <div className="text-gray-800">{value}</div>
    </div>
  );
}
function Empty({ text = "ไม่มีข้อมูล" }) {
  return (
    <div className="flex items-center gap-2 text-gray-500 text-sm">
      <ImageIcon className="w-4 h-4" /> {text}
    </div>
  );
}
function ToggleLine({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer select-none">
      <span className="text-sm text-gray-700">{label}</span>
      <span
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? "bg-emerald-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </span>
    </label>
  );
}
import React, { useEffect, useMemo, useState } from "react";
import {
  File as FileIcon,
  Download,
  Printer,
  User,
  Briefcase,
  Users,
  Zap,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { getPortfolioData } from "../../../services/getPortfolioDataApi";

/* ---------- Normalize: API -> UI shape ---------- */
function normalizePortfolio(api) {
  const p = api || {};

  // user
  const u = p.personalInfo || p.user || {};
  const user = {
    id: u.id ?? null,
    firstNameTh: u.first_name_th ?? u.firstNameTh ?? "",
    lastNameTh: u.last_name_th ?? u.lastNameTh ?? "",
    firstNameEn: u.first_name_en ?? u.firstNameEn ?? "",
    lastNameEn: u.last_name_en ?? u.lastNameEn ?? "",
    education: u.education ?? "",
    phone: u.phone ?? "",
    email: u.email ?? "",
    st_id_display: u.st_id_display ?? u.st_id ?? "",
  };

  // works
  const works = (p.workExperiences ?? p.works ?? []).map((w) => ({
    id: w.id,
    userId: w.userId ?? w.user_id ?? user.id,
    jobTitle: w.jobTitle ?? w.job_title ?? "",
    startDate: w.startDate ?? w.start_date ?? null,
    endDate: w.endDate ?? w.end_date ?? null,
    jobDescription: w.jobDescription ?? w.job_description ?? "",
    portfolioLink: w.portfolioLink ?? w.portfolio_link ?? null,
    createdAt: w.createdAt ?? w.created_at ?? null,
    files: (w.files ?? []).map((f) => {
      const filePath = f.filePath ?? f.file_path ?? "";
      return {
        id: f.id,
        wkId: f.wkId ?? f.wk_id,
        userId: f.userId ?? f.user_id,
        filePath,
        url: f.url ?? filePath,
        name:
          f.name ??
          f.original_name ??
          (filePath ? filePath.split("/").pop() : "file"),
        size: f.size ?? f.sizeBytes ?? f.size_bytes ?? 0,
      };
    }),
  }));

  // activities
  const activities = (p.activities ?? []).map((a) => ({
    id: a.id,
    name: a.name ?? "",
    type: a.type ?? "",
    startDate: a.startDate ?? a.start_date ?? null,
    endDate: a.endDate ?? a.end_date ?? null,
    description: a.description ?? "",
    photos: (a.photos ?? []).map((ph) => {
      const pth = ph.filePath ?? ph.image_path ?? ph.file_path ?? "";
      return {
        id: ph.id,
        actId: ph.actId ?? ph.activity_id,
        filePath: pth,
        url: ph.url ?? pth,
        name:
          ph.name ??
          ph.originalName ??
          ph.original_name ??
          (pth ? pth.split("/").pop() : "image"),
        size: ph.size ?? ph.sizeBytes ?? ph.size_bytes ?? 0,
      };
    }),
  }));

  // sports
  const sports = (p.sports ?? []).map((s) => ({
    id: s.id,
    name: s.name ?? "",
    type: s.type ?? "",
    date: s.date ?? null,
    result: s.result ?? "",
    description: s.description ?? "",
  }));

  return { user, works, activities, sports };
}

export default function PortfolioView({ userId: propUserId }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const toAbsUrl = (p) => {
    if (!p) return "";
    const s = String(p);
    const abs = s.startsWith("http")
      ? s
      : `${API_BASE}${s.startsWith("/") ? s : `/${s}`}`;
    const alreadyEncoded = /%[0-9A-Fa-f]{2}/.test(abs);
    if (!alreadyEncoded && /[^\x20-\x7E]/.test(abs)) return encodeURI(abs);
    return abs;
  };

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  // userId
  const userIdFromToken = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded?.id ?? null;
    } catch {
      return null;
    }
  }, []);
  const userId = propUserId ?? userIdFromToken;

  // state
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);
  const [showSection, setShowSection] = useState({
    personal: true,
    works: true,
    activities: true,
    sports: true,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!userId) {
        setErr("ไม่พบผู้ใช้");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getPortfolioData(userId);
        // รองรับทุกเคส: plain | {data} | {data:{data}}
        const payload = res?.data?.data ?? res?.data ?? res;
        const normalized = normalizePortfolio(payload);
        if (!mounted) return;
        setData(normalized);
        setErr("");
      } catch (e) {
        if (!mounted) return;
        setErr(e?.response?.data?.message || e?.message || "โหลดข้อมูลล้มเหลว");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const onPrint = () => window.print();

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        กรุณาเข้าสู่ระบบก่อน
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="h-6 w-52 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-4">
              <div className="h-40 bg-white rounded-xl shadow-sm animate-pulse" />
              <div className="h-40 bg-white rounded-xl shadow-sm animate-pulse" />
              <div className="h-40 bg-white rounded-xl shadow-sm animate-pulse" />
            </div>
            <div className="h-64 bg-white rounded-xl shadow-sm animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto p-6">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {err}
          </div>
        </div>
      </div>
    );
  }

  // Ensure we have default values for all data
  const safeData = data || {};
  const user = {
    id: safeData.user?.id || userId || '',
    firstNameTh: safeData.user?.firstNameTh || '',
    lastNameTh: safeData.user?.lastNameTh || '',
    firstNameEn: safeData.user?.firstNameEn || '',
    lastNameEn: safeData.user?.lastNameEn || '',
    education: safeData.user?.education || '',
    phone: safeData.user?.phone || '',
    email: safeData.user?.email || '',
    st_id_display: safeData.user?.st_id_display || ''
  };
  
  const works = Array.isArray(safeData.works) ? safeData.works : [];
  const activities = Array.isArray(safeData.activities) ? safeData.activities : [];
  const sports = Array.isArray(safeData.sports) ? safeData.sports : [];

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white font-['Sarabun',sans-serif]">
      <div className="max-w-6xl mx-auto p-6 print:p-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 print:mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Portfolio</h1>
            <p className="text-gray-500">User ID: {user?.id ?? "-"}</p>
          </div>
          <button
            onClick={onPrint}
            className="hidden print:hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Printer className="w-5 h-5" />
            พิมพ์ / PDF
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Main */}
          <main className="space-y-6">
            {/* Personal */}
            {showSection.personal && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 print:shadow-none print:border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold">
                    {String(user?.firstNameTh || user?.firstNameEn || "U").charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-600" />
                      ข้อมูลส่วนตัว
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {user?.firstNameTh} {user?.lastNameTh}{" "}
                      {(user?.firstNameEn || user?.lastNameEn) && (
                        <span className="text-gray-400">
                          ({user?.firstNameEn} {user?.lastNameEn})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <InfoRow label="การศึกษา" value={user?.education || "-"} />
                  <InfoRow label="อีเมล" value={user?.email || "-"} />
                  <InfoRow label="โทรศัพท์" value={user?.phone || "-"} />
                  <InfoRow label="รหัสนักศึกษา" value={user?.st_id_display || "-"} />
                </div>
              </section>
            )}

            {/* Works */}
            {showSection.works && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 print:shadow-none print:border">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                  ประวัติการทำงาน
                </h2>

                {works.length === 0 ? (
                  <Empty text="ยังไม่มีประสบการณ์ทำงาน" />
                ) : (
                  <div className="space-y-4">
                    {works.map((w) => (
                      <div key={w.id} className="rounded-xl border border-gray-100 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {w.jobTitle || "-"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(w.startDate)} — {formatDate(w.endDate)}
                            </div>
                          </div>
                          {w.portfolioLink ? (
                            <a
                              href={w.portfolioLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800"
                            >
                              <Eye className="w-4 h-4" />
                              ดูลิงก์ผลงาน
                            </a>
                          ) : null}
                        </div>

                        {w.jobDescription ? (
                          <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">
                            {w.jobDescription}
                          </p>
                        ) : null}

                        {Array.isArray(w.files) && w.files.length > 0 && (
                          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {w.files.map((f) => {
                              const href = toAbsUrl(f.url || f.filePath);
                              const name =
                                f.name ||
                                (f.filePath || "").split("/").pop() ||
                                "file";
                              return (
                                <a
                                  key={f.id}
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 hover:border-emerald-300 hover:bg-emerald-50"
                                  download
                                >
                                  <FileIcon className="w-4 h-4 text-gray-500 group-hover:text-emerald-700" />
                                  <span className="text-sm text-gray-700 truncate">
                                    {name}
                                  </span>
                                  <Download className="ml-auto w-4 h-4 text-gray-400 group-hover:text-emerald-700" />
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Activities */}
            {showSection.activities && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 print:shadow-none print:border">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-emerald-600" />
                  กิจกรรม
                </h2>

                {activities.length === 0 ? (
                  <Empty text="ยังไม่มีกิจกรรม" />
                ) : (
                  <div className="space-y-4">
                    {activities.map((a) => (
                      <div key={a.id} className="rounded-xl border border-gray-100 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {a.name || "-"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {a.type || "-"} • {formatDate(a.startDate)} — {formatDate(a.endDate)}
                            </div>
                          </div>
                        </div>
                        {a.description ? (
                          <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">
                            {a.description}
                          </p>
                        ) : null}

                        {Array.isArray(a.photos) && a.photos.length > 0 && (
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {a.photos.map((p) => {
                              const src = toAbsUrl(p.url || p.filePath);
                              const alt =
                                p.name ||
                                (p.filePath || "").split("/").pop() ||
                                "activity";
                              return (
                                <a
                                  key={p.id}
                                  href={src}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block group"
                                >
                                  <div className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-200">
                                    <img
                                      src={src}
                                      alt={alt}
                                      className="w-full h-full object-cover group-hover:opacity-90"
                                      loading="lazy"
                                    />
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500 truncate">
                                    {alt}
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Sports */}
            {showSection.sports && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 print:shadow-none print:border">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  กีฬา
                </h2>

                {sports.length === 0 ? (
                  <Empty text="ยังไม่มีกิจกรรมกีฬา" />
                ) : (
                  <div className="grid gap-3">
                    {sports.map((s) => (
                      <div key={s.id} className="rounded-xl border border-gray-100 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="font-semibold text-gray-900">
                            {s.name || "-"} <span className="text-gray-500">({s.type || "-"})</span>
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(s.date)}</div>
                        </div>
                        <div className="mt-1 text-sm text-emerald-700">
                          ผลการแข่งขัน: <span className="font-medium">{s.result || "-"}</span>
                        </div>
                        {s.description ? (
                          <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                            {s.description}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </main>

          {/* Sidebar (not printed) */}
          <aside className="lg:sticky lg:top-6 lg:h-fit print:hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Printer className="w-5 h-5 text-emerald-600" />
                <div className="font-semibold">การพิมพ์ / PDF</div>
              </div>
              <button
                onClick={onPrint}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Printer className="w-4 h-4" />
                พิมพ์เป็น PDF
              </button>

              <div className="mt-5 border-t pt-4">
                <div className="font-semibold mb-2">แสดงผลส่วนต่างๆ</div>
                <ToggleLine
                  label="ข้อมูลส่วนตัว"
                  checked={showSection.personal}
                  onChange={(v) => setShowSection((s) => ({ ...s, personal: v }))}
                />
                <ToggleLine
                  label="ประวัติการทำงาน"
                  checked={showSection.works}
                  onChange={(v) => setShowSection((s) => ({ ...s, works: v }))}
                />
                <ToggleLine
                  label="กิจกรรม"
                  checked={showSection.activities}
                  onChange={(v) => setShowSection((s) => ({ ...s, activities: v }))}
                />
                <ToggleLine
                  label="กีฬา"
                  checked={showSection.sports}
                  onChange={(v) => setShowSection((s) => ({ ...s, sports: v }))}
                />
                <p className="mt-3 text-xs text-gray-500">
                  * ส่วนที่ถูกปิดจะไม่แสดงในตอนพิมพ์
                </p>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-400">
              เคล็ดลับ: ไปที่หน้าต่าง Print แล้วตั้งค่าขอบกระดาษเป็น “None” หรือ “Minimal”
            </div>
          </aside>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          a[href]:after { content: ""; }
          img { break-inside: avoid; }
          .shadow-sm, .shadow, .shadow-lg { box-shadow: none !important; }
          .bg-gray-50 { background: white !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------- Small UI utils ---------- */
function InfoRow({ label, value }) {
  return (
    <div className="flex gap-3">
      <div className="w-32 shrink-0 text-gray-500">{label}</div>
      <div className="text-gray-800">{value}</div>
    </div>
  );
}
function Empty({ text = "ไม่มีข้อมูล" }) {
  return (
    <div className="flex items-center gap-2 text-gray-500 text-sm">
      <ImageIcon className="w-4 h-4" /> {text}
    </div>
  );
}
function ToggleLine({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer select-none">
      <span className="text-sm text-gray-700">{label}</span>
      <span
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? "bg-emerald-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </span>
    </label>
  );
}
