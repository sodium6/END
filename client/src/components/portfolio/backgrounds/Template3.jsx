import {
  File as FileIcon,
  Download,
  User,
  Briefcase,
  Users,
  Zap,
  Image as ImageIcon,
  Mail,
  Phone,
  Award,
} from "lucide-react";

const Template3 = ({ data, showSection, formatDate, toAbsUrl }) => {
  const { personalInfo: user = {}, workExperiences: works = [], activities = [], sports = [] } = data || {};
  
  return (
    <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 min-h-screen">
      {/* หน้าปก - Cover Page */}
      <div className="print-cover min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-20 -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full opacity-20 translate-y-16 -translate-x-16" />
        
        <div className="text-center max-w-2xl mx-auto relative z-10">
          {/* <div className="w-32 h-32 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-5xl font-bold mx-auto mb-8 shadow-2xl">
            {/* {(user.first_name_th || user.first_name_en || "U").charAt(0)} */}
          {/* </div>  */}
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            PORTFOLIO
          </h1>
          
          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 mx-auto mb-8"></div>
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {user.first_name_th} {user.last_name_th}
          </h2>
          <h3 className="text-2xl text-gray-600 mb-6">
            {user.first_name_en} {user.last_name_en}
          </h3>
          
          {user.st_id && (
            <p className="text-xl text-gray-700 mb-4">รหัสนิสิต: {user.st_id}</p>
          )}
          
          {user.education && (
            <p className="text-lg text-gray-600">{user.education}</p>
          )}
        </div>
      </div>

      {/* หน้าข้อมูลส่วนตัว - Personal Info Page */}
      {showSection.personal && (
        <div className="print-section min-h-screen p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-10 -translate-y-20 translate-x-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full opacity-10 translate-y-16 -translate-x-16" />
          
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-8 text-center border-b pb-6">
                ข้อมูลส่วนตัว
              </h2>
              
              <div className="text-center mb-8">
                <div className="w-28 h-28 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-xl">
                  {(user.first_name_th || user.first_name_en || "U").charAt(0)}
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {user.first_name_th} {user.last_name_th}
                </h3>
                <h4 className="text-2xl text-gray-600 mb-6">
                  {user.first_name_en} {user.last_name_en}
                </h4>
                
                {(user.user_desc || user.bio) && (
  <div className="mb-8">
    <h5 className="text-lg font-semibold text-purple-800 mb-3">เกี่ยวกับฉัน</h5>
    <p
      className="text-gray-700 mx-auto max-w-3xl leading-relaxed whitespace-pre-line text-lg break-words px-4"
      style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
    >
      {user.user_desc || user.bio}
    </p>
  </div>
)}
              </div>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white text-center">
                  <Mail className="w-8 h-8 mx-auto mb-3" />
                  <p className="font-semibold mb-1">อีเมล</p>
                  <p className="text-sm">{user.email || "-"}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl p-6 text-white text-center">
                  <Phone className="w-8 h-8 mx-auto mb-3" />
                  <p className="font-semibold mb-1">เบอร์โทร</p>
                  <p className="text-sm">{user.phone || "-"}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white text-center">
                  <User className="w-8 h-8 mx-auto mb-3" />
                  <p className="font-semibold mb-1">รหัสนิสิต</p>
                  <p className="text-sm">{user.st_id || "-"}</p>
                </div>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white text-center">
                  <Award className="w-8 h-8 mx-auto mb-3" />
                  <p className="font-semibold mb-1">การศึกษา</p>
                  <p className="text-sm">{user.education || "-"}</p>
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
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-4 mb-8 text-center justify-center border-b pb-6">
                <Briefcase className="w-10 h-10 text-purple-600" />
                ประสบการณ์การทำงาน
              </h2>
              {works.length === 0 ? (
                <div className="text-gray-500 text-center py-12 flex items-center justify-center gap-2">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-xl">ยังไม่มีประสบการณ์การทำงาน</span>
                </div>
              ) : (
                <div className="space-y-8">
                  {works.map((work, index) => (
                    <div
                      key={work.id || index}
                      className={`rounded-3xl p-8 no-break-inside ${
                        index % 2 === 0 
                          ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-l-4 border-pink-500' 
                          : 'bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-500'
                      }`}
                    >
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{work.jobTitle || "-"}</h4>
                      <p className="text-lg text-gray-600 mb-4">
                        {formatDate(work.startDate)} - {formatDate(work.endDate)}
                      </p>
                      {work.jobDescription && (
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">{work.jobDescription}</p>
                      )}
                      
                      {Array.isArray(work.files) && work.files.length > 0 && (
                        <div className="mt-6 grid sm:grid-cols-2 gap-4">
                          {work.files.map((f, i) => {
                            const href = toAbsUrl(f.url || f.filePath);
                            const name = f.name || (f.filePath || "").split("/").pop();
                            return (
                              <a
                                key={f.id || i}
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 hover:border-pink-400 hover:bg-pink-50"
                                download
                              >
                                <FileIcon className="w-5 h-5 text-gray-500 group-hover:text-pink-600" />
                                <span className="text-sm text-gray-700 truncate">{name}</span>
                                <Download className="ml-auto w-4 h-4 text-gray-400 group-hover:text-pink-600" />
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
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-4 mb-8 text-center justify-center border-b pb-6">
                <Users className="w-10 h-10 text-green-600" />
                กิจกรรม
              </h2>
              {activities.length === 0 ? (
                <div className="text-gray-500 text-center py-12 flex items-center justify-center gap-2">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-xl">ยังไม่มีกิจกรรม</span>
                </div>
              ) : (
                <div className="space-y-8">
                  {activities.map((activity, j) => (
                    <div key={activity.id || j} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200 no-break-inside">
                      <h4 className="text-2xl font-semibold text-gray-900 mb-2">{activity.name || "-"}</h4>
                      <p className="text-green-700 font-medium text-lg mb-2">{activity.type || "-"}</p>
                      <p className="text-lg text-gray-600 mb-4">
                        {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                      </p>
                      {activity.description && (
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg mb-6">{activity.description}</p>
                      )}
                      
                      {Array.isArray(activity.photos) && activity.photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {activity.photos.map((p, k) => {
                            const src = toAbsUrl(p.url || p.filePath);
                            const alt = p.name || p.originalName || (p.filePath || "").split("/").pop() || "activity";
                            return (
                              <a
                                key={p.id || k}
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
                                <div className="mt-2 text-sm text-gray-500 truncate">{alt}</div>
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
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-4 mb-8 text-center justify-center border-b pb-6">
                <Zap className="w-10 h-10 text-orange-600" />
                กีฬา
              </h2>
              {sports.length === 0 ? (
                <div className="text-gray-500 text-center py-12 flex items-center justify-center gap-2">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-xl">ยังไม่มีกิจกรรมกีฬา</span>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {sports.map((sport, m) => (
                    <div key={sport.id || m} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-6 border border-orange-200 no-break-inside">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{sport.name || "-"}</h4>
                      <p className="text-orange-700 font-medium text-lg mb-2">{sport.type || "-"}</p>
                      <p className="text-lg text-gray-600 mb-3">{formatDate(sport.date)}</p>
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-lg inline-block mb-4">
                        🏆 {sport.result || "-"}
                      </div>
                      {sport.description && (
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{sport.description}</p>
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

export default Template3;
