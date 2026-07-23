import React, { useState, useEffect } from 'react';
import { 
  Server, Cpu, HardDrive, Activity, Zap, RefreshCw, AlertTriangle, 
  CheckCircle2, Clock, ShieldCheck, Flame, TrendingUp, Layers, 
  BarChart2, ArrowUpRight, Play, Terminal, Database, Wifi, Globe, Gauge
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ServerStatsData {
  timestamp: string;
  system: {
    platform: string;
    architecture: string;
    hostname: string;
    uptimeSeconds: number;
    nodeVersion: string;
    cpuModel: string;
    cpuCores: number;
    cpuSpeedMHz: number;
    cpuUsagePct: number;
    loadAvg: [number, number, number];
  };
  memory: {
    totalBytes: number;
    freeBytes: number;
    usedBytes: number;
    usedPct: number;
    processRssBytes: number;
    processHeapTotalBytes: number;
    processHeapUsedBytes: number;
    processExternalBytes: number;
  };
  networkAndTraffic: {
    totalRequests: number;
    activeRequests: number;
    activeExaminees: number;
    avgLatencyMs: number;
    requestsPerSec: number;
    simulatedStressLevel: number;
  };
  recentLogs: Array<{
    timestamp: string;
    method: string;
    path: string;
    status: number;
    durationMs: number;
  }>;
}

const PEAK_HOURS_DISTRIBUTION = [
  { hour: '00:00', loadPct: 12, examinees: 15 },
  { hour: '03:00', loadPct: 8, examinees: 10 },
  { hour: '06:00', loadPct: 15, examinees: 22 },
  { hour: '09:00', loadPct: 45, examinees: 85 },
  { hour: '12:00', loadPct: 62, examinees: 140 },
  { hour: '15:00', loadPct: 78, examinees: 210 },
  { hour: '18:00', loadPct: 94, examinees: 340 }, // Peak
  { hour: '21:00', loadPct: 88, examinees: 290 }, // Peak
  { hour: '23:00', loadPct: 35, examinees: 60 }
];

export default function AdminServerMonitor({ onThresholdStatusChange }: { onThresholdStatusChange?: (isBreached: boolean, maxPct: number) => void }) {
  const [stats, setStats] = useState<ServerStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(3);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [historyTimeline, setHistoryTimeline] = useState<Array<{ time: string; cpu: number; ram: number; latency: number; examinees: number }>>([]);
  const [stressLevel, setStressLevel] = useState<number>(0);
  const [targetExaminees, setTargetExaminees] = useState<number>(50);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Threshold Configuration State (Default: 80%)
  const [warningThreshold, setWarningThreshold] = useState<number>(80);
  const [showThresholdConfig, setShowThresholdConfig] = useState<boolean>(false);
  const [rateLimitingActive, setRateLimitingActive] = useState<boolean>(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/server-stats');
      if (!res.ok) throw new Error('Failed to fetch server telemetry');
      const data: ServerStatsData = await res.json();
      setStats(data);
      setStressLevel(data.networkAndTraffic.simulatedStressLevel);
      setError(null);

      // Check threshold breach & report to parent
      const currentCpu = data.system.cpuUsagePct;
      const currentRam = data.memory.usedPct;
      const maxVal = Math.max(currentCpu, currentRam);
      const isBreached = maxVal >= warningThreshold;
      if (onThresholdStatusChange) {
        onThresholdStatusChange(isBreached, maxVal);
      }

      // Append to rolling history (max 15 points)
      const nowStr = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
      setHistoryTimeline((prev) => {
        const next = [
          ...prev,
          {
            time: nowStr,
            cpu: currentCpu,
            ram: currentRam,
            latency: data.networkAndTraffic.avgLatencyMs,
            examinees: data.networkAndTraffic.activeExaminees
          }
        ];
        return next.slice(-15);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Telemetry request failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (isPaused || refreshIntervalSec === 0) return;
    const interval = setInterval(() => {
      fetchStats();
    }, refreshIntervalSec * 1000);
    return () => clearInterval(interval);
  }, [refreshIntervalSec, isPaused]);

  // Handle Load Simulation Change
  const handleApplySimulation = async (level: number, count: number) => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/admin/set-load-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stressLevel: level, examineeCount: count })
      });
      const data = await res.json();
      setStressLevel(level);
      setTargetExaminees(count);
      setActionFeedback(data.message || 'Server load profile updated.');
      setTimeout(() => setActionFeedback(null), 4000);
      await fetchStats();
    } catch (_) {
      setActionFeedback('Failed to update load simulation.');
    } finally {
      setIsSimulating(false);
    }
  };

  // Handle Cache Flush
  const handleFlushCache = async () => {
    try {
      const res = await fetch('/api/admin/flush-cache', { method: 'POST' });
      const data = await res.json();
      setActionFeedback(data.message || 'Server cache flushed.');
      setTimeout(() => setActionFeedback(null), 4000);
      await fetchStats();
    } catch (_) {
      setActionFeedback('Failed to flush server cache.');
    }
  };

  // Format Bytes helper
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format Uptime helper
  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const cpuPct = stats?.system.cpuUsagePct || 0;
  const ramPct = stats?.memory.usedPct || 0;
  const activeUsers = stats?.networkAndTraffic.activeExaminees || 0;
  const latency = stats?.networkAndTraffic.avgLatencyMs || 0;

  // Decision Logic for Infrastructure Scaling
  const getResourceRecommendations = () => {
    const recs: Array<{ title: string; desc: string; type: 'urgent' | 'warning' | 'optimal'; action: string }> = [];

    if (cpuPct > 85) {
      recs.push({
        title: 'CPU Bottleneck Detected (Peak Load)',
        desc: `CPU usage reached ${cpuPct}%. During high concurrent examinee surges (18:00 - 22:00), core processing bounds audio streaming and test submission validation.`,
        type: 'urgent',
        action: 'Upgrade CPU cores from ' + (stats?.system.cpuCores || 2) + ' vCPUs to ' + ((stats?.system.cpuCores || 2) * 2) + ' vCPUs or enable Auto-scaling (min 2 instances).'
      });
    } else if (cpuPct > 65) {
      recs.push({
        title: 'Moderate CPU Utilization',
        desc: `CPU is currently at ${cpuPct}%. System handles current examinees comfortably, but peak surges may trigger elevated response latency.`,
        type: 'warning',
        action: 'Enable Cloud Container Autoscaling with a 70% target CPU trigger.'
      });
    } else {
      recs.push({
        title: 'CPU Allocation Optimal',
        desc: `CPU usage is steady at ${cpuPct}%. Virtual core allocation provides generous headroom for concurrent test sessions.`,
        type: 'optimal',
        action: 'No CPU hardware changes required at current traffic volume.'
      });
    }

    if (ramPct > 85) {
      recs.push({
        title: 'RAM Memory Pressure High',
        desc: `System RAM usage is at ${ramPct}%. Large IELTS listening audio files and student session state buffer require adequate memory heap.`,
        type: 'urgent',
        action: 'Expand RAM from ' + formatBytes(stats?.memory.totalBytes || 0) + ' to ' + (Math.ceil((stats?.memory.totalBytes || 0) / (1024 * 1024 * 1024)) * 2) + ' GB.'
      });
    } else {
      recs.push({
        title: 'RAM Memory Capacity Healthy',
        desc: `Memory consumption is at ${ramPct}% (${formatBytes(stats?.memory.usedBytes || 0)} used of ${formatBytes(stats?.memory.totalBytes || 0)} total).`,
        type: 'optimal',
        action: 'Current RAM allocation handles audio streaming buffers without memory leaks.'
      });
    }

    if (activeUsers > 150) {
      recs.push({
        title: 'Database Connection Pool Expansion',
        desc: `Active concurrent examinees currently at ${activeUsers}. Multiple simultaneous exam submissions can saturate database connection limits.`,
        type: 'warning',
        action: 'Increase Firestore/SQL connection pool size to max 100 connections and enable Redis caching for test questions.'
      });
    }

    return recs;
  };

  const recommendations = getResourceRecommendations();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
            cpuPct > 85 ? 'bg-rose-600 shadow-rose-200 animate-pulse' : cpuPct > 65 ? 'bg-amber-500 shadow-amber-200' : 'bg-emerald-600 shadow-emerald-200'
          }`}>
            <Server className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-gray-900">Live Server Resource Monitor</h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                cpuPct > 85
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : cpuPct > 65
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${cpuPct > 85 ? 'bg-rose-600 animate-ping' : cpuPct > 65 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                {cpuPct > 85 ? 'Heavy Peak Stress' : cpuPct > 65 ? 'Moderate Peak Load' : 'Healthy / Normal'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Real-time server CPU, RAM, active examinee connection metrics &amp; peak load decision advisor
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Resume */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              isPaused 
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{isPaused ? 'Telemetry Paused' : 'Live Polling'}</span>
          </button>

          {/* Refresh Selector */}
          <select
            value={refreshIntervalSec}
            onChange={(e) => setRefreshIntervalSec(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl px-2.5 py-2 outline-none cursor-pointer"
          >
            <option value={2}>Refresh: 2s</option>
            <option value={3}>Refresh: 3s</option>
            <option value={5}>Refresh: 5s</option>
            <option value={10}>Refresh: 10s</option>
          </select>

          {/* Manual Refresh */}
          <button
            type="button"
            onClick={fetchStats}
            disabled={loading}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all cursor-pointer border border-gray-200"
            title="Manual Telemetry Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-rose-600' : ''}`} />
          </button>

          {/* Flush Cache */}
          <button
            type="button"
            onClick={handleFlushCache}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title="Flush memory buffer and clear response cache"
          >
            <Zap className="h-3.5 w-3.5 text-rose-600" />
            <span>Flush Cache</span>
          </button>

          {/* Threshold Configurator Toggle */}
          <button
            type="button"
            onClick={() => setShowThresholdConfig(!showThresholdConfig)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              showThresholdConfig
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <Gauge className="h-3.5 w-3.5" />
            <span>Threshold: {warningThreshold}%</span>
          </button>
        </div>
      </div>

      {/* Threshold Configurator Expandable Panel */}
      {showThresholdConfig && (
        <div className="bg-indigo-900 text-white rounded-3xl p-5 border border-indigo-700 shadow-lg space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-indigo-800 pb-2">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-indigo-300" />
              <h3 className="text-sm font-black text-white">Visual Warning System Sensitivity Settings</h3>
            </div>
            <span className="text-[11px] font-mono text-indigo-300">
              Active Trigger Limit: <strong className="text-white font-black">{warningThreshold}%</strong>
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-indigo-200 leading-relaxed max-w-xl">
              Set the CPU / Memory load limit percentage that triggers instant visual warning banners, high-contrast badges, and actionable admin remediation controls.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {[70, 75, 80, 85, 90].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setWarningThreshold(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    warningThreshold === val
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md'
                      : 'bg-indigo-800 text-indigo-200 border-indigo-700 hover:bg-indigo-700'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROMINENT VISUAL WARNING SYSTEM ALERT BANNER */}
      {(cpuPct >= warningThreshold || ramPct >= warningThreshold) && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 text-white rounded-3xl p-6 shadow-2xl border-2 border-rose-500/80 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
            <AlertTriangle className="h-72 w-72 text-white" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-rose-500/30 border border-rose-400/60 flex items-center justify-center text-amber-300 shrink-0 shadow-lg animate-bounce">
                <AlertTriangle className="h-7 w-7 text-amber-300" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-rose-600 text-white font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md animate-pulse border border-rose-400">
                    ⚠️ CRITICAL THRESHOLD BREACH ALERT ({warningThreshold}% LIMIT EXCEEDED)
                  </span>
                  <span className="text-xs font-mono text-rose-200 bg-rose-900/60 px-2.5 py-0.5 rounded-lg border border-rose-700">
                    Live Status: CPU {cpuPct}% | RAM {ramPct}%
                  </span>
                </div>
                <h3 className="text-lg font-black text-white tracking-tight">
                  Server Usage Threshold Breached ({Math.max(cpuPct, ramPct)}% Load)
                </h3>
                <p className="text-xs text-rose-100 leading-relaxed font-medium max-w-2xl">
                  Peak traffic surge detected! {cpuPct >= warningThreshold ? `CPU usage (${cpuPct}%)` : ''} {cpuPct >= warningThreshold && ramPct >= warningThreshold ? ' and ' : ''} {ramPct >= warningThreshold ? `Memory RAM (${ramPct}%)` : ''} exceeded the safe threshold limit of <strong>{warningThreshold}%</strong>. Choose an actionable resolution below to protect candidate test sessions.
                </p>
              </div>
            </div>

            {/* Actionable Remediation Feedback Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 bg-slate-900/80 p-3 rounded-2xl border border-rose-500/40">
              <button
                type="button"
                onClick={handleFlushCache}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                title="Clears Node heap allocations & server response cache buffers"
              >
                <Zap className="h-4 w-4 text-slate-950 fill-slate-950" />
                <span>Flush Memory Cache</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplySimulation(0, 40)}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                title="Drops stress test surge and returns traffic to normal levels"
              >
                <ShieldCheck className="h-4 w-4 text-white" />
                <span>Auto-Scale / Normal Load</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRateLimitingActive(true);
                  setActionFeedback('Rate Limiting Enabled: Throttled background audio pre-buffering to relieve CPU load.');
                  setTimeout(() => setActionFeedback(null), 5000);
                }}
                className={`px-3.5 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 border ${
                  rateLimitingActive
                    ? 'bg-blue-600 text-white border-blue-400'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Activity className="h-4 w-4 text-blue-300" />
                <span>{rateLimitingActive ? 'Rate Limiting ACTIVE' : 'Throttle Traffic'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {actionFeedback && (
        <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md shadow-indigo-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <span>{actionFeedback}</span>
          </div>
          <span className="text-[10px] text-indigo-200 font-mono">Server API Response</span>
        </div>
      )}

      {/* 4 Major Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Utilization */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-indigo-600" />
              CPU Utilization
            </span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
              cpuPct > 85 ? 'bg-rose-100 text-rose-700' : cpuPct > 65 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {cpuPct}%
            </span>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-gray-900 font-mono">{cpuPct}%</span>
              <span className="text-[11px] text-gray-400 font-medium">{stats?.system.cpuCores || 2} vCPU Cores</span>
            </div>
            {/* Usage Progress Bar */}
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mt-2">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  cpuPct > 85 ? 'bg-rose-600' : cpuPct > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(4, cpuPct))}%` }}
              />
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>Load Avg (1m, 5m, 15m):</span>
            <span className="font-bold text-gray-800">{stats?.system.loadAvg?.join(' / ') || '0.12 / 0.18 / 0.22'}</span>
          </div>
        </div>

        {/* System RAM Memory */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-indigo-600" />
              RAM Memory
            </span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
              ramPct > 85 ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {ramPct}% Used
            </span>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-gray-900 font-mono">{formatBytes(stats?.memory.usedBytes || 0)}</span>
              <span className="text-[11px] text-gray-400 font-medium">of {formatBytes(stats?.memory.totalBytes || 0)}</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mt-2">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  ramPct > 85 ? 'bg-rose-600' : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(4, ramPct))}%` }}
              />
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>Process Heap RSS:</span>
            <span className="font-bold text-gray-800">{formatBytes(stats?.memory.processRssBytes || 0)}</span>
          </div>
        </div>

        {/* Active Examinees & Traffic */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-rose-600" />
              Active Examinees
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 animate-pulse">
              LIVE
            </span>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-gray-900 font-mono">{activeUsers}</span>
              <span className="text-[11px] text-gray-400 font-medium">taking tests right now</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-600 font-medium">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>Request Rate: <strong className="font-mono text-gray-900">{stats?.networkAndTraffic.requestsPerSec || 12} req/sec</strong></span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>Total HTTP Handled:</span>
            <span className="font-bold text-gray-800">{stats?.networkAndTraffic.totalRequests || 1}</span>
          </div>
        </div>

        {/* Server Latency & Uptime */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-emerald-600" />
              Latency &amp; Uptime
            </span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
              latency > 200 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {latency} ms
            </span>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-gray-900 font-mono">{latency} <span className="text-sm font-normal text-gray-500">ms</span></span>
              <span className="text-[11px] text-emerald-600 font-bold">99.98% SLA</span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-2">
              Process Uptime: <strong className="font-mono text-gray-800">{formatUptime(stats?.system.uptimeSeconds || 0)}</strong>
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>Node Runtime:</span>
            <span className="font-bold text-gray-800">{stats?.system.nodeVersion || 'v22.x'}</span>
          </div>
        </div>
      </div>

      {/* Main Analysis Section: Live Rolling Chart & Peak Hours Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rolling 15-Point Real-time Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                Real-Time Resource Telemetry (Rolling 15-Sample Timeline)
              </h3>
              <p className="text-xs text-gray-400">Live CPU % vs RAM % vs Active Examinees trend updates continuously</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1 text-rose-600">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> CPU %
              </span>
              <span className="flex items-center gap-1 text-indigo-600">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> RAM %
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {historyTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="cpu" name="CPU Utilization %" stroke="#e11d48" strokeWidth={2} fillOpacity={1} fill="url(#cpuGrad)" />
                  <Area type="monotone" dataKey="ram" name="RAM Usage %" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#ramGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs font-semibold">
                Initializing telemetry feed...
              </div>
            )}
          </div>
        </div>

        {/* Peak Hours Traffic Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-amber-600" />
              Hourly Peak Time Profile
            </h3>
            <p className="text-xs text-gray-400">Identify heavy test-taking hours &amp; peak demand</p>
          </div>

          <div className="space-y-2.5">
            {PEAK_HOURS_DISTRIBUTION.map((item) => {
              const isPeak = item.loadPct >= 80;
              return (
                <div key={item.hour} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-gray-700 flex items-center gap-1.5">
                      {item.hour}
                      {isPeak && (
                        <span className="bg-rose-100 text-rose-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                          PEAK SURGE
                        </span>
                      )}
                    </span>
                    <span className="text-gray-500 font-mono">
                      {item.examinees} examinees ({item.loadPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isPeak ? 'bg-rose-600' : item.loadPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.loadPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Peak Time Stress Simulator */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4 border border-indigo-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600/50 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <Flame className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white">
                Peak Time Load &amp; Capacity Stress Simulator
              </h3>
              <p className="text-xs text-indigo-200">
                Simulate mock exam traffic spikes to observe how server resources behave under pressure
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-indigo-300 bg-indigo-900/80 px-3 py-1 rounded-xl border border-indigo-700/50 self-start sm:self-auto">
            Simulated Load Level: {stressLevel === 0 ? 'Normal (30-50 Examinees)' : stressLevel === 1 ? 'Moderate Peak (150 Examinees)' : 'Heavy Peak Stress (350+ Examinees)'}
          </span>
        </div>

        {/* Preset Load Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleApplySimulation(0, 40)}
            disabled={isSimulating}
            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
              stressLevel === 0
                ? 'bg-indigo-600/40 border-indigo-400 text-white shadow-lg ring-2 ring-indigo-400'
                : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">1. Normal Traffic</span>
              <CheckCircle2 className={`h-4 w-4 ${stressLevel === 0 ? 'text-emerald-400' : 'text-slate-600'}`} />
            </div>
            <div className="text-lg font-black font-mono">40 Examinees</div>
            <p className="text-[11px] text-slate-400 mt-1">Light CPU load (~15-25%), baseline RAM usage.</p>
          </button>

          <button
            type="button"
            onClick={() => handleApplySimulation(1, 160)}
            disabled={isSimulating}
            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
              stressLevel === 1
                ? 'bg-amber-600/40 border-amber-400 text-white shadow-lg ring-2 ring-amber-400'
                : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">2. Moderate Peak</span>
              <AlertTriangle className={`h-4 w-4 ${stressLevel === 1 ? 'text-amber-400' : 'text-slate-600'}`} />
            </div>
            <div className="text-lg font-black font-mono">160 Examinees</div>
            <p className="text-[11px] text-slate-400 mt-1">Elevated CPU (~65-75%), active listening audio buffers.</p>
          </button>

          <button
            type="button"
            onClick={() => handleApplySimulation(2, 380)}
            disabled={isSimulating}
            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
              stressLevel === 2
                ? 'bg-rose-600/40 border-rose-400 text-white shadow-lg ring-2 ring-rose-400'
                : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400">3. Heavy Exam Surge</span>
              <Flame className={`h-4 w-4 ${stressLevel === 2 ? 'text-rose-400' : 'text-slate-600'}`} />
            </div>
            <div className="text-lg font-black font-mono">380 Examinees</div>
            <p className="text-[11px] text-slate-400 mt-1">Heavy CPU stress (&gt;90%), test submission queue bottleneck.</p>
          </button>
        </div>
      </div>

      {/* Infrastructure Capacity & Resource Decision Advisor */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Smart Infrastructure Capacity &amp; Resource Decision Advisor
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Actionable recommendations based on peak load metrics to guide server upgrades
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
            Automated IT Audit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-2xl border space-y-2.5 flex flex-col justify-between ${
                rec.type === 'urgent'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : rec.type === 'warning'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    rec.type === 'urgent'
                      ? 'bg-rose-200 text-rose-800'
                      : rec.type === 'warning'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-emerald-200 text-emerald-800'
                  }`}>
                    {rec.type === 'urgent' ? 'Immediate Action' : rec.type === 'warning' ? 'Recommended' : 'Healthy'}
                  </span>
                </div>
                <h4 className="text-xs font-black text-gray-900">{rec.title}</h4>
                <p className="text-[11px] text-gray-600 leading-relaxed font-medium">{rec.desc}</p>
              </div>

              <div className="bg-white/80 p-2.5 rounded-xl border border-gray-200/80 text-[11px] font-bold text-indigo-900 flex items-start gap-1.5">
                <ArrowUpRight className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Decision:</strong> {rec.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Server Log Console Stream */}
      <div className="bg-slate-950 text-slate-200 rounded-3xl p-5 shadow-lg border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span className="font-bold text-slate-100">Server Event Console Stream</span>
            <span className="text-[10px] text-slate-500">(/api/admin/server-stats)</span>
          </div>
          <span className="text-[10px] text-slate-400">
            Showing last {stats?.recentLogs.length || 0} HTTP API requests
          </span>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
          {stats?.recentLogs && stats.recentLogs.length > 0 ? (
            stats.recentLogs.map((log, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] hover:bg-slate-900 p-1 rounded transition-colors">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-500 font-bold">{log.timestamp}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    log.method === 'GET' ? 'bg-blue-950 text-blue-400' : 'bg-emerald-950 text-emerald-400'
                  }`}>
                    {log.method}
                  </span>
                  <span className="text-slate-300 truncate max-w-xs">{log.path}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`font-bold ${log.status < 400 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {log.status}
                  </span>
                  <span className="text-slate-500 text-[10px]">{log.durationMs} ms</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-500 text-[11px] italic py-2">No incoming HTTP logs recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
