import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import { 
  Users, UserCheck, Calendar, Activity, Download, Search, 
  Filter, AlertTriangle, Send, Mail, Phone, CheckCircle2, 
  Clock, Flame, ShieldCheck, Sparkles, RefreshCw, ChevronDown,
  Info, TrendingUp, Bell
} from 'lucide-react';
import { StudentLead } from '../types';
import { generate30DayTrendData, WEEKLY_HEATMAP_DATA } from '../data/mockUserData';

interface AdminUserStatsProps {
  students: StudentLead[];
  onUpdateStudents: (updatedStudents: StudentLead[]) => void;
}

export default function AdminUserStats({
  students,
  onUpdateStudents,
}: AdminUserStatsProps) {
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | '7days' | '30days'>('all');
  const [activityFilter, setActivityFilter] = useState<'all' | 'active' | 'power' | 'inactive' | 'needs_reminder'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'last_active' | 'tests_high' | 'name'>('newest');

  // Engagement Reminder Modal State
  const [selectedStudentForReminder, setSelectedStudentForReminder] = useState<StudentLead | null>(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [isBulkReminder, setIsBulkReminder] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // 30-day analytics dataset
  const trendData = useMemo(() => generate30DayTrendData(), []);

  // Helper for date calculations
  const now = new Date();
  
  const getDaysAgo = (dateStr?: string) => {
    if (!dateStr) return 999;
    const d = new Date(dateStr);
    const diffTime = Math.abs(now.getTime() - d.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // DAU, WAU, MAU calculations
  const dauCount = useMemo(() => {
    return students.filter(s => getDaysAgo(s.lastActiveDate) <= 1).length;
  }, [students]);

  const wauCount = useMemo(() => {
    return students.filter(s => getDaysAgo(s.lastActiveDate) <= 7).length;
  }, [students]);

  const mauCount = useMemo(() => {
    return students.filter(s => getDaysAgo(s.lastActiveDate) <= 30).length;
  }, [students]);

  const totalRegistered = students.length;
  const testTakersCount = useMemo(() => {
    return students.filter(s => (s.testsCompletedCount || 0) > 0).length;
  }, [students]);

  const inactiveOver7Days = useMemo(() => {
    return students.filter(s => {
      const daysSinceActive = getDaysAgo(s.lastActiveDate);
      const daysSinceTest = getDaysAgo(s.lastTestDate);
      return daysSinceActive > 7 || daysSinceTest > 7 || ((s.testsCompletedCount || 0) === 0 && getDaysAgo(s.createdAt) > 7);
    });
  }, [students]);

  const totalVisitorsToday = 342;

  // Filtered & Sorted Student List
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search term
      const matchesSearch = 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm);

      if (!matchesSearch) return false;

      // Timeframe filter
      const daysCreated = getDaysAgo(s.createdAt);
      if (timeframeFilter === '7days' && daysCreated > 7) return false;
      if (timeframeFilter === '30days' && daysCreated > 30) return false;

      // Activity filter
      const testsCount = s.testsCompletedCount || 0;
      const daysActive = getDaysAgo(s.lastActiveDate);
      
      if (activityFilter === 'active' && testsCount === 0) return false;
      if (activityFilter === 'power' && testsCount < 3) return false;
      if (activityFilter === 'inactive' && testsCount > 0) return false;
      if (activityFilter === 'needs_reminder' && daysActive <= 7 && testsCount > 0) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || '2026-01-01').getTime() - new Date(a.createdAt || '2026-01-01').getTime();
      }
      if (sortBy === 'last_active') {
        return new Date(b.lastActiveDate || '2026-01-01').getTime() - new Date(a.lastActiveDate || '2026-01-01').getTime();
      }
      if (sortBy === 'tests_high') {
        return (b.testsCompletedCount || 0) - (a.testsCompletedCount || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [students, searchTerm, timeframeFilter, activityFilter, sortBy]);

  // Handle CSV Download
  const handleExportCSV = () => {
    const headers = ['Full Name', 'Email Address', 'Mobile Number', 'Verified Status', 'Registration Date', 'Last Active Date', 'Tests Completed', 'Last Test Date', 'Inactive >7d', 'Reminder Last Sent'];
    
    const rows = students.map((s) => {
      const isInactive = getDaysAgo(s.lastActiveDate) > 7 || ((s.testsCompletedCount || 0) === 0 && getDaysAgo(s.createdAt) > 7);
      return [
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.email}"`,
        `"${s.phone}"`,
        s.verified ? 'Verified' : 'Unverified',
        s.createdAt || 'N/A',
        s.lastActiveDate || 'N/A',
        s.testsCompletedCount || 0,
        s.lastTestDate || 'None',
        isInactive ? 'YES' : 'NO',
        s.reminderSentDate || 'Never'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IELTS_Mock_Hub_Registered_Users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV export downloaded successfully!');
  };

  // Trigger Reminder Modal
  const handleOpenReminderModal = (student: StudentLead) => {
    setSelectedStudentForReminder(student);
    setIsBulkReminder(false);
    setReminderMessage(
      `Hi ${student.name}, keep your IELTS prep momentum going! You haven't taken a practice test in over 7 days. Log in to IELTS Mock Hub today to claim your daily streak and boost your band score.`
    );
  };

  const handleOpenBulkReminderModal = () => {
    setSelectedStudentForReminder(null);
    setIsBulkReminder(true);
    setReminderMessage(
      `Hi IELTS Student! Don't lose your band 8.0 target momentum. It's been over a week since your last practice session. Log in now to complete an authentic mock test on IELTS Mock Hub!`
    );
  };

  const handleSendReminder = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    if (isBulkReminder) {
      const updated = students.map((s) => {
        const isInactive = getDaysAgo(s.lastActiveDate) > 7 || ((s.testsCompletedCount || 0) === 0 && getDaysAgo(s.createdAt) > 7);
        if (isInactive) {
          return { ...s, reminderSentDate: todayStr };
        }
        return s;
      });
      onUpdateStudents(updated);
      showToast(`Engagement reminders sent to ${inactiveOver7Days.length} inactive students via SMS & Email!`);
    } else if (selectedStudentForReminder) {
      const updated = students.map((s) => {
        if (s.email === selectedStudentForReminder.email || s.phone === selectedStudentForReminder.phone) {
          return { ...s, reminderSentDate: todayStr };
        }
        return s;
      });
      onUpdateStudents(updated);
      showToast(`Engagement reminder sent to ${selectedStudentForReminder.name}!`);
    }

    setSelectedStudentForReminder(null);
    setIsBulkReminder(false);
  };

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => {
      setToastNotice(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      
      {/* Notification Toast */}
      {toastNotice && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-gray-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* KPI Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50/50 p-4 border border-rose-100 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Daily Visitors</span>
            <Activity className="h-4 w-4 text-rose-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-rose-900">{totalVisitorsToday}</span>
            <span className="text-[10px] text-rose-600 block mt-0.5 font-medium">Today's Total Visits</span>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 border border-blue-100 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">DAU (Daily Active)</span>
            <Flame className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-blue-900">{dauCount}</span>
            <span className="text-[10px] text-blue-600 block mt-0.5 font-medium">Active in 24h</span>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50/50 p-4 border border-indigo-100 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">WAU (Weekly Active)</span>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-indigo-900">{wauCount}</span>
            <span className="text-[10px] text-indigo-600 block mt-0.5 font-medium">Active in 7 days</span>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/50 p-4 border border-purple-100 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">MAU (Monthly Active)</span>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-purple-900">{mauCount}</span>
            <span className="text-[10px] text-purple-600 block mt-0.5 font-medium">Active in 30 days</span>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 border border-emerald-100 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Registered Users</span>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-900">{totalRegistered}</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">Total Student Accounts</span>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 border border-amber-100 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Test Takers</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-amber-900">{testTakersCount}</span>
            <span className="text-[10px] text-amber-700 block mt-0.5 font-medium">
              {Math.round((testTakersCount / (totalRegistered || 1)) * 100)}% Conversion
            </span>
          </div>
        </div>
      </div>

      {/* 30-Day DAU & Registration Trends Chart */}
      <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-rose-600" />
              <span>30-Day DAU Trends & Registration Growth</span>
            </h3>
            <p className="text-xs text-gray-400">Daily active user engagement, new student signups, and test completion activity</p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-100 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>

        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <RechartsTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg ring-1 ring-black/5 text-xs space-y-1">
                        <p className="font-bold text-gray-900">{label}</p>
                        <div className="space-y-1 pt-1">
                          {payload.map((entry: any, i: number) => (
                            <div key={i} className="flex items-center justify-between gap-4">
                              <span className="text-gray-500 font-medium" style={{ color: entry.color }}>
                                {entry.name}:
                              </span>
                              <span className="font-bold text-gray-900">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="newRegs" fill="#f43f5e" name="New Registrations" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Line type="monotone" dataKey="dau" stroke="#3b82f6" strokeWidth={3} name="Daily Active Users (DAU)" dot={{ r: 3 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="testsTaken" stroke="#10b981" strokeWidth={2} name="Tests Completed" strokeDasharray="4 4" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Activity Heatmap */}
      <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span>Weekly Student Activity Heatmap</span>
          </h3>
          <p className="text-xs text-gray-400">Peak platform usage times and popular testing days for infrastructure resource allocation</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs min-w-[500px]">
            <thead>
              <tr className="text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                <th className="py-2 px-3 text-left">Day of Week</th>
                <th className="py-2 px-3">Morning (6AM - 12PM)</th>
                <th className="py-2 px-3">Afternoon (12PM - 6PM)</th>
                <th className="py-2 px-3">Evening (6PM - 12AM)</th>
                <th className="py-2 px-3">Night (12AM - 6AM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {WEEKLY_HEATMAP_DATA.map((row) => {
                const getHeatBg = (val: number) => {
                  if (val > 80) return 'bg-rose-600 text-white font-bold';
                  if (val > 60) return 'bg-rose-400 text-white font-bold';
                  if (val > 40) return 'bg-rose-200 text-rose-900 font-semibold';
                  if (val > 20) return 'bg-rose-50 text-rose-700';
                  return 'bg-gray-50 text-gray-400';
                };

                return (
                  <tr key={row.day} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-gray-800 text-left">{row.day}</td>
                    <td className="py-2.5 px-3">
                      <div className={`py-1.5 px-2 rounded-lg ${getHeatBg(row.morning)} transition-all`}>
                        {row.morning}% Intensity
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className={`py-1.5 px-2 rounded-lg ${getHeatBg(row.afternoon)} transition-all`}>
                        {row.afternoon}% Intensity
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className={`py-1.5 px-2 rounded-lg ${getHeatBg(row.evening)} transition-all`}>
                        {row.evening}% Intensity
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className={`py-1.5 px-2 rounded-lg ${getHeatBg(row.night)} transition-all`}>
                        {row.night}% Intensity
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl bg-indigo-50/60 p-3 border border-indigo-100 flex items-center gap-3 text-xs text-indigo-900">
          <Info className="h-4 w-4 text-indigo-600 flex-shrink-0" />
          <p>
            <strong>Usage Insight:</strong> Peak testing load occurs on <strong>Wednesday & Friday Evenings (6 PM - 12 AM)</strong> and <strong>Saturday Afternoons</strong>. Consider scheduling maintenance during Night hours (12 AM - 6 AM).
          </p>
        </div>
      </div>

      {/* Registered User List Directory with Filters & Inactive Alert */}
      <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm space-y-4">
        
        {/* Header & Inactive Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-rose-600" />
              <span>Registered Student Directory ({filteredStudents.length})</span>
            </h3>
            <p className="text-xs text-gray-400">Detailed registered user profiles, activity metadata, and engagement reminders</p>
          </div>

          {inactiveOver7Days.length > 0 && (
            <button
              onClick={handleOpenBulkReminderModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <Bell className="h-3.5 w-3.5 text-amber-600" />
              <span>Remind {inactiveOver7Days.length} Inactive Students</span>
            </button>
          )}
        </div>

        {/* Search Bar & Filters Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3 py-2 text-xs text-gray-800 outline-none focus:bg-white focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Timeframe Filter */}
          <div className="relative">
            <select
              value={timeframeFilter}
              onChange={(e: any) => setTimeframeFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-700 outline-none focus:bg-white focus:border-rose-500 transition-colors cursor-pointer"
            >
              <option value="all">Registration: All Time</option>
              <option value="7days">Registered Last 7 Days</option>
              <option value="30days">Registered Last 30 Days</option>
            </select>
          </div>

          {/* Activity Status Filter */}
          <div className="relative">
            <select
              value={activityFilter}
              onChange={(e: any) => setActivityFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-700 outline-none focus:bg-white focus:border-rose-500 transition-colors cursor-pointer"
            >
              <option value="all">Test Status: All Users</option>
              <option value="active">Active Test Takers (1+ tests)</option>
              <option value="power">Power Takers (3+ tests)</option>
              <option value="inactive">No Tests Taken (0 tests)</option>
              <option value="needs_reminder">Inactive &gt; 7 Days</option>
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-700 outline-none focus:bg-white focus:border-rose-500 transition-colors cursor-pointer"
            >
              <option value="newest">Sort: Newest Registered</option>
              <option value="last_active">Sort: Recently Active</option>
              <option value="tests_high">Sort: Most Tests Taken</option>
              <option value="name">Sort: Name (A - Z)</option>
            </select>
          </div>

        </div>

        {/* Directory Table */}
        <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/75 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="px-4 py-3">Student Profile</th>
                  <th className="px-4 py-3">Contact Details</th>
                  <th className="px-4 py-3">Registration & Active</th>
                  <th className="px-4 py-3">Tests Completed</th>
                  <th className="px-4 py-3">Status / Engagement</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No registered students found matching your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const daysActiveAgo = getDaysAgo(student.lastActiveDate);
                    const daysTestAgo = getDaysAgo(student.lastTestDate);
                    const isInactive = daysActiveAgo > 7 || ((student.testsCompletedCount || 0) === 0 && getDaysAgo(student.createdAt) > 7);

                    return (
                      <tr 
                        key={student.email + idx} 
                        className={`hover:bg-gray-50/60 transition-colors ${
                          isInactive ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {/* Student Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block">{student.name}</span>
                              {student.verified && (
                                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                  <ShieldCheck className="h-3 w-3" /> SMS Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact Details */}
                        <td className="px-4 py-3.5 space-y-0.5">
                          <div className="text-gray-700 font-mono text-[11px] flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span>{student.email}</span>
                          </div>
                          <div className="text-gray-500 font-mono text-[11px] flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{student.phone}</span>
                          </div>
                        </td>

                        {/* Dates */}
                        <td className="px-4 py-3.5 space-y-0.5 text-gray-600">
                          <div>
                            <span className="text-[10px] text-gray-400 block">Registered:</span>
                            <span className="font-medium text-gray-800">{student.createdAt || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block">Last Active:</span>
                            <span className="font-medium text-gray-800">
                              {daysActiveAgo === 0 ? 'Today' : daysActiveAgo === 1 ? 'Yesterday' : `${daysActiveAgo} days ago`}
                            </span>
                          </div>
                        </td>

                        {/* Tests Count */}
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            (student.testsCompletedCount || 0) > 0 
                              ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {student.testsCompletedCount || 0} Mock Tests
                          </span>
                          {student.lastTestDate && (
                            <span className="block text-[10px] text-gray-400 mt-1">
                              Last: {student.lastTestDate}
                            </span>
                          )}
                        </td>

                        {/* Status / Inactive Warning */}
                        <td className="px-4 py-3.5 space-y-1">
                          {isInactive ? (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                              <AlertTriangle className="h-3 w-3 text-amber-600" />
                              Inactive &gt; 7 Days
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                              <CheckCircle2 className="h-3 w-3" /> Active Learner
                            </span>
                          )}

                          {student.reminderSentDate && (
                            <span className="block text-[9px] text-indigo-600 font-semibold">
                              Reminder Sent: {student.reminderSentDate}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleOpenReminderModal(student)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 ml-auto ${
                              isInactive 
                                ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-xs' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Send className="h-3 w-3" />
                            <span>Remind</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Engagement Reminder Modal */}
      {(selectedStudentForReminder || isBulkReminder) && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            setSelectedStudentForReminder(null);
            setIsBulkReminder(false);
          }}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 border border-gray-100 shadow-2xl space-y-4 my-8 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm">
                    {isBulkReminder ? `Bulk Engagement Reminder (${inactiveOver7Days.length} Students)` : `Send Engagement Reminder`}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {isBulkReminder ? 'Notify all students inactive for over 7 days' : `Targeted notification to ${selectedStudentForReminder?.name}`}
                  </p>
                </div>
              </div>
            </div>

            {!isBulkReminder && selectedStudentForReminder && (
              <div className="rounded-xl bg-gray-50 p-3 border border-gray-150 text-xs space-y-1">
                <p className="font-bold text-gray-800">{selectedStudentForReminder.name}</p>
                <p className="text-gray-500 font-mono text-[11px]">Email: {selectedStudentForReminder.email} | Mobile: {selectedStudentForReminder.phone}</p>
                <p className="text-amber-700 text-[11px] font-semibold">
                  Last Active: {selectedStudentForReminder.lastActiveDate || 'N/A'} ({getDaysAgo(selectedStudentForReminder.lastActiveDate)} days ago)
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-600 uppercase">
                Reminder Message (SMS & Email Preview)
              </label>
              <textarea
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs text-gray-800 outline-none focus:bg-white focus:border-rose-500 transition-colors leading-relaxed font-sans"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedStudentForReminder(null);
                  setIsBulkReminder(false);
                }}
                className="flex-1 py-2.5 border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReminder}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-xl shadow-md shadow-rose-100 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send Reminder Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
