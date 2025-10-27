import React from 'react';

const UserForm = ({ user, setUser, onSubmit, loading, error, isEditing }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'role') {
        next.accountType = 'admin';
      }
      if (name === 'email' && (!prev.username || prev.username.trim() === '') && prev.accountType === 'admin') {
        const suggestion = value.split('@')[0]?.trim();
        if (suggestion) {
          next.username = suggestion;
        }
      }
      return next;
    });
  };

  const selectedRole = user.accountType === 'general' ? 'general' : (user.role || 'admin');
  const isGeneralAccount = selectedRole === 'general';
  const isAdminAccount = !isGeneralAccount;

  const handleRoleSelect = (e) => {
    const { value } = e.target;
    setUser((prev) => {
      if (value === 'general') {
        return {
          ...prev,
          accountType: 'general',
          role: 'general',
          username: '',
          status: 'active',
        };
      }
      return {
        ...prev,
        accountType: 'admin',
        role: value,
        status: prev.status || 'active',
      };
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      {error && <div className="text-red-500 bg-red-100 p-3 rounded">{error}</div>}

      <fieldset className="space-y-3">
        <legend className="block text-sm font-medium text-gray-700">บทบาทและปลายทาง</legend>
        <p className="text-sm text-gray-500">ใช้เพื่อเลือกว่าจะจัดเก็บบัญชีใหม่ไว้ที่ใด</p>
        <div className="space-y-2">
          <label className="flex items-start gap-3 rounded-md border border-gray-200 p-3 hover:border-blue-400">
            <input
              type="radio"
              name="roleSelection"
              value="general"
              checked={selectedRole === 'general'}
              onChange={handleRoleSelect}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span>
              <span className="font-medium text-gray-900">ผู้ใช้ทั่วไป</span>
              {/* <span className="block text-sm text-gray-500">จัดเก็บในตาราง `users`</span> */}
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-md border border-gray-200 p-3 hover:border-blue-400">
            <input
              type="radio"
              name="roleSelection"
              value="admin"
              checked={selectedRole === 'admin'}
              onChange={handleRoleSelect}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span>
              <span className="font-medium text-gray-900">ผู้ดูแลระบบ</span>
              {/* <span className="block text-sm text-gray-500">จัดเก็บในตาราง `admins`</span> */}
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-md border border-gray-200 p-3 hover:border-blue-400">
            <input
              type="radio"
              name="roleSelection"
              value="superadmin"
              checked={selectedRole === 'superadmin'}
              onChange={handleRoleSelect}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span>
              <span className="font-medium text-gray-900">ผู้ดูแลระบบสูงสุด</span>
              {/* <span className="block text-sm text-gray-500">จัดเก็บในตาราง `admins`</span> */}
            </span>
          </label>
        </div>
      </fieldset>

      {isAdminAccount ? (
        <>
          {/* <p className="text-sm text-gray-500">บัญชีระดับผู้ดูแลระบบต้องมีชื่อผู้ใช้และจะถูกบันทึกในตาราง `admins`</p> */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={user.username || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              ชื่อเต็ม
            </label>
            <input
              type="text"
              name="full_name"
              id="full_name"
              value={user.full_name || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              อีเมล
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={user.email || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {isEditing ? 'รหัสผ่าน (เว้นว่างไว้เพื่อใช้รหัสผ่านเดิม)' : 'รหัสผ่าน'}
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={user.password || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required={!isEditing}
            />
          </div>

          {/* <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              id="role"
              value={selectedRole}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div> */}

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              สถานะ
            </label>
            <select
              name="status"
              id="status"
              value={user.status || 'active'}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">ใช้งานอยู่</option>
              <option value="suspended">ถูกระงับ</option>
            </select>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500">ผู้ใช้ทั่วไปจะใช้โปรไฟล์นักศึกษามาตรฐานและจะถูกบันทึกในตาราง `users`</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">คำนำหน้า</label>
              <input
                type="text"
                name="title"
                value={user.title || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">การศึกษา</label>
              <input
                type="text"
                name="education"
                value={user.education || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">ชื่อ (ไทย)</label>
              <input
                type="text"
                name="first_name_th"
                value={user.first_name_th || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">นามสกุล (ไทย)</label>
              <input
                type="text"
                name="last_name_th"
                value={user.last_name_th || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">ชื่อ (อังกฤษ)</label>
              <input
                type="text"
                name="first_name_en"
                value={user.first_name_en || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">นามสกุล (อังกฤษ)</label>
              <input
                type="text"
                name="last_name_en"
                value={user.last_name_en || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">โทรศัพท์</label>
              <input
                type="text"
                name="phone"
                value={user.phone || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">อีเมล</label>
              <input
                type="email"
                name="email"
                value={user.email || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">รหัสนักศึกษา (ไม่บังคับ)</label>
              <input
                type="text"
                name="st_id"
                value={user.st_id || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">รหัสนักศึกษา (ทางการ)</label>
              <input
                type="text"
                name="st_id_canonical"
                value={user.st_id_canonical || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              value={user.password || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึกผู้ใช้'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
