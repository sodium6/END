import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/adminApi';
import CategoryModal from '../../../components/admin/modals/CategoryModal';
import { useNavigate } from 'react-router-dom';

export default function CategoryManagement() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getCategories();
            // res might be { categories: [...] } or just array depending on controller
            // My controller returns { categories: [...] }
            setCategories(res.categories || []);
        } catch (err) {
            setError(err.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSave = async (data) => {
        if (editingCategory) {
            await adminApi.updateCategory(editingCategory.category_id, data);
        } else {
            await adminApi.createCategory(data);
        }
        fetchCategories();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้? ข่าวที่ใช้หมวดหมู่นี้อาจไม่มีหมวดหมู่')) return;
        try {
            await adminApi.deleteCategory(id);
            fetchCategories();
        } catch (err) {
            alert(err.message || 'Failed to delete');
        }
    };

    const openCreate = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const openEdit = (cat) => {
        setEditingCategory(cat);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">จัดการหมวดหมู่ข่าวสาร</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/admin/content/news')}
                        className="px-4 py-2 border text-gray-600 rounded-md hover:bg-gray-50"
                    >
                        กลับไปหน้าข่าวสาร
                    </button>
                    <button
                        onClick={openCreate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        + เพิ่มหมวดหมู่
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">กำลังโหลด...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คำอธิบาย</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map((cat, i) => (
                                <tr key={cat.category_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{i + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.description || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openEdit(cat)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            แก้ไข
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.category_id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            ลบ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">ไม่พบข้อมูล</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={editingCategory}
                onSave={handleSave}
            />
        </div>
    );
}
