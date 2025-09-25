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
                        <div className="mt-4 space-y-2">
                          {work.files.map((f, i) => {
                            const href = toAbsUrl(f.url || f.filePath);
                            const name = f.name || (f.filePath || "").split("/").pop();
                            return (
                              <a
                                key={f.id || i}
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-center gap-2 rounded-lg border border-gray-500 px-3 py-2 hover:border-emerald-400 hover:bg-gray-600 text-gray-300"
                                download
                              >
                                <FileIcon className="w-4 h-4 text-gray-400 group-hover:text-emerald-400" />
                                <span className="text-sm truncate">{name}</span>
                                <Download className="ml-auto w-4 h-4 text-gray-400 group-hover:text-emerald-400" />
                              </a>
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {activity.photos.map((p, j) => {
                            const src = toAbsUrl(p.url || p.filePath);
                            const alt = p.name || p.originalName || (p.filePath || "").split("/").pop() || "activity";
                            return (
                              <a
                                key={p.id || j}
                                href={src}
                                target="_blank"
                                rel="noreferrer"
                                className="block group"
                              >
                                <div className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-600">
                                  <img
                                    src={src}
                                    alt={alt}
                                    className="w-full h-full object-cover group-hover:opacity-90"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="mt-2 text-sm text-gray-400 truncate">{alt}</div>
                              </a>
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
