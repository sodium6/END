import { useEffect, useState } from "react";
import { getProfile, updateProfileDetails, deleteAccount, logoutUser } from "../../../services/authApi";
import { useNavigate } from "react-router-dom";
import HeaderProfile from "../../../components/profile/HeaderProfile";
import PersonalDetails from "../../../components/profile/PersonalDetails";
import ContactInfo from "../../../components/profile/ContactInfo";
import EducationHistory from "../../../components/profile/EducationHistory";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async (force) => {
    try {
      if (force) setLoading(true);
      const data = await getProfile();
      setUser(data.user);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (updatedData) => {
    // Optimistic update for UI speed
    setUser(updatedData);

    // Call backend
    try {
      // Separate handling based on what's updated? 
      // For simple fields (Header/Personal/Contact), we use updateProfileDetails
      // But the components call API directly for some things?
      // No, current design: components call props.onUpdate.

      await updateProfileDetails(updatedData);

      // Refetch to get clean state? Or just trust updatedData?
      // Refetch is safer for fields like 'profile_visibility' 
      // fetchProfile(); 
      window.dispatchEvent(new Event('user-profile-updated')); // Notify Sidebar and others
    } catch (e) {
      console.error("Update failed", e);
      alert("อัปเดตไม่สำเร็จ");
      fetchProfile(); // Revert
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ คำเตือน: คุณแน่ใจหรือไม่ที่จะลบบัญชีผู้ใช้งานนี้? ข้อมูลทั้งหมดจะหายไปและไม่สามารถกู้คืนได้")) {
      return;
    }

    // Safety check: Prompt for email confirmation or something? simple confirm is OK for now.

    try {
      await deleteAccount();
      alert("ลบบัญชีเรียบร้อยแล้ว");
      await logoutUser();
      navigate("/sign-in");
    } catch (err) {
      console.error("Delete account error:", err);
      alert(err.response?.data?.message || "ไม่สามารถลบบัญชีได้");
    }
  };

  if (loading && !user) return <div className="min-h-screen flex items-center justify-center text-slate-500">กำลังโหลดข้อมูล...</div>;
  if (!user) return <div className="p-10 text-center text-red-500">ไม่พบข้อมูลผู้ใช้</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sarabun pb-20">

      {/* Header Profile Section */}
      <HeaderProfile
        user={user}
        onUpdate={handleUpdateUser}
        viewingSelf={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left / Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <PersonalDetails
            user={user}
            onUpdate={handleUpdateUser}
            viewingSelf={true}
          />

          <EducationHistory
            user={user}
            onUpdate={fetchProfile} // Education triggers refetch on list change
            viewingSelf={true}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <ContactInfo
            user={user}
            onUpdate={handleUpdateUser}
            viewingSelf={true}
          />

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
            <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
              ⚠️ พื้นที่อันตราย
            </h3>
            <p className="text-sm text-red-600 mb-4">
              ลบบัญชีผู้ใช้งานของคุณถาวร ไม่สามารถกู้คืนได้
            </p>
            <button
              onClick={handleDeleteAccount}
              className="w-full py-2 bg-white border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-600 hover:text-white transition-all text-sm"
            >
              ลบบัญชีของฉัน
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}