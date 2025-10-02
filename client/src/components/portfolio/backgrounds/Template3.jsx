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

const chunk = (arr = [], n = 2) =>
  arr.reduce((acc, item, i) => {
    if (i % n === 0) acc.push([item]);
    else acc[acc.length - 1].push(item);
    return acc;
  }, []);


const Template3 = ({ data, showSection, formatDate, toAbsUrl }) => {
  const { personalInfo: user = {}, workExperiences: works = [], activities = [], sports = [] } = data || {};
  // ตรวจรูป
  const isImage = (s = "") => /\.(png|jpe?g|gif|webp|svg|bmp|tiff)$/i.test(String(s));

  // ตัดชื่อไฟล์ให้สั้นลง พร้อม …
  const shortName = (name = "", limit = 28) =>
    name.length > limit ? name.slice(0, limit - 1) + "…" : name;
  return (
    <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 min-h-screen">
      {/* หน้าปก - Cover Page */}
      <div
        className="
    print-cover min-h-screen flex items-center justify-center p-8 relative overflow-hidden
    print:h-[100vh] 
    print:min-h-0 
    print:max-h-[100vh]
    print:box-border 
    print:p-[12mm]
    print:justify-start 
    print:pt-[10mm] 
    print:pb-0
  "
      >

        <div className="text-center max-w-2xl mx-auto relative z-10 mt-[-8px] print:mt-0">
          <h1 className="
      text-6xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600
      bg-clip-text text-transparent mb-4
      print:text-5xl print:mb-2
    ">
            PORTFOLIO
          </h1>

          {/* hr (เส้นสีใต้หัว) */}
          <div className="
      w-24 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600
      mx-auto mb-8
      print:mb-3
    " />

          {/* H2 */}
          <h2 className="
      text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600
      bg-clip-text text-transparent mb-2
      print:text-3xl print:mb-1
    ">
            {user.first_name_th} {user.last_name_th}
          </h2>

          {/* H3 */}
          <h3 className="text-2xl text-gray-600 mb-6 print:text-xl print:mb-3">
            {user.first_name_en} {user.last_name_en}
          </h3>

          {/* st_id */}
          {user.st_id && (
            <p className="text-xl text-gray-700 mb-4 print:text-lg print:mb-2">
              รหัสนิสิต: {user.st_id}
            </p>
          )}

          {/* education */}
          {user.education && (
            <p className="text-lg text-gray-600 print:text-base">
              {user.education}
            </p>
          )}
        </div>
      </div>



{/* หน้าคำนำ - Creative Preface Page */}
<div className="print-section min-h-screen p-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-16 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-32 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/50">
            {/* Creative Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-12 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                <h2 className="text-4xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  คำนำ
                </h2>
                <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Creative Profile Section */}
            <div className="flex flex-col lg:flex-row items-center gap-10 mb-10">
              {/* Artistic Profile Circle */}
              
              
              {/* Introduction Text */}
              <div className="flex-1 text-center lg:text-left">
                <div className="space-y-6">
                  <div className="relative">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      สวัสดี! ฉันคือ {user.first_name_th} {user.last_name_th}
                    </h3>
                    <p className="text-lg text-gray-600 italic">
                      {user.first_name_en} {user.last_name_en}
                    </p>
                  </div>
                  
                  
                </div>
              </div>
            </div>
            
            {/* Mission & Vision Cards */}
            <div className="grid md:grid-cols-2 print:grid-cols-2 gap-8 mb-10 preface-grid">
              <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-8 border border-pink-200 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🎯</span>
                  </div>
                  <h4 className="text-xl font-bold text-pink-800">เป้าหมาย</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  สร้างสรรค์ผลงานที่มีคุณค่า พัฒนาทักษะอย่างต่อเนื่อง 
                  และสร้างแรงบันดาลใจให้กับผู้คนรอบข้าง
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl p-8 border border-purple-200 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">💫</span>
                  </div>
                  <h4 className="text-xl font-bold text-purple-800">วิสัยทัศน์</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  เป็นส่วนหนึ่งในการสร้างการเปลี่ยนแปลงเชิงบวก ผ่านความคิดสร้างสรรค์และการลงมือปฏิบัติจริง
                </p>
              </div>
            </div>
            
            {/* Creative Stats Dashboard */}
            <div className="bg-gradient-to-r from-white20/80 to-gray-80/80 rounded-3xl p-8 mb-10 border border-gray-200">
              <h4 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                ความภาคภูมิใจในตัวเลข
              </h4>
              
              <div className="grid md:grid-cols-3 print:grid-cols-3 gap-8 stats-grid print:[&>*]:break-inside-avoid">

                {/* Work Experience Card */}
                <div className="text-center group">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto shadow-xl group-hover:rotate-6 transition-transform duration-300">
                      {works.length}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full"></div>
                  </div>
                  <h5 className="font-bold text-blue-800 text-lg">ประสบการณ์</h5>
                  <p className="text-gray-600">การทำงาน</p>
                </div>
                
                {/* Activities Card */}
                <div className="text-center group">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto shadow-xl group-hover:rotate-6 transition-transform duration-300">
                      {activities.length}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-400 rounded-full"></div>
                  </div>
                  <h5 className="font-bold text-green-800 text-lg">กิจกรรม</h5>
                  <p className="text-gray-600">ที่เข้าร่วม</p>
                </div>
                
                {/* Sports Card */}
                <div className="text-center group">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto shadow-xl group-hover:rotate-6 transition-transform duration-300">
                      {sports.length}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-400 rounded-full"></div>
                  </div>
                  <h5 className="font-bold text-orange-800 text-lg">กีฬา</h5>
                  <p className="text-gray-600">ที่ลงแข่ง</p>
                </div>
              </div>
            </div>
            
            {/* Personal Quote Section */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl p-4 text-white shadow-2xl">
                {/* <div className="mb-4">
                  <span className="text-6xl opacity-50">"</span>
                </div> */}
                <p className="text-xl font-medium leading-relaxed mb-4 italic">
                  ความสำเร็จไม่ได้วัดจากจุดหมาย แต่วัดจากการเดินทางและการเรียนรู้ในแต่ละก้าว
                </p>
                <div className="flex items-center justify-center gap-4 mt-6">
                  <div className="w-12 h-0.5 bg-white/50"></div>
                  <p className="font-bold text-lg">
                    {user.first_name_th} {user.last_name_th}
                  </p>
                  <div className="w-12 h-0.5 bg-white/50"></div>
                </div>
               
              </div>
            </div>
          </div>
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

                <div className="grid md:grid-cols-4 gap-6 personal-cards">
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 print-flow rounded-2xl p-6 text-white text-center">
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
  <>
    {chunk(works, 2).map((group, gi) => (
      <div key={`works-page-${gi}`} className="print-section min-h-screen p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-4 mb-8 text-center justify-center border-b pb-6">
              <Briefcase className="w-10 h-10 text-purple-600" />
              ประสบการณ์การทำงาน
            </h2>

            <div className="space-y-8">
              {group.map((work, index) => (
                <div
                  key={work.id || `${gi}-${index}`}
                  className={`rounded-3xl p-8 no-break-inside ${
                    (gi * 2 + index) % 2 === 0
                      ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-l-4 border-pink-500 mt-6'
                      : 'bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-500 mt-6'
                  }`}
                >
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">
                    {work.jobTitle || "-"}
                  </h4>
                  <p className="text-lg text-gray-600 mb-4">
                    {formatDate(work.startDate)} - {formatDate(work.endDate)}
                  </p>
                  {work.jobDescription && (
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">
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
              ))}
            </div>
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
      <div key={`acts-page-${gi}`} className="print-section p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-4 mb-8 text-center justify-center border-b pb-6">
              <Users className="w-10 h-10 text-green-600" />
              กิจกรรม
            </h2>

            <div className="space-y-8">
              {group.map((activity, j) => (
                <div
                  key={activity.id || `${gi}-${j}`}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200 no-break-inside"
                >
                  <h4 className="text-2xl font-semibold text-gray-900 mb-2">{activity.name || "-"}</h4>
                  <p className="text-green-700 font-medium text-lg mb-2">{activity.type || "-"}</p>
                  <p className="text-lg text-gray-600 mb-4">
                    {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                  </p>
                  {activity.description && (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg mb-6">
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
