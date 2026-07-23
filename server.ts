import express from 'express';
import path from 'path';
import os from 'os';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Request tracking & metrics middleware
let totalRequests = 0;
let activeRequests = 0;
let simulatedActiveTestTakers = 42; // default active examinees
let simulatedStressLevel = 0; // 0: Normal, 1: Moderate, 2: Heavy Peak Stress
const requestLogBuffer: Array<{ timestamp: string; method: string; path: string; status: number; durationMs: number }> = [];

app.use((req, res, next) => {
  totalRequests++;
  activeRequests++;
  const start = Date.now();

  res.on('finish', () => {
    activeRequests = Math.max(0, activeRequests - 1);
    const durationMs = Date.now() - start;
    
    // Store recent log
    requestLogBuffer.unshift({
      timestamp: new Date().toLocaleTimeString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs
    });
    if (requestLogBuffer.length > 50) requestLogBuffer.pop();
  });

  next();
});

// Server-only environment variables for admin & content manager access
// These credentials remain strictly server-side and are never exposed to browser bundles.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Administrator';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Maailuimc1$%';
const CONTENT_MANAGER_USERNAME = process.env.CONTENT_MANAGER_USERNAME || 'ContentManager';
const CONTENT_MANAGER_PASSWORD = process.env.CONTENT_MANAGER_PASSWORD || 'Maailucmimc1$%';

// Secure login endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Username and password are required' 
    });
  }

  const u = String(username).trim();
  const p = String(password).trim();

  const targetAdminUser = (process.env.ADMIN_USERNAME || 'Administrator').trim();
  const targetAdminPass = (process.env.ADMIN_PASSWORD || 'Maailuimc1$%').trim();
  const targetCMUser = (process.env.CONTENT_MANAGER_USERNAME || 'ContentManager').trim();
  const targetCMPass = (process.env.CONTENT_MANAGER_PASSWORD || 'Maailucmimc1$%').trim();

  // Match Administrator (case-insensitive for username, exact match for password)
  if ((u.toLowerCase() === targetAdminUser.toLowerCase() || u.toLowerCase() === 'administrator' || u.toLowerCase() === 'admin') && p === targetAdminPass) {
    return res.json({
      success: true,
      user: {
        username: 'Administrator',
        role: 'Administrator',
        displayName: 'Administrator Workspace'
      }
    });
  }

  // Match Content Manager
  if ((u.toLowerCase() === targetCMUser.toLowerCase() || u.toLowerCase() === 'contentmanager') && p === targetCMPass) {
    return res.json({
      success: true,
      user: {
        username: 'ContentManager',
        role: 'ContentManager',
        displayName: 'Content Manager Workspace'
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid username or password. Please verify your credentials.'
  });
});

// Real-time Server Resource Usage & Performance Telemetry Endpoint
app.get('/api/admin/server-stats', (_req, res) => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsage = process.memoryUsage();
  const loadAvg = os.loadavg(); // [1min, 5min, 15min]

  // Calculate approximate CPU usage percentage
  let cpuUsagePct = 0;
  if (cpus && cpus.length > 0) {
    let totalTick = 0;
    let idleTick = 0;
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += (cpu.times as Record<string, number>)[type];
      }
      idleTick += cpu.times.idle;
    });
    cpuUsagePct = Math.round(((totalTick - idleTick) / totalTick) * 100);
  }
  
  // Adjust for simulated stress testing if triggered by admin
  if (simulatedStressLevel === 1) {
    cpuUsagePct = Math.min(95, Math.max(68, cpuUsagePct + 45));
  } else if (simulatedStressLevel === 2) {
    cpuUsagePct = Math.min(99, Math.max(88, cpuUsagePct + 70));
  }

  // Active concurrent examinees calculation (base + simulated fluctuation)
  const timeVariance = Math.floor(Math.sin(Date.now() / 10000) * 15);
  const activeExaminees = Math.max(5, simulatedActiveTestTakers + timeVariance + (simulatedStressLevel * 120));

  res.json({
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      architecture: os.arch(),
      hostname: os.hostname(),
      uptimeSeconds: os.uptime(),
      nodeVersion: process.version,
      cpuModel: cpus[0]?.model || 'Cloud Run Virtual CPU',
      cpuCores: cpus.length || 2,
      cpuSpeedMHz: cpus[0]?.speed || 2400,
      cpuUsagePct: Math.min(100, Math.max(5, cpuUsagePct)),
      loadAvg: [
        Number(loadAvg[0].toFixed(2)),
        Number(loadAvg[1].toFixed(2)),
        Number(loadAvg[2].toFixed(2))
      ]
    },
    memory: {
      totalBytes: totalMem,
      freeBytes: freeMem,
      usedBytes: usedMem,
      usedPct: Math.round((usedMem / totalMem) * 100),
      processRssBytes: memUsage.rss,
      processHeapTotalBytes: memUsage.heapTotal,
      processHeapUsedBytes: memUsage.heapUsed,
      processExternalBytes: memUsage.external
    },
    networkAndTraffic: {
      totalRequests,
      activeRequests,
      activeExaminees,
      avgLatencyMs: simulatedStressLevel === 2 ? 340 : simulatedStressLevel === 1 ? 120 : 18 + Math.floor(Math.random() * 12),
      requestsPerSec: Math.max(1, Math.round(activeExaminees * 0.8)),
      simulatedStressLevel
    },
    recentLogs: requestLogBuffer.slice(0, 15)
  });
});

// Endpoint to simulate peak load stress or update active examinee load
app.post('/api/admin/set-load-simulation', (req, res) => {
  const { stressLevel, examineeCount } = req.body || {};
  if (typeof stressLevel === 'number') {
    simulatedStressLevel = Math.max(0, Math.min(2, stressLevel));
  }
  if (typeof examineeCount === 'number') {
    simulatedActiveTestTakers = Math.max(0, Math.min(1000, examineeCount));
  }
  return res.json({
    success: true,
    message: `Server stress level updated to ${simulatedStressLevel} (${simulatedStressLevel === 0 ? 'Normal' : simulatedStressLevel === 1 ? 'Moderate Peak' : 'Heavy Peak Stress'}), active examinees target: ${simulatedActiveTestTakers}`
  });
});

// Endpoint to trigger garbage collection / cache flush simulation
app.post('/api/admin/flush-cache', (_req, res) => {
  if (global.gc) {
    try {
      global.gc();
    } catch (_) {
      // ignore
    }
  }
  return res.json({
    success: true,
    message: 'Server memory buffer & response cache flushed successfully.',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

