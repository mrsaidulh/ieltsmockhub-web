import { StudentLead } from '../types';

// Generate dates relative to today
const getPastDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_REGISTERED_STUDENTS: StudentLead[] = [
  {
    name: 'Saidul Hasan',
    email: 'info@ieltsmockhub.com',
    phone: '01340861415',
    verified: true,
    password: 'IELTSRevolution',
    isLocked: false,
    createdAt: getPastDate(2),
    lastActiveDate: getPastDate(0),
    testsCompletedCount: 5,
    lastTestDate: getPastDate(0),
  },
  {
    name: 'Tariqul Islam',
    email: 'tariq.ielts@gmail.com',
    phone: '01711223344',
    verified: true,
    password: 'Tariq#IELTS2026',
    isLocked: false,
    createdAt: getPastDate(18),
    lastActiveDate: getPastDate(1),
    testsCompletedCount: 9,
    lastTestDate: getPastDate(1),
  },
  {
    name: 'Nusrat Jahan',
    email: 'nusrat.j@yahoo.com',
    phone: '01819876543',
    verified: true,
    password: 'NusratPass789',
    isLocked: true, // One locked user for testing
    createdAt: getPastDate(12),
    lastActiveDate: getPastDate(10),
    testsCompletedCount: 0,
    lastTestDate: undefined,
  },
  {
    name: 'Mahmudul Karim',
    email: 'm.karim@outlook.com',
    phone: '01912345678',
    verified: true,
    password: 'KarimBand8Pass',
    isLocked: false,
    createdAt: getPastDate(25),
    lastActiveDate: getPastDate(0),
    testsCompletedCount: 14,
    lastTestDate: getPastDate(0),
  },
  {
    name: 'Farhana Akter',
    email: 'farhana.band8@gmail.com',
    phone: '01611002233',
    verified: true,
    password: 'Farhana#Mock99',
    isLocked: false,
    createdAt: getPastDate(1),
    lastActiveDate: getPastDate(0),
    testsCompletedCount: 2,
    lastTestDate: getPastDate(0),
  },
  {
    name: 'Tanvir Ahmed',
    email: 'tanvir.ahmed@gmail.com',
    phone: '01755443322',
    verified: true,
    password: 'Tanvir#2026IELTS',
    isLocked: false,
    createdAt: getPastDate(14),
    lastActiveDate: getPastDate(11),
    testsCompletedCount: 0,
    lastTestDate: undefined,
  },
  {
    name: 'Anika Tabassum',
    email: 'anika.t@hotmail.com',
    phone: '01844332211',
    verified: true,
    password: 'AnikaSecure#12',
    isLocked: false,
    createdAt: getPastDate(29),
    lastActiveDate: getPastDate(2),
    testsCompletedCount: 6,
    lastTestDate: getPastDate(3),
  },
  {
    name: 'Rakibul Hasan',
    email: 'rakib.h@gmail.com',
    phone: '01300998877',
    verified: false,
    password: 'RakibPassword!1',
    isLocked: false,
    createdAt: getPastDate(6),
    lastActiveDate: getPastDate(4),
    testsCompletedCount: 1,
    lastTestDate: getPastDate(4),
  },
  {
    name: 'Sabrina Chowdhury',
    email: 'sabrina.c@gmail.com',
    phone: '01788776655',
    verified: true,
    password: 'Sabrina#IELTS2026',
    isLocked: false,
    createdAt: getPastDate(22),
    lastActiveDate: getPastDate(19),
    testsCompletedCount: 0,
    lastTestDate: undefined,
  },
  {
    name: 'Imtiaz Hossain',
    email: 'imtiaz.h@gmail.com',
    phone: '01999887766',
    verified: true,
    createdAt: getPastDate(3),
    lastActiveDate: getPastDate(0),
    testsCompletedCount: 4,
    lastTestDate: getPastDate(0),
  },
  {
    name: 'Mehedi Hasan',
    email: 'mehedi.h@gmail.com',
    phone: '01555443322',
    verified: true,
    createdAt: getPastDate(15),
    lastActiveDate: getPastDate(1),
    testsCompletedCount: 7,
    lastTestDate: getPastDate(2),
  },
  {
    name: 'Sharmin Sultana',
    email: 'sharmin.s@gmail.com',
    phone: '01733221100',
    verified: true,
    createdAt: getPastDate(27),
    lastActiveDate: getPastDate(21),
    testsCompletedCount: 0,
    lastTestDate: undefined,
  },
];

// Helper to generate 30 days DAU and Registration trends data
export const generate30DayTrendData = () => {
  const result = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Realistic fluctuation pattern
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const baseVisitors = isWeekend ? 310 + Math.floor(Math.random() * 80) : 220 + Math.floor(Math.random() * 60);
    const dau = isWeekend ? 65 + Math.floor(Math.random() * 25) : 40 + Math.floor(Math.random() * 20);
    const newRegs = Math.floor(Math.random() * 5) + (isWeekend ? 2 : 1);
    const testsTaken = Math.floor(dau * (0.6 + Math.random() * 0.3));

    result.push({
      date: dateStr,
      fullDate: d.toISOString().split('T')[0],
      visitors: baseVisitors,
      dau,
      newRegs,
      testsTaken
    });
  }
  return result;
};

export const WEEKLY_HEATMAP_DATA = [
  { day: 'Mon', morning: 32, afternoon: 58, evening: 84, night: 22 },
  { day: 'Tue', morning: 40, afternoon: 62, evening: 91, night: 18 },
  { day: 'Wed', morning: 45, afternoon: 75, evening: 98, night: 25 },
  { day: 'Thu', morning: 38, afternoon: 60, evening: 88, night: 20 },
  { day: 'Fri', morning: 50, afternoon: 82, evening: 95, night: 35 },
  { day: 'Sat', morning: 85, afternoon: 96, evening: 90, night: 42 },
  { day: 'Sun', morning: 78, afternoon: 90, evening: 85, night: 30 },
];
