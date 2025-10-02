"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiFileText,
  FiActivity,
  FiUserCheck,
  FiBarChart2,
  FiBell,
  FiArrowRight,
} from 'react-icons/fi';
import ActivityChart from '../../../components/admin/charts/ActivityChart';
import UserStats from '../../../components/admin/charts/UserStats';
import ActivityTable from '../../../components/admin/tables/ActivityTable';
import { adminApi } from '../../../services/adminApi';

const DEFAULT_SUMMARY = {
  members: {
    total: 0,
    status: {
      active: 0,
      pending: 0,
      suspended: 0,
      rejected: 0,
    },
    signupsLast30Days: [],
  },
  admins: {
    total: 0,
    byRole: {
      superadmin: 0,
      admin: 0,
    },
  },
  news: {
    total: 0,
    status: {
      published: 0,
      draft: 0,
    },
  },
  email: {
    totalBroadcasts: 0,
    lastBroadcast: null,
  },
};

const StatCard = ({ icon, title, value, description, tone = 'neutral' }) => {
  const toneClass = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    info: 'text-blue-600',
  }[tone] || 'text-gray-500';

  return (
    <div className="rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
      <div className="flex items-center">
        <div className="rounded-full bg-blue-100 p-3 text-blue-500">{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
      {description && <p className={`mt-3 text-sm ${toneClass}`}>{description}</p>}
    </div>
  );
};

const NewsList = ({ items = [], onOpen }) => {
  if (!items.length) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-500">
        ยังไม่มีข่าวล่าสุด
      </div>
    );
  }

  return (
    <ul className="space-y-3 text-sm text-gray-700">
      {items.map((news) => (
        <li key={news.news_id || news.id} className="rounded-md border border-gray-200 p-3">
          <p className="font-semibold text-gray-800">{news.title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">{news.summary || news.content}</p>
          <button
            type="button"
            onClick={() => onOpen?.(news)}
            className="mt-2 inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-500"
          >
            เปิดดูรายละเอียด
            <FiArrowRight className="ml-1" />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentNews, setRecentNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const [analyticsData, membersRes, newsRes] = await Promise.all([
          adminApi.getAnalyticsSummary().catch((err) => {
            if (err?.response?.status === 404) {
              console.warn('Analytics summary endpoint returned 404, falling back to default values');
              return DEFAULT_SUMMARY;
            }
            throw err;
          }),
          adminApi.getMembers({ pageSize: 5 }).catch((err) => {
            console.warn('Failed to load recent members', err);
            return { data: [] };
          }),
          adminApi.getNews({ pageSize: 5 }).catch((err) => {
            console.warn('Failed to load recent news', err);
            return { data: [] };
          }),
        ]);

        setSummary(analyticsData || DEFAULT_SUMMARY);
        setRecentMembers(membersRes.data || []);
        setRecentNews(newsRes.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setError(err?.message || 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const chartSeries = useMemo(() => {
    if (!summary?.members?.signupsLast30Days?.length) {
      return [];
    }
    const series = summary.members.signupsLast30Days.map((item) => ({
      date: item.date,
      count: Number(item.count) || 0,
    }));
    return series.slice(-14);
  }, [summary]);

  const latestSignup = chartSeries.length ? chartSeries[chartSeries.length - 1].count : 0;
  const totalMembers = summary?.members?.total ?? '-';
  const activeMembers = summary?.members?.status?.active ?? 0;
  const pendingMembers = summary?.members?.status?.pending ?? 0;
  const totalNews = summary?.news?.total ?? '-';
  const publishedNews = summary?.news?.status?.published ?? 0;
  const draftNews = summary?.news?.status?.draft ?? 0;
  const totalAdmins = summary?.admins?.total ?? '-';
  const superAdmins = summary?.admins?.byRole?.superadmin ?? 0;
  const admins = summary?.admins?.byRole?.admin ?? 0;

  const statCards = [
    {
      icon: <FiUsers className="h-6 w-6" />,
      title: 'สมาชิกทั้งหมด',
      value: totalMembers,
      description: `ใช้งานอยู่ ${activeMembers} | รออนุมัติ ${pendingMembers}`,
      tone: 'info',
    },
    {
      icon: <FiActivity className="h-6 w-6" />,
      title: 'การสมัครล่าสุด',
      value: latestSignup,
      description: 'ยอดสมัครสมาชิกในวันล่าสุดที่บันทึก',
      tone: latestSignup ? 'positive' : 'neutral',
    },
    {
      icon: <FiFileText className="h-6 w-6" />,
      title: 'ข่าวประชาสัมพันธ์',
      value: totalNews,
      description: `เผยแพร่แล้ว ${publishedNews} | ฉบับร่าง ${draftNews}`,
      tone: 'info',
    },
    {
      icon: <FiUserCheck className="h-6 w-6" />,
      title: 'ผู้ดูแลระบบ',
      value: totalAdmins,
      description: `Super Admin ${superAdmins} | Admin ${admins}`,
      tone: 'info',
    },
  ];

  const handleNavigate = (path) => () => navigate(path);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">กำลังโหลดข้อมูลแดชบอร์ด...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-5 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">แดชบอร์ดผู้ดูแลระบบ</h1>
          <p className="mt-1 text-gray-500">ภาพรวมสถานะล่าสุดของระบบสมาชิกและข่าวสาร</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* <button
            type="button"
            onClick={handleNavigate('/admin/analytics')}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-300 hover:bg-blue-700"
          >
            เปิดหน้า Analytics
          </button> */}
          <FiBell className="h-6 w-6 cursor-pointer text-gray-500" aria-label="การแจ้งเตือน" />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-700">
              <FiBarChart2 className="mr-3 text-blue-500" />
              สถิติการสมัครสมาชิก
            </h2>
            <ActivityChart series={chartSeries} />
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-700">สมาชิกที่เพิ่งสมัคร</h2>
              <button
                type="button"
                onClick={handleNavigate('/admin/users')}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                ดูทั้งหมด
              </button>
            </div>
            <ActivityTable members={recentMembers} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">สรุปสมาชิก & ผู้ดูแล</h2>
            <UserStats members={summary?.members} admins={summary?.admins} />
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-700">ข่าวล่าสุด</h2>
              <button
                type="button"
                onClick={handleNavigate('/admin/content/news')}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                จัดการข่าว
              </button>
            </div>
            <NewsList
              items={recentNews}
              onOpen={(news) => navigate(`/admin/content/news/edit/${news.news_id || news.id}`)}
            />
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">เมนูลัด</h2>
            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={handleNavigate('/admin/users/create')}
                className="w-full rounded-lg bg-blue-500 px-4 py-2 text-left font-medium text-white transition-colors hover:bg-blue-600"
              >
                เพิ่มผู้ใช้งานใหม่
              </button>
              <button
                type="button"
                onClick={handleNavigate('/admin/content/news/create')}
                className="w-full rounded-lg bg-green-500 px-4 py-2 text-left font-medium text-white transition-colors hover:bg-green-600"
              >
                สร้างข่าวประชาสัมพันธ์
              </button>
              <button
                type="button"
                onClick={handleNavigate('/admin/settings')}
                className="w-full rounded-lg bg-gray-700 px-4 py-2 text-left font-medium text-white transition-colors hover:bg-gray-800"
              >
                ตั้งค่าระบบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
