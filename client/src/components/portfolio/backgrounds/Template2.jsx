import {
  File as FileIcon,
  Download,
  Briefcase,
  Users,
  Zap,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";

const Template2 = ({ data, showSection, formatDate, toAbsUrl }) => {
  const {
    personalInfo: user = {},
    workExperiences: works = [],
    activities = [],
    sports = [],
  } = data || {};
  const isImage = (s = "") =>
    /\.(png|jpe?g|gif|webp|svg|bmp|tiff)$/i.test(String(s));

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 min-h-screen text-white">
      {/* หน้าปก - Cover Page */}
      <div className="print-cover min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-2xl mx-auto mb-8">
            {(user.first_name_th || user.first_name_en || "U").charAt(0)}
          </div>

          <h1 className="text-6xl font-bold text-white mb-4">
            PORTFOLIO
          </h1>

          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto mb-8"></div>

          <h2 className="text-4xl font-bold text-emerald-400 mb-2">
            {user.first_name_th} {user.last_name_th}
          </h2>
          <h3 className="text-2xl text-gray-300 mb-6">
            {user.first_name_en} {user.last_name_en}
          </h3>

          {user.st_id && (
            <p className="text-xl text-gray-300 mb-4">รหัสนิสิต: {user.st_id}</p>
          )}

          {user.education && (
            <p className="text-lg text-gray-400">{user.education}</p>
          )}
        </div>
      </div>



      {/* หน้าคำนำ - Dark Modern Preface Page */}
      <div className="print-section min-h-screen p-8 print:px-[12mm] print:py-[14mm]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-3xl shadow-2xl p-10 border border-gray-700
                    print-solid-800 print-card-border print:shadow-none">
            {/* Modern Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-emerald-500"></div>
                <h2 className="text-4xl font-bold text-white tracking-wider">คำนำ</h2>
                <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-emerald-500"></div>
              </div>
            </div>

            {/* Professional Introduction */}
            <div className="grid lg:grid-cols-2 print-cols-2 gap-10 items-center mb-12">
              {/* Profile Section */}
              <div className="text-center lg:text-left">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full
                          flex items-center justify-center text-white text-2xl font-bold shadow-2xl
                          mx-auto lg:mx-0 mb-6">
                  {(user.first_name_th || user.first_name_en || "U").charAt(0)}
                </div>

                <h3 className="text-2xl font-bold text-emerald-400 mb-2">
                  {user.first_name_th} {user.last_name_th}
                </h3>
                <p className="text-lg text-gray-300 mb-4">
                  {user.first_name_en} {user.last_name_en}
                </p>

                {user.st_id && (
                  <div className="inline-block bg-emerald-600/20 border border-emerald-600/50 rounded-lg px-4 py-2 mb-4">
                    <p className="text-emerald-400 font-medium">รหัสนิสิต: {user.st_id}</p>
                  </div>
                )}

                {user.education && <p className="text-gray-400">{user.education}</p>}
              </div>

              {/* Introduction Text */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-2xl p-6 border-l-4 border-emerald-500
                          print:bg-gray-700">
                  <h4 className="text-xl font-bold text-emerald-400 mb-4">Portfolio Overview</h4>
                  <p className="text-gray-300 leading-relaxed">
                    Portfolio นี้นำเสนอเส้นทางการเรียนรู้และประสบการณ์ที่หลากหลาย …
                  </p>
                </div>

                <div className="bg-gradient-to-r from-emerald-600/10 to-teal-600/10 rounded-2xl p-6 border border-emerald-600/30
                          print:bg-[#064e3b14]">
                  <h4 className="text-xl font-bold text-white mb-4">Philosophy</h4>
                  <p className="text-gray-300 leading-relaxed">
                    ความเป็นเลิศไม่ได้เกิดจากความสมบูรณ์แบบ …
                  </p>
                </div>
              </div>
            </div>



            {/* Mission Statement */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                    <div className="w-8 h-8 bg-white rounded-full"></div>
                  </div>

                  <blockquote className="text-xl font-medium text-white leading-relaxed italic">
                    "Success is not final, failure is not fatal: it is the courage to continue that counts."
                  </blockquote>

                  <div className="space-y-2">
                    <div className="w-12 h-0.5 bg-white/50 mx-auto"></div>
                    <p className="font-bold text-lg text-emerald-100">
                      {user.first_name_th} {user.last_name_th}
                    </p>
                    <p className="text-emerald-200 text-sm">
                      Portfolio Creator
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>




      {/* หน้าข้อมูลส่วนตัว - Personal Info Page */}
      {showSection.personal && (
        <div className="print-section min-h-screen p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-700">
              <h2 className="text-4xl font-bold text-emerald-400 mb-8 text-center border-b border-gray-600 pb-6">
                ข้อมูลส่วนตัว
              </h2>

              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl mx-auto md:mx-0">
                  {(user.first_name_th || user.first_name_en || "U").charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {user.first_name_th} {user.last_name_th}
                  </h3>
                  <h4 className="text-2xl text-emerald-400 mb-6">
                    {user.first_name_en} {user.last_name_en}
                  </h4>

                  {(user.user_desc || user.bio) && (
                    <div className="mb-8">
                      <h5 className="text-lg font-semibold text-emerald-300 mb-3">เกี่ยวกับฉัน</h5>
                      <p
                        className="text-white-700 mx-auto max-w-3xl leading-relaxed whitespace-pre-line text-lg break-words px-4"
                        style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                      >
                        {user.user_desc || user.bio}
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-2xl p-4 border border-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">อีเมล</p>
                          <p className="text-gray-300">{user.email || "-"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-2xl p-4 border border-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">เบอร์โทร</p>
                          <p className="text-gray-300">{user.phone || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* หน้าประสบการณ์การทำงาน - Work Experience Page */}
      {showSection.works && (
        <div className="print-section min-h-screen p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-700">
              <h2 className="text-4xl font-bold text-white flex items-center gap-4 mb-8 text-center justify-center border-b border-gray-600 pb-6">
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                ประสบการณ์การทำงาน
              </h2>
              {works.length === 0 ? (
                <div className="text-gray-400 text-center py-12">
                  <span className="text-xl">ยังไม่มีประสบการณ์การทำงาน</span>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {works.map((work, idx) => (
                    <div
                      key={work.id || idx}
                      className="bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl p-6 border border-gray-600 hover:border-emerald-500 transition-all no-break-inside"
                    >
                      <h4 className="text-2xl font-semibold text-emerald-400 mb-2">
                        {work.jobTitle || "-"}
                      </h4>
                      <p className="text-lg text-gray-400 mb-4">
                        {formatDate(work.startDate)} - {formatDate(work.endDate)}
                      </p>
                      {work.jobDescription && (
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line text-lg">
                          {work.jobDescription}
                        </p>
                      )}

{Array.isArray(work.files) && work.files.length > 0 && (
  <div className="mt-6 grid xs:grid-cols-2 sm:grid-cols-3 gap-4">
    {work.files.map((f, i) => {
      const src  = toAbsUrl(f?.url || f?.filePath);
      const name = f?.name || (f?.filePath || "").split("/").pop() || "";
      const isImg = /\.(png|jpe?g|gif|webp|bmp|svg|tiff)$/i.test(src || name);
      if (!isImg) return null; // ไม่ใช่รูป: ไม่ต้องแสดง

      return (
        <figure
          key={f?.id || i}
          className="
            work-thumb no-break-inside
            w-full aspect-square max-w-[260px]  /* ขนาดบนจอ */
            rounded-xl overflow-hidden border border-gray-200 bg-white
            grid place-items-center p-2
          "
        >
          <img
            src={src}
            alt={name}
            className="block w-full h-full object-contain"
            loading="eager" decoding="sync" fetchpriority="high"
            crossOrigin="anonymous" referrerPolicy="no-referrer-when-downgrade"
            onError={(e)=>e.currentTarget.closest('figure')?.remove()}
          />
        </figure>
      );
    })}
  </div>
)}

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* หน้ากิจกรรม - Activities Page */}
      {showSection.activities && (
        <div className="print-section min-h-screen p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-700">
              <h2 className="text-4xl font-bold text-white flex items-center gap-4 mb-8 text-center justify-center border-b border-gray-600 pb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                กิจกรรม
              </h2>
              {activities.length === 0 ? (
                <div className="text-gray-400 text-center py-12">
                  <span className="text-xl">ยังไม่มีกิจกรรม</span>
                </div>
              ) : (
                <div className="space-y-8">
                  {activities.map((activity, i) => (
                    <div
                      key={activity.id || i}
                      className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-500/30 no-break-inside"
                    >
                      <h4 className="text-2xl font-semibold text-blue-400 mb-2">
                        {activity.name || "-"}
                      </h4>
                      <p className="text-gray-300 text-lg mb-2">
                        {activity.type || "-"}
                      </p>
                      <p className="text-gray-400 mb-4">
                        {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                      </p>
                      {activity.description && (
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line text-lg mb-4">
                          {activity.description}
                        </p>
                      )}

                      {Array.isArray(activity.photos) && activity.photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 print-cols-2">
                          {activity.photos.map((p, j) => {
                            const src = toAbsUrl(p?.url || p?.filePath);
                            const alt =
                              p?.name || p?.originalName || (p?.filePath || "").split("/").pop() || "activity";

                            return (
                              <figure key={p?.id || j} className="block no-break-inside">
                                <div className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-600">
                                  <img
                                    src={src}
                                    alt={alt}
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                    decoding="sync"
                                    crossOrigin="anonymous"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    onError={(e) => {
                                      const fig = e.currentTarget.closest("figure");
                                      if (fig) fig.remove();
                                    }}
                                  />
                                </div>
                              </figure>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* หน้ากีฬา - Sports Page */}
      {showSection.sports && (
        <div className="print-section min-h-screen p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-700">
              <h2 className="text-4xl font-bold text-white flex items-center gap-4 mb-8 text-center justify-center border-b border-gray-600 pb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                กีฬา
              </h2>
              {sports.length === 0 ? (
                <div className="text-gray-400 text-center py-12">
                  <span className="text-xl">ยังไม่มีกิจกรรมกีฬา</span>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {sports.map((sport, k) => (
                    <div
                      key={sport.id || k}
                      className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-2xl p-6 border border-orange-500/30 no-break-inside"
                    >
                      <h4 className="text-2xl font-semibold text-orange-400 mb-2">
                        {sport.name || "-"}
                      </h4>
                      <p className="text-gray-300 text-lg mb-2">
                        {sport.type || "-"}
                      </p>
                      <p className="text-gray-400 mb-3">
                        {formatDate(sport.date)}
                      </p>
                      <p className="text-orange-300 font-medium text-lg mb-4">
                        ผลการแข่งขัน: {sport.result || "-"}
                      </p>
                      {sport.description && (
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                          {sport.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Template2;
