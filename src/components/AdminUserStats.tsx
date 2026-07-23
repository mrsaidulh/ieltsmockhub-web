import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import { 
  Users, UserCheck, Calendar, Activity, Download, Search, 
  Filter, AlertTriangle, Send, Mail, Phone, CheckCircle2, 
  Clock, Flame, ShieldCheck, Sparkles, RefreshCw, ChevronDown,
  Info, TrendingUp, Bell, RotateCcw, Trash2, UserX, CheckSquare, Square,
  Eye, EyeOff, Lock, Unlock, Key, KeyRound, Smartphone, Copy, Check
} from 'lucide-react';
import { StudentLead, AdminUser } from '../types';
import { generate30DayTrendData, WEEKLY_HEATMAP_DATA } from '../data/mockUserData';

interface AdminUserStatsProps {
  students: StudentLead[];
  onUpdateStudents: (updatedStudents: StudentLead[]) => void;
  adminUser?: AdminUser | null;
  onResetAnalytics?: () => void;
}

export default function AdminUserStats({
  students,
  onUpdateStudents,
  adminUser,
  onResetAnalytics
}: AdminUserStatsProps) {
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | '7days' | '30days'>('all');
  const [activityFilter, setActivityFilter] = useState<'all' | 'active' | 'power' | 'inactive' | 'needs_reminder' | 'locked'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'last_active' | 'tests_high' | 'name'>('newest');

  // Engagement Reminder Modal State
  const [selectedStudentForReminder, setSelectedStudentForReminder] = useState<StudentLead | null>(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [isBulkReminder, setIsBulkReminder] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
  // Bulk selection and student removal state
  const [selectedStudentEmails, setSelectedStudentEmails] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [singleStudentToDelete, setSingleStudentToDelete] = useState<StudentLead | null>(null);

  // Security & Password Management State
  const [selectedStudentForSecurity, setSelectedStudentForSecurity] = useState<StudentLead | null>(null);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  const [customNewPassword, setCustomNewPassword] = useState('');
  const [revealedPasswordsInTable, setRevealedPasswordsInTable] = useState<Record<string, boolean>>({});
  const [copiedPasswordEmail, setCopiedPasswordEmail] = useState<string | null>(null);
  const [showBulkSmsModal, setShowBulkSmsModal] = useState(false);
  const [smsSendingState, setSmsSendingState] = useState(false);
  
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const [totalVisitorsToday, setTotalVisitorsToday] = useState<number>(() => {
    const saved = localStorage.getItem('ielts_daily_visitors');
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      return isNaN(parsed) ? 1 : parsed;
    }
    return Math.max(1, students.length);
  });

  // Dynamic 30-day analytics dataset matching real student activity and reset state
  const trendData = useMemo(() => {
    const resetTimeStr = localStorage.getItem('ielts_analytics_reset_at');
    const resetTime = resetTimeStr ? new Date(resetTimeStr).getTime() : 0;

    const result = [];
    const nowDate = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(nowDate);
      d.setDate(d.getDate() - i);
      const dateIso = d.toISOString().split('T')[0];
      const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayTimestamp = d.getTime();

      // Registrations on dateIso
      const newRegs = students.filter(s => s.createdAt && s.createdAt.startsWith(dateIso)).length;

      // Tests completed on dateIso (reset to 0 if prior to reset timestamp)
      let testsTaken = 0;
      if (resetTime === 0 || dayTimestamp >= resetTime) {
        testsTaken = students.filter(s => s.lastTestDate && s.lastTestDate.startsWith(dateIso)).length;
      }

      // DAU active on dateIso
      let dau = students.filter(s => s.lastActiveDate && s.lastActiveDate.startsWith(dateIso)).length;
      if (i === 0) {
        dau = Math.max(dau, 1);
      }

      const visitors = Math.max(newRegs + dau, i === 0 ? totalVisitorsToday : 0);

      result.push({
        date: dateLabel,
        fullDate: dateIso,
        visitors,
        dau,
        newRegs,
        testsTaken
      });
    }
    return result;
  }, [students, totalVisitorsToday]);

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
      if (activityFilter === 'locked' && !s.isLocked) return false;

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

  // Student selection helper methods
  const toggleSelectStudent = (email: string) => {
    setSelectedStudentEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const isAllFilteredSelected = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    return filteredStudents.every((s) => selectedStudentEmails.includes(s.email));
  }, [filteredStudents, selectedStudentEmails]);

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      const filteredSet = new Set(filteredStudents.map((s) => s.email));
      setSelectedStudentEmails((prev) => prev.filter((e) => !filteredSet.has(e)));
    } else {
      const newEmails = Array.from(new Set([...selectedStudentEmails, ...filteredStudents.map((s) => s.email)]));
      setSelectedStudentEmails(newEmails);
    }
  };

  const handleConfirmRemove = () => {
    let emailsToRemove: string[] = [];
    if (singleStudentToDelete) {
      emailsToRemove = [singleStudentToDelete.email];
    } else {
      emailsToRemove = selectedStudentEmails;
    }

    if (emailsToRemove.length === 0) return;

    const updatedStudents = students.filter((s) => !emailsToRemove.includes(s.email));
    onUpdateStudents(updatedStudents);

    setSelectedStudentEmails((prev) => prev.filter((e) => !emailsToRemove.includes(e)));
    setShowDeleteModal(false);
    setSingleStudentToDelete(null);

    showToast(`Removed ${emailsToRemove.length} student account(s) from Registered Student Directory.`);
  };

  // Password Copy Helper
  const handleCopyPassword = (email: string, pass?: string) => {
    const passwordToCopy = pass || 'IELTSMock#2026';
    navigator.clipboard.writeText(passwordToCopy);
    setCopiedPasswordEmail(email);
    showToast(`Password for ${email} copied to clipboard!`);
    setTimeout(() => {
      setCopiedPasswordEmail(null);
    }, 2500);
  };

  // Lock / Unlock Toggle Helper
  const handleToggleLockStudent = (student: StudentLead) => {
    const newLockState = !student.isLocked;
    const updated = students.map((s) => {
      if (s.email === student.email) {
        return { ...s, isLocked: newLockState };
      }
      return s;
    });
    onUpdateStudents(updated);
    if (selectedStudentForSecurity?.email === student.email) {
      setSelectedStudentForSecurity({ ...selectedStudentForSecurity, isLocked: newLockState });
    }
    showToast(`Student account for ${student.name} (${student.email}) is now ${newLockState ? 'LOCKED 🔒' : 'UNLOCKED 🔓'}.`);
  };

  // Password Generation & Reset
  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCustomNewPassword(res);
  };

  const handleSaveAndSendPasswordSms = (sendSms: boolean) => {
    if (!selectedStudentForSecurity) return;
    const targetEmail = selectedStudentForSecurity.email;
    const finalPassword = customNewPassword.trim() || selectedStudentForSecurity.password || 'IELTSMock#2026';
    const todayStr = new Date().toISOString().split('T')[0];

    const updated = students.map((s) => {
      if (s.email === targetEmail) {
        return { 
          ...s, 
          password: finalPassword,
          passwordLastReset: todayStr 
        };
      }
      return s;
    });

    onUpdateStudents(updated);

    if (sendSms) {
      setSmsSendingState(true);
      setTimeout(() => {
        setSmsSendingState(false);
        showToast(`SMS with credentials dispatched to ${selectedStudentForSecurity.phone} successfully!`);
        setSelectedStudentForSecurity(null);
        setCustomNewPassword('');
      }, 700);
    } else {
      showToast(`Password for ${selectedStudentForSecurity.name} updated successfully!`);
      setSelectedStudentForSecurity(null);
      setCustomNewPassword('');
    }
  };

  // Bulk Lock / Unlock Handlers
  const handleBulkLockToggle = (lock: boolean) => {
    if (selectedStudentEmails.length === 0) return;
    const selectedSet = new Set(selectedStudentEmails);
    const updated = students.map((s) => {
      if (selectedSet.has(s.email)) {
        return { ...s, isLocked: lock };
      }
      return s;
    });
    onUpdateStudents(updated);
    showToast(`${selectedStudentEmails.length} student account(s) have been ${lock ? 'LOCKED 🔒' : 'UNLOCKED 🔓'}.`);
  };

  const handleBulkSendSms = () => {
    if (selectedStudentEmails.length === 0) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const selectedSet = new Set(selectedStudentEmails);
    const updated = students.map((s) => {
      if (selectedSet.has(s.email)) {
        return {
          ...s,
          passwordLastReset: todayStr
        };
      }
      return s;
    });
    onUpdateStudents(updated);
    setShowBulkSmsModal(false);
    showToast(`Password SMS credentials broadcasted to ${selectedStudentEmails.length} selected student(s) successfully!`);
  };

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

      {/* Top Header & Actions Bar for User Statistics & Analytics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-150 p-4 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-gray-900">User Statistics & System Analytics</h2>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              adminUser?.role === 'Administrator' 
                ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                : 'bg-amber-50 text-amber-700 border border-amber-100'
            }`}>
              {adminUser?.role === 'Administrator' ? 'Administrator Access' : 'Content Manager (Read-Only Stats)'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor real-time student engagement, practice test activity, and platform analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {adminUser?.role === 'Administrator' ? (
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5 text-rose-600" />
              <span>Reset Statistics & Analytics</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-400 rounded-xl text-xs font-semibold border border-gray-200 cursor-not-allowed select-none" title="Only Administrator accounts can reset statistics data">
              <RotateCcw className="h-3.5 w-3.5 text-gray-400" />
              <span>Reset (Admin Only)</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-100 transition-all active:scale-95 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

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
              <option value="locked">Locked Accounts Only 🔒</option>
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

        {/* Bulk Selection Action Bar */}
        {selectedStudentEmails.length > 0 && (
          <div className="bg-rose-50/90 border border-rose-200/90 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0">
                {selectedStudentEmails.length}
              </div>
              <div>
                <span className="text-xs font-extrabold text-gray-900 block">
                  {selectedStudentEmails.length} student profile{selectedStudentEmails.length > 1 ? 's' : ''} selected
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {isAllFilteredSelected ? 'All matching students selected' : `${selectedStudentEmails.length} of ${filteredStudents.length} selected`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentEmails([])}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 underline ml-2 cursor-pointer"
              >
                Clear Selection
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {adminUser?.role === 'Administrator' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleBulkLockToggle(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                    title="Lock selected accounts"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Lock ({selectedStudentEmails.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBulkLockToggle(false)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                    title="Unlock selected accounts"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    <span>Unlock ({selectedStudentEmails.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBulkSmsModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                    title="Send SMS passwords to selected students"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>SMS Passwords ({selectedStudentEmails.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSingleStudentToDelete(null);
                      setShowDeleteModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                    title="Remove selected students"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove ({selectedStudentEmails.length})</span>
                  </button>
                </>
              ) : (
                <div 
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 text-gray-400 rounded-xl text-xs font-semibold border border-gray-200 cursor-not-allowed select-none"
                  title="Administrator access required to modify registered students"
                >
                  <Lock className="h-3.5 w-3.5 text-gray-400" />
                  <span>Admin Privileges Required ({selectedStudentEmails.length})</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Directory Table */}
        <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/75 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="px-3 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={toggleSelectAllFiltered}
                      className="rounded border-gray-300 text-rose-600 focus:ring-rose-500 h-4 w-4 cursor-pointer"
                      title={isAllFilteredSelected ? "Deselect All" : "Select All"}
                    />
                  </th>
                  <th className="px-4 py-3">Student Profile</th>
                  <th className="px-4 py-3">Contact & Password</th>
                  <th className="px-4 py-3">Registration & Active</th>
                  <th className="px-4 py-3">Tests Completed</th>
                  <th className="px-4 py-3">Status / Access</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No registered students found matching your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const daysActiveAgo = getDaysAgo(student.lastActiveDate);
                    const isInactive = daysActiveAgo > 7 || ((student.testsCompletedCount || 0) === 0 && getDaysAgo(student.createdAt) > 7);
                    const isSelected = selectedStudentEmails.includes(student.email);
                    const isRevealed = !!revealedPasswordsInTable[student.email];

                    return (
                      <tr 
                        key={student.email + idx} 
                        className={`hover:bg-gray-50/60 transition-colors ${
                          student.isLocked ? 'bg-rose-50/20' : isSelected ? 'bg-rose-50/40' : isInactive ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-3 py-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectStudent(student.email)}
                            className="rounded border-gray-300 text-rose-600 focus:ring-rose-500 h-4 w-4 cursor-pointer"
                          />
                        </td>

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

                        {/* Contact & Password Details */}
                        <td className="px-4 py-3.5 space-y-1">
                          <div className="text-gray-700 font-mono text-[11px] flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[170px]">{student.email}</span>
                          </div>
                          <div className="text-gray-500 font-mono text-[11px] flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                            <span>{student.phone}</span>
                          </div>
                          {/* User Password Viewer */}
                          <div className="flex items-center gap-1 pt-0.5">
                            <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-tight">PASS:</span>
                            <span className="font-mono text-[10px] font-bold text-indigo-900 bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-100">
                              {isRevealed ? (student.password || 'IELTSMock#2026') : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setRevealedPasswordsInTable(prev => ({ ...prev, [student.email]: !prev[student.email] }))}
                              className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                              title={isRevealed ? "Hide Password" : "Show Password"}
                            >
                              {isRevealed ? <EyeOff className="h-3 w-3 text-indigo-600" /> : <Eye className="h-3 w-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyPassword(student.email, student.password)}
                              className="p-1 text-gray-400 hover:text-indigo-600 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                              title="Copy Password"
                            >
                              {copiedPasswordEmail === student.email ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            </button>
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

                        {/* Status / Access Status */}
                        <td className="px-4 py-3.5 space-y-1">
                          {student.isLocked ? (
                            <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-extrabold shadow-2xs">
                              <Lock className="h-3 w-3 text-rose-600" />
                              LOCKED (Denied)
                            </span>
                          ) : isInactive ? (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                              <AlertTriangle className="h-3 w-3 text-amber-600" />
                              Inactive &gt; 7 Days
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
                            </span>
                          )}

                          {student.passwordLastReset && (
                            <span className="block text-[9px] text-indigo-600 font-medium">
                              Pass Reset: {student.passwordLastReset}
                            </span>
                          )}

                          {student.reminderSentDate && (
                            <span className="block text-[9px] text-gray-400 font-medium">
                              Reminder: {student.reminderSentDate}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Security & Password Manager Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudentForSecurity(student);
                                setShowPasswordInModal(false);
                                setCustomNewPassword('');
                              }}
                              className="p-1.5 rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-100 transition-all active:scale-95 cursor-pointer flex items-center gap-1 text-xs font-bold"
                              title="View/Reset Password & Send SMS"
                            >
                              <Key className="h-3.5 w-3.5" />
                              <span className="hidden xl:inline">Security</span>
                            </button>

                            {/* Lock/Unlock Quick Button */}
                            {adminUser?.role === 'Administrator' ? (
                              <button
                                type="button"
                                onClick={() => handleToggleLockStudent(student)}
                                className={`p-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                                  student.isLocked
                                    ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-xs'
                                    : 'bg-gray-100 text-gray-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border-gray-200'
                                }`}
                                title={student.isLocked ? "Unlock student account" : "Lock student account"}
                              >
                                {student.isLocked ? (
                                  <>
                                    <Unlock className="h-3.5 w-3.5" />
                                    <span className="hidden xl:inline">Unlock</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-3.5 w-3.5" />
                                    <span className="hidden xl:inline">Lock</span>
                                  </>
                                )}
                              </button>
                            ) : null}

                            {/* Remind Button */}
                            <button
                              onClick={() => handleOpenReminderModal(student)}
                              className={`p-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                                isInactive 
                                  ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-xs' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              title="Send engagement reminder"
                            >
                              <Send className="h-3 w-3" />
                              <span className="hidden xl:inline">Remind</span>
                            </button>

                            {/* Delete Button */}
                            {adminUser?.role === 'Administrator' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSingleStudentToDelete(student);
                                  setShowDeleteModal(true);
                                }}
                                className="p-1.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 border border-rose-100 transition-all active:scale-95 cursor-pointer"
                                title={`Remove ${student.name} from directory`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <div 
                                className="p-1.5 rounded-xl text-gray-300 bg-gray-50 border border-gray-100 cursor-not-allowed select-none"
                                title="Administrator privileges required to remove student records"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </div>
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

      {/* Reset User Statistics & Analytics Confirmation Modal */}
      {showResetModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowResetModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 border border-gray-100 shadow-2xl space-y-4 text-left my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Reset User Statistics & Analytics?</h3>
                <p className="text-[11px] text-gray-400 font-medium">Administrator Privilege Action</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <Info className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Important Data Preservation Notice:</span>
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed text-amber-900/90 font-medium">
                <li><strong>Registered User Data Preserved:</strong> All student account profiles (names, emails, passwords, mobile numbers) will <strong>NOT</strong> be deleted.</li>
                <li><strong>Analytics Data Reset:</strong> Test completion counts, attempt history logs, streak points, and test analytics will be reset to baseline.</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  localStorage.setItem('ielts_daily_visitors', '1');
                  localStorage.setItem('ielts_analytics_reset_at', new Date().toISOString());
                  setTotalVisitorsToday(1);
                  if (onResetAnalytics) {
                    onResetAnalytics();
                  }
                  showToast("User statistics & analytics reset successfully! Registered user profiles remain intact.");
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-xl shadow-md shadow-rose-100 cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Registered Student Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => {
            setShowDeleteModal(false);
            setSingleStudentToDelete(null);
          }}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 border border-gray-100 shadow-2xl space-y-4 text-left my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">
                  {singleStudentToDelete 
                    ? `Remove Student: ${singleStudentToDelete.name}`
                    : `Remove ${selectedStudentEmails.length} Selected Student(s)?`}
                </h3>
                <p className="text-[11px] text-gray-400 font-medium">Registered Student Directory Management</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs text-rose-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-rose-800">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Confirm Removal Action</span>
              </p>
              <p className="text-[11px] leading-relaxed text-rose-900/90 font-medium">
                {singleStudentToDelete ? (
                  <>Are you sure you want to remove <strong>{singleStudentToDelete.name}</strong> ({singleStudentToDelete.email}) from the Registered Student Directory?</>
                ) : (
                  <>Are you sure you want to remove <strong>{selectedStudentEmails.length}</strong> selected student profile(s) from the Registered Student Directory?</>
                )}
              </p>
            </div>

            {/* Preview list of students to delete */}
            <div className="max-h-36 overflow-y-auto space-y-1.5 bg-gray-50 border border-gray-150 rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-1">
                Students To Be Removed:
              </span>
              {singleStudentToDelete ? (
                <div className="text-xs font-semibold text-gray-800 flex justify-between px-1">
                  <span>{singleStudentToDelete.name}</span>
                  <span className="text-gray-400 font-mono text-[11px]">{singleStudentToDelete.email}</span>
                </div>
              ) : (
                students
                  .filter((s) => selectedStudentEmails.includes(s.email))
                  .map((s) => (
                    <div key={s.email} className="text-xs font-semibold text-gray-800 flex justify-between px-1 py-0.5 border-b border-gray-100 last:border-0">
                      <span>{s.name}</span>
                      <span className="text-gray-400 font-mono text-[11px]">{s.email}</span>
                    </div>
                  ))
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSingleStudentToDelete(null);
                }}
                className="flex-1 py-2.5 border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-xl shadow-md shadow-rose-100 cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Confirm Removal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Account Security & Password Modal */}
      {selectedStudentForSecurity && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedStudentForSecurity(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs shrink-0">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    Account Security & Credentials
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Administrator User Security Control Panel</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForSecurity(null)}
                className="text-gray-400 hover:text-gray-700 font-bold p-1 rounded-lg hover:bg-gray-100 cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            {/* Student Info Card */}
            <div className="bg-gray-50/80 border border-gray-150 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-gray-900 block">{selectedStudentForSecurity.name}</span>
                  <span className="text-[11px] text-gray-500 font-mono block">{selectedStudentForSecurity.email}</span>
                  <span className="text-[11px] text-gray-500 font-mono block">{selectedStudentForSecurity.phone}</span>
                </div>
                <div>
                  {selectedStudentForSecurity.isLocked ? (
                    <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-xl text-xs font-extrabold shadow-2xs">
                      <Lock className="h-3.5 w-3.5 text-rose-600" />
                      Locked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl text-xs font-bold shadow-2xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Active Access
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Lock / Unlock Account Toggle */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-amber-950 block">Account Status Control</span>
                <span className="text-[11px] text-amber-900/80 font-medium block">
                  {selectedStudentForSecurity.isLocked 
                    ? 'Student is currently locked out from logging into mock tests.'
                    : 'Lock student account to restrict test access.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleLockStudent(selectedStudentForSecurity)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs ${
                  selectedStudentForSecurity.isLocked
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-rose-600 text-white hover:bg-rose-500'
                }`}
              >
                {selectedStudentForSecurity.isLocked ? (
                  <>
                    <Unlock className="h-3.5 w-3.5" />
                    <span>Unlock Account</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>Lock Account</span>
                  </>
                )}
              </button>
            </div>

            {/* View Password Section */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Current Stored Password
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPasswordInModal ? "text" : "password"}
                    readOnly
                    value={selectedStudentForSecurity.password || 'IELTSMock#2026'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-indigo-950 font-bold outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {showPasswordInModal ? <EyeOff className="h-4 w-4 text-indigo-600" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPassword(selectedStudentForSecurity.email, selectedStudentForSecurity.password)}
                  className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedPasswordEmail === selectedStudentForSecurity.email ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Reset Password Form */}
            <div className="space-y-2 border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800 block">
                  Reset & Set New Password
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRandomPassword}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="h-3 w-3" />
                  <span>Generate Random</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter new password (e.g. Pass#2026)..."
                value={customNewPassword}
                onChange={(e) => setCustomNewPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Live SMS Preview Box */}
            <div className="bg-indigo-50/70 border border-indigo-150 rounded-2xl p-3.5 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase text-indigo-800 tracking-wider flex items-center gap-1">
                <Smartphone className="h-3 w-3 text-indigo-600" />
                Live SMS Notification Preview
              </span>
              <p className="text-[11px] font-mono leading-relaxed text-indigo-950 bg-white/90 p-2.5 rounded-xl border border-indigo-100">
                Dear {selectedStudentForSecurity.name}, your IELTS Mock Test Portal login credentials have been updated. Email: {selectedStudentForSecurity.email}, Password: <span className="font-bold underline text-indigo-700">{customNewPassword.trim() || selectedStudentForSecurity.password || 'IELTSMock#2026'}</span>. Login at https://ielts.mock/login
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedStudentForSecurity(null)}
                className="flex-1 py-2.5 border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleSaveAndSendPasswordSms(false)}
                className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-xs font-bold text-white rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Key className="h-3.5 w-3.5" />
                <span>Save Password</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveAndSendPasswordSms(true)}
                disabled={smsSendingState}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow-md shadow-indigo-100 cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>{smsSendingState ? 'Sending SMS...' : 'Save & Send SMS'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk SMS Modal */}
      {showBulkSmsModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowBulkSmsModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs shrink-0">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">
                  Broadcast Credentials via SMS
                </h3>
                <p className="text-xs text-gray-500 font-medium">Send SMS password reminders to {selectedStudentEmails.length} selected student(s)</p>
              </div>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-150 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-extrabold text-indigo-950 block">Bulk Message Preview</span>
              <p className="text-[11px] font-mono leading-relaxed text-indigo-900 bg-white p-3 rounded-xl border border-indigo-100">
                Dear Student, your IELTS Mock Test login password is active. Login email: [Student Email]. For support or password updates, visit https://ielts.mock/login
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkSmsModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkSendSms}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow-md shadow-indigo-100 cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Send SMS to ({selectedStudentEmails.length}) Students</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
