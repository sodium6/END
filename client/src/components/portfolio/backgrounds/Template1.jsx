import {
  File as FileIcon,
  Download,
  Briefcase,
  Users,
  Zap,
  Mail,
  Phone,
  User,
  Award,
  ImageIcon,
  ExternalLink,
} from "lucide-react";

const Template1 = ({ data, showSection, formatDate, toAbsUrl }) => {
  const { personalInfo: user = {}, workExperiences: works = [], activities = [], sports = [] } = data || {};
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* หน้าปก - Cover Page */}
      <div className="print-cover min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-2xl mx-auto mb-8">
            {(user.first_name_th || user.first_name_en || "U").charAt(0)}
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            PORTFOLIO
          </h1>
          
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-700 mx-auto mb-8"></div>
          
          <h2 className="text-4xl font-bold text-blue-800 mb-2">
            {user.first_name_th} {user.last_name_th}
          </h2>
          <h3 className="text-2xl text-gray-600 mb-6">
            {user.first_name_en} {user.last_name_en}
          </h3>
          
          {user.st_id && (
            <p className="text-xl text-gray-600 mb-4">รหัสนิสิต: {user.st_id}</p>
          )}
          
          {user.education && (
            <p className="text-lg text-gray-600">{user.education}</p>
          )}
        </div>
      </div>

      {/* หน้าข้อมูลส่วนตัว - Personal Info Page */}
      {showSection.personal && (
        <div className="print-section min-h-screen p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-blue-600">
              <h2 className="text-4xl font-bold text-blue-800 mb-8 text-center border-b pb-6">
                ข้อมูลส่วนตัว
              </h2>
              
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto md:mx-0">
                  {(user.first_name_th || user.first_name_en || "U").charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {user.first_name_th} {user.last_name_th}
                  </h3>
                  <h4 className="text-xl text-gray-600 mb-6">
                    {user.first_name_en} {user.last_name_en}
                  </h4>

                  {(user.user_desc || user.bio) && (
                    <div className="mb-8">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">เกี่ยวกับฉัน</h5>
                      <p
      className="text-gray-700 mx-auto max-w-3xl leading-relaxed whitespace-pre-line text-lg break-words px-4"
      style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
    >
                        {user.user_desc || user.bio}
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <div className="flex items-center gap-3 text-gray-800">
                        <Mail className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-semibold">อีเมล</p>
                          <p className="text-gray-600">{user.email || "-"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <div className="flex items-center gap-3 text-gray-800">
                        <Phone className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-semibold">เบอร์โทร</p>
                          <p className="text-gray-600">{user.phone || "-"}</p>
                        </div>
                      </div>
                    </div>
                    {/* <div className="bg-blue-50 rounded-2xl p-4">
                      <div className="flex items-center gap-3 text-gray-800">
                        <User className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-semibold">รหัสนิสิต</p>
                          <p className="text-gray-600">{user.st_id || "-"}</p>
                        </div>
                      </div>
                    </div> */}
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <div className="flex items-center gap-3 text-gray-800">
                        <Award className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-semibold">การศึกษา</p>
                          <p className="text-gray-600">{user.education || "-"}</p>
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
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-4xl font-bold text-blue-800 flex items-center gap-4 mb-8 text-center justify-center border-b pb-6">
                <Briefcase className="w-10 h-10 text-blue-600" />
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
                    <div key={work.id || index} className="relative no-break-inside">
                      {index !== works.length - 1 && (
                        <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-blue-200" />
                      )}
                      <div className="flex gap-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="bg-blue-50 rounded-2xl p-8 border-l-4 border-blue-600">
                            <h4 className="text-2xl font-semibold text-gray-900 mb-2">{work.jobTitle || "-"}</h4>
                            <p className="text-lg text-blue-700 font-medium mb-4">
                              {formatDate(work.startDate)} - {formatDate(work.endDate)}
                            </p>
                            {work.jobDescription && (
                              <p className="text-gray-700 whitespace-pre-line text-lg leading-relaxed">{work.jobDescription}</p>
                            )}

                            {Array.isArray(work.files) && work.files.length > 0 && (
                              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {work.files.map((f, i) => {
                                  const href = toAbsUrl(f.url || f.filePath);
                                  const name = f.name || (f.filePath || "").split("/").pop();
                                  return (
                                    <a
                                      key={f.id || i}
                                      href={href}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="group flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-300 hover:bg-blue-50"
                                      download
                                    >
                                      <FileIcon className="w-5 h-5 text-gray-500 group-hover:text-blue-700" />
                                      <span className="text-sm text-gray-700 truncate">{name}</span>
                                      <Download className="ml-auto w-4 h-4 text-gray-400 group-hover:text-blue-700" />
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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
              <h2 className="text-4xl font-bold text-green-800 flex items-center gap-4 mb-8 text-center justify-center border-b pb-6">
                <Users className="w-10 h-10 text-green-600" />
                กิจกรรม
              </h2>
              {activities.length === 0 ? (
                <div className="text-gray-500 text-center py-12 flex items-center justify-center gap-2">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-xl">ยังไม่มีกิจกรรม</span>
                </div>
              ) : (
                <div className="grid gap-8">
                  {activities.map((activity, i) => (
                    <div key={activity.id || i} className="bg-green-50 rounded-2xl p-8 border-l-4 border-green-600 no-break-inside">
                      <h4 className="text-2xl font-semibold text-gray-900 mb-2">{activity.name || "-"}</h4>
                      <p className="text-green-700 font-medium text-lg mb-2">{activity.type || "-"}</p>
                      <p className="text-lg text-gray-600 mb-4">
                        {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                      </p>
                      {activity.description && (
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg mb-4">{activity.description}</p>
                      )}
                      
                      {Array.isArray(activity.photos) && activity.photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
              <h2 className="text-4xl font-bold text-orange-800 flex items-center gap-4 mb-8 text-center justify-center border-b pb-6">
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
                  {sports.map((sport, k) => (
                    <div key={sport.id || k} className="bg-orange-50 rounded-2xl p-6 border-l-4 border-orange-600 no-break-inside">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{sport.name || "-"}</h4>
                      <p className="text-orange-700 text-lg font-medium mb-2">{sport.type || "-"}</p>
                      <p className="text-gray-600 mb-3">{formatDate(sport.date)}</p>
                      <p className="text-lg font-semibold text-orange-800 mb-4">
                        ผลการแข่งขัน: {sport.result || "-"}
                      </p>
                      {sport.description && (
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{sport.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* สรุปทักษะ */}
            <div className="mt-8 bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-purple-800 flex items-center gap-3 mb-6 text-center justify-center border-b pb-4">
                <Award className="w-8 h-8 text-purple-600" />
                สรุปทักษะและผลงาน
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-2xl p-6 text-center border-l-4 border-blue-600">
                  <div className="text-3xl font-bold text-blue-800 mb-2">{works.length}</div>
                  <p className="text-gray-700 font-medium">ประสบการณ์การทำงาน</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-6 text-center border-l-4 border-green-600">
                  <div className="text-3xl font-bold text-green-800 mb-2">{activities.length}</div>
                  <p className="text-gray-700 font-medium">กิจกรรมที่เข้าร่วม</p>
                </div>
                <div className="bg-orange-50 rounded-2xl p-6 text-center border-l-4 border-orange-600">
                  <div className="text-3xl font-bold text-orange-800 mb-2">{sports.length}</div>
                  <p className="text-gray-700 font-medium">ผลงานกีฬา</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Template1;
