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

const chunk = (arr = [], n = 2) =>
  arr.reduce((acc, item, i) => {
    if (i % n === 0) acc.push([item]);
    else acc[acc.length - 1].push(item);
    return acc;
  }, []);

import React,{ Fragment } from "react";
const Template1 = ({ data, showSection, formatDate, toAbsUrl }) => {
  const { personalInfo: user = {}, workExperiences: works = [], activities = [], sports = [] } = data || {};
  // เพิ่มไว้ด้านบนในฟังก์ชัน Template1 (ใต้ const {...} = data)
  const isImage = (s = "") => /\.(png|jpe?g|gif|webp|svg)$/i.test(String(s));
  const shortName = (name = "", max = 28) =>
    name.length > max ? `${name.slice(0, max)}…` : name;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* หน้าปก - Cover Page */}
      <div className="print-cover min-h-screen flex items-center justify-center p-8">
        <div className="cover-content text-center max-w-2xl mx-auto">
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

      {/* หน้าคำนำ - Preface Page */}
      <div className="print-section min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-blue-600 h-full flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-blue-800 mb-8 text-center border-b pb-6">
              คำนำ
            </h2>

            <div className="text-center space-y-8">
              {/* <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto">
                {(user.first_name_th || user.first_name_en || "U").charAt(0)}
              </div> */}

              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-xl font-medium text-blue-800">
                  Portfolio นี้รวบรวมประสบการณ์และผลงานที่สำคัญของฉัน
                </p>

                <p className="text-lg">
                  ในฐานะ <span className="font-semibold text-blue-700">{user.first_name_th} {user.last_name_th}</span>
                  {user.st_id && (
                    <span> รหัสนิสิต {user.st_id}</span>
                  )}
                  {user.education && (
                    <span> จาก{user.education}</span>
                  )}
                </p>

                <p className="text-lg">
                  Portfolio นี้ประกอบด้วยการรวบรวมประสบการณ์การทำงาน กิจกรรมต่างๆ ที่เข้าร่วม
                  รวมถึงผลงานด้านกีฬาที่แสดงถึงความสามารถและการพัฒนาตนเองอย่างต่อเนื่อง
                </p>

                <div className="bg-blue-50 rounded-2xl p-6 my-8">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">เป้าหมาย</h3>
                  <p className="text-gray-700">
                    Portfolio นี้จัดทำขึ้นเพื่อแสดงถึงความสามารถ ทักษะ และประสบการณ์ที่ได้รับ
                    เป็นเครื่องมือสำหรับการนำเสนอตัวตนและศักยภาพในการทำงานและการเรียนรู้
                  </p>
                </div>

                {/* <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                      {works.length}
                    </div>
                    <p className="font-semibold text-blue-800">ประสบการณ์การทำงาน</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                      {activities.length}
                    </div>
                    <p className="font-semibold text-green-800">กิจกรรมที่เข้าร่วม</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                      {sports.length}
                    </div>
                    <p className="font-semibold text-orange-800">ผลงานกีฬา</p>
                  </div>
                </div> */}

                <div className="mt-8 pt-6 border-t border-blue-200">
                  <p className="text-gray-600 italic">
                    "การเรียนรู้และพัฒนาตนเองเป็นกระบวนการที่ไม่มีที่สิ้นสุด"
                  </p>
                  <p className="text-right text-blue-700 font-medium mt-2">
                    {user.first_name_th} {user.last_name_th}
                  </p>
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
            <div className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-blue-600">
              <h2 className="text-4xl font-bold text-blue-800 mb-8 text-center border-b pb-6">
                ข้อมูลส่วนตัว
              </h2>

              <div className="flex flex-col md:flex-row items-start gap-8">
                {/* <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto md:mx-0">
                  {(user.first_name_th || user.first_name_en || "U").charAt(0)}
                </div> */}
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
{/* หน้าประสบการณ์การทำงาน - Work Experience Page */}
{showSection.works && (
  <>
    {chunk(works, 2).map((group, gi) => (
      <div key={`works-page-${gi}`} className="print-section print-section2 min-h-screen p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-4xl font-bold text-blue-800 flex items-center gap-4 mb-8 text-center justify-center border-b pb-6">
              <Briefcase className="w-10 h-10 text-blue-600" />
              ประสบการณ์การทำงาน
            </h2>

            {group.length === 0 ? (
              <div className="text-gray-500 text-center py-12 flex items-center justify-center gap-2">
                <ImageIcon className="w-6 h-6" />
                <span className="text-xl">ยังไม่มีประสบการณ์การทำงาน</span>
              </div>
            ) : (
              <div className="space-y-8">
                {group.map((work, indexInGroup) => {
                  // index จริง (ใช้โชว์เลขลำดับ)
                  const absoluteIndex = gi * 2 + indexInGroup;

                  return (
                    <div key={work.id || absoluteIndex} className="relative no-break-inside">
                      {/* เส้น timeline ระหว่างบัตร (เก็บไว้เหมือนเดิม) */}
                      {absoluteIndex !== works.length - 1 && (
                        <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-blue-200" />
                      )}

                      <div className="flex gap-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                          {absoluteIndex + 1}
                        </div>

                        <div className="flex-1">
                          <div className="bg-blue-50 rounded-2xl p-8 border-l-4 border-blue-600">
                            <h4 className="text-2xl font-semibold text-gray-900 mb-2">
                              {work.jobTitle || "-"}
                            </h4>
                            <p className="text-lg text-blue-700 font-medium mb-4">
                              {formatDate(work.startDate)} - {formatDate(work.endDate)}
                            </p>

                            {work.jobDescription && (
                              <p className="text-gray-700 whitespace-pre-line text-lg leading-relaxed">
                                {work.jobDescription}
                              </p>
                            )}

                            {Array.isArray(work.files) && work.files.length > 0 && (
                              <div className="mt-6 grid xs:grid-cols-2 sm:grid-cols-3 gap-4">
                                {work.files.map((f, i) => {
                                  const src  = toAbsUrl(f?.url || f?.filePath);
                                  const name = f?.name || (f?.filePath || "").split("/").pop() || "";
                                  const isImg = /\.(png|jpe?g|gif|webp|bmp|svg|tiff)$/i.test(src || name);
                                  if (!isImg) return null;
                                  return (
                                    <figure
                                      key={f?.id || i}
                                      className="work-thumb no-break-inside w-full aspect-square max-w-[260px]
                                                 rounded-xl overflow-hidden border border-gray-200 bg-white
                                                 grid place-items-center p-2"
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
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    ))}
  </>
)}
{/* หน้ากิจกรรม - Activities Page */}
{showSection.activities && (
  <>
    {chunk(activities, 2).map((group, gi) => (
      <div key={`act-page-${gi}`} className="print-section min-h-screen p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-4xl font-bold text-green-800 flex items-center gap-4 mb-8 text-center justify-center border-b pb-6">
              <Users className="w-10 h-10 text-green-600" />
              กิจกรรม
            </h2>

            {group.length === 0 ? (
              <div className="text-gray-500 text-center py-12 flex items-center justify-center gap-2">
                <ImageIcon className="w-6 h-6" />
                <span className="text-xl">ยังไม่มีกิจกรรม</span>
              </div>
            ) : (
              <div className="grid gap-8">
                {group.map((activity, i) => (
                  <div
                    key={activity.id || `${gi}-${i}`}
                    className="bg-green-50 rounded-2xl p-8 border-l-4 border-green-600 no-break-inside"
                  >
                    <h4 className="text-2xl font-semibold text-gray-900 mb-2">
                      {activity.name || "-"}
                    </h4>
                    <p className="text-green-700 font-medium text-lg mb-2">
                      {activity.type || "-"}
                    </p>
                    <p className="text-lg text-gray-600 mb-4">
                      {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                    </p>

                    {activity.description && (
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg mb-4">
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
    ))}
  </>
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