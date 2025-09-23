"use client";
import React from 'react';
import { FiUsers, FiFileText, FiActivity, FiUserCheck, FiBarChart2, FiBell } from 'react-icons/fi';
import ActivityChart from '../../../components/admin/charts/ActivityChart';
import UserStats from '../../../components/admin/charts/UserStats';
import ActivityTable from '../../../components/admin/tables/ActivityTable';

// Stat Card Component
const StatCard = ({ icon, title, value, change, changeType = 'neutral' }) => {
  const colorClass =
    changeType === 'increase'
      ? 'text-green-600'
      : changeType === 'decrease'
      ? 'text-red-600'
      : 'text-gray-500'; // neutral

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center">
        <div className="bg-blue-100 p-3 rounded-full">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
      {change && (
        <div className={`mt-2 text-sm flex items-center ${colorClass}`}>
          {change}
        </div>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, Admin!</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-sm">
            Create Report
          </button>
          <FiBell className="text-gray-500 h-6 w-6 cursor-pointer hover:text-blue-600" aria-label="Notifications" />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FiUsers className="text-blue-500 h-6 w-6" />}
          title="Total Users"
          value="1,402"
          change="+2.5% this month"
          changeType="increase"
        />
        <StatCard
          icon={<FiActivity className="text-green-500 h-6 w-6" />}
          title="Active Sessions"
          value="289"
          change="-1.2% today"
          changeType="decrease"
        />
        <StatCard
          icon={<FiFileText className="text-yellow-500 h-6 w-6" />}
          title="News Articles"
          value="76"
          change="+5 new articles"
          changeType="increase"
        />
        <StatCard
          icon={<FiUserCheck className="text-indigo-500 h-6 w-6" />}
          title="New Signups"
          value="32"
          change="this week" // ไม่มี changeType จะเป็น neutral (สีเทา)
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <FiBarChart2 className="mr-3 text-blue-500" />
              User Activity
            </h2>
            <div className="h-80">
              <ActivityChart />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Activities</h2>
            <ActivityTable />
          </div>
        </div>

        {/* Right Column: Stats & Quick Actions */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">User Statistics</h2>
            <UserStats />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
            <div className="flex flex-col space-y-3">
              <button className="w-full px-4 py-2 text-left bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Manage Users</button>
              <button className="w-full px-4 py-2 text-left bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Publish News</button>
              <button className="w-full px-4 py-2 text-left bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors">System Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
