import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Bell, Flame, Target, User, Sparkles, 
  GraduationCap, LogOut, X, Smartphone, Mail, 
  Key, UserCheck, ShieldCheck, ArrowRight, HelpCircle,
  Eye, EyeOff, Lock, Unlock
} from 'lucide-react';
import { UserProgress, StudentLead } from '../types';

interface HeaderProps {
  progress: UserProgress;
  onChangeTarget: (newTarget: number) => void;
  streakIncremented: boolean;
  onClaimStreak: () => void;
  currentUser: StudentLead | null;
  onLogout: () => void;
  onVerifyUser: (lead: StudentLead) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

export default function Header({
  progress,
  onChangeTarget,
  streakIncremented,
  onClaimStreak,
  currentUser,
  onLogout,
  onVerifyUser,
  showAuthModal,
  setShowAuthModal,
}: HeaderProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);

  // Student Authentication State
  const [authTab, setAuthTab] = useState<'register' | 'login'>('login');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  // Registration Verification State
  const [isVerifyingRegPhone, setIsVerifyingRegPhone] = useState(false);
  const [regOtpCode, setRegOtpCode] = useState('');
  const [enteredRegOtp, setEnteredRegOtp] = useState('');

  // Store registered students list in local storage for durability and instant validation
  const [registeredStudents, setRegisteredStudents] = useState<StudentLead[]>(() => {
    const saved = localStorage.getItem('ielts_registered_students');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    // Default registered student matching user's likely demo phone/email
    const defaults = [
      {
        name: 'S.M. Saidul Islam',
        email: 'saidulgmac@gmail.com',
        phone: '0172010300',
        verified: true,
        password: 'password123'
      }
    ];
    localStorage.setItem('ielts_registered_students', JSON.stringify(defaults));
    return defaults;
  });

  // Sync registered students to state when localStorage updates
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('ielts_registered_students');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setRegisteredStudents(parsed);
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAuthModal) {
        setShowAuthModal(false);
        setAuthError(null);
        setAuthSuccessMessage(null);
        setLoginPhone('');
        setLoginPassword('');
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        setIsVerifyingRegPhone(false);
        setRegOtpCode('');
        setEnteredRegOtp('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAuthModal]);

  // Normalization helper to match phone numbers with different formatting
  const normalizePhone = (phoneStr: string) => {
    return phoneStr.replace(/[\s-]/g, '').replace(/^(\+880|880)/, '').replace(/^0/, '');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);

    if (!regName.trim()) {
      setAuthError('Please enter your full name first.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    // Validate Bangladeshi phone number: starts with 013-019 / +8801 / 1
    const cleanPhone = regPhone.replace(/[\s-]/g, '');
    const isBdNumber = /(^(\+880|880)?(1[3-9]\d{8})$)/.test(cleanPhone) || /^(01[3-9]\d{8})$/.test(cleanPhone);
    
    if (!isBdNumber) {
      setAuthError('Please enter a valid Bangladeshi mobile number (e.g. 0172010300)');
      return;
    }

    if (!regPassword || regPassword.length < 4) {
      setAuthError('Password must be at least 4 characters long.');
      return;
    }

    const regNormPhone = normalizePhone(regPhone);
    const alreadyRegistered = registeredStudents.some(
      (s) => normalizePhone(s.phone) === regNormPhone
    );

    if (alreadyRegistered) {
      setAuthError('This phone number is already registered. Please switch to the Login tab.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
      setRegOtpCode(generatedCode);
      setIsVerifyingRegPhone(true);
      setAuthSuccessMessage(`Security verification code sent to ${regPhone}! Please verify.`);
    }, 800);
  };

  const handleConfirmRegOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);

    if (enteredRegOtp !== regOtpCode) {
      setAuthError('Invalid verification code. Please enter the correct 4-digit code displayed in the SMS simulator.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newStudent: StudentLead = {
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        verified: true,
        password: regPassword
      };

      const updatedStudents = [...registeredStudents, newStudent];
      setRegisteredStudents(updatedStudents);
      localStorage.setItem('ielts_registered_students', JSON.stringify(updatedStudents));

      onVerifyUser(newStudent);
      setAuthSuccessMessage('Phone verified! Registration successful. Welcome to IELTS Mock Hub.');
      
      // Reset registration form
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setIsVerifyingRegPhone(false);
      setRegOtpCode('');
      setEnteredRegOtp('');
      
      // Close modal after delay
      setTimeout(() => {
        setShowAuthModal(false);
        setAuthSuccessMessage(null);
      }, 1200);
    }, 800);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);

    const cleanPhone = loginPhone.replace(/[\s-]/g, '');
    const isBdNumber = /(^(\+880|880)?(1[3-9]\d{8})$)/.test(cleanPhone) || /^(01[3-9]\d{8})$/.test(cleanPhone);
    
    if (!isBdNumber) {
      setAuthError('Please enter a valid Bangladeshi mobile number (e.g. 0172010300)');
      return;
    }

    if (!loginPassword) {
      setAuthError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const loginNormPhone = normalizePhone(loginPhone);
      const student = registeredStudents.find(
        (s) => normalizePhone(s.phone) === loginNormPhone
      );

      if (!student) {
        // Not registered - automatically switch to register tab and prefill phone number!
        setAuthError('No account found with this phone number. Switching you to the Register tab to sign up!');
        setTimeout(() => {
          setRegPhone(loginPhone);
          setAuthTab('register');
          setAuthError(null);
        }, 1800);
        return;
      }

      if (student.password !== loginPassword) {
        setAuthError('Incorrect password. Please try again.');
        return;
      }

      // Password matches, log them in!
      onVerifyUser(student);
      setAuthSuccessMessage(`Welcome back, ${student.name}! Loading student dashboard...`);

      // Reset login form
      setLoginPhone('');
      setLoginPassword('');

      setTimeout(() => {
        setShowAuthModal(false);
        setAuthSuccessMessage(null);
      }, 1200);
    }, 800);
  };

  const targets = [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" id="main-header">
        
        {/* Left Section - Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-md shadow-rose-100">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
              IELTS<span className="text-rose-600">Mock</span>Hub
            </span>
            <span className="font-mono text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
              IELTSmockhub.com
            </span>
          </div>
        </div>

        {/* Middle Section - Search Bar */}
        <div className="hidden max-w-md flex-1 px-8 md:block">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search mock tests, sections, or topics..."
              className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Right Section - User Profile */}
        <div className="flex items-center gap-4">
          
          {/* Profile Badge */}
          <div className="flex items-center gap-2">
            {currentUser && currentUser.verified ? (
              <>
                <div className="relative h-8 w-8 rounded-full bg-rose-100 ring-2 ring-rose-500/20 flex items-center justify-center text-rose-700 font-bold text-xs uppercase" title={currentUser.name}>
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="hidden flex-col md:flex text-left">
                  <span className="text-xs font-semibold text-gray-900 max-w-[100px] truncate">{currentUser.name}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">Verified Student</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                  title="Log out of Mock Hub"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 cursor-pointer transition-all bg-rose-600 hover:bg-rose-500 px-3.5 py-1.5 rounded-xl text-white font-bold text-xs shadow-sm shadow-rose-100"
              >
                <User className="h-3.5 w-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Student Authentication Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-3 sm:p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl sm:rounded-3xl max-w-sm w-full p-5 sm:p-6 border border-gray-150 shadow-2xl space-y-4 sm:space-y-5 relative max-h-[92vh] overflow-y-auto scrollbar-none"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError(null);
                  setAuthSuccessMessage(null);
                  setLoginPhone('');
                  setLoginPassword('');
                  setRegName('');
                  setRegEmail('');
                  setRegPhone('');
                  setRegPassword('');
                }}
                className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="space-y-1.5 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-base">Student Portal</h3>
                <p className="text-[11px] text-gray-500">
                  Access your mock exam scores, interactive performance graphs, and personalized metrics.
                </p>
              </div>

              {/* Auth Tabs */}
              {!isVerifyingRegPhone ? (
                <div className="flex rounded-xl bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setAuthError(null);
                      setAuthSuccessMessage(null);
                    }}
                    className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                      authTab === 'login'
                        ? 'bg-white text-rose-600 shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('register');
                      setAuthError(null);
                      setAuthSuccessMessage(null);
                    }}
                    className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                      authTab === 'register'
                        ? 'bg-white text-rose-600 shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Register
                  </button>
                </div>
              ) : (
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-2.5 text-center">
                  <span className="text-[11px] font-extrabold text-rose-600 uppercase tracking-wider flex items-center justify-center gap-1">
                    <Smartphone className="h-3.5 w-3.5 animate-pulse" />
                    Mobile Number Verification
                  </span>
                </div>
              )}

              {/* Success / Error Messages */}
              {authSuccessMessage && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-800 font-medium text-center animate-pulse animate-duration-1000">
                  {authSuccessMessage}
                </div>
              )}

              {authError && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-[11px] text-rose-700 font-medium text-left leading-relaxed">
                  {authError}
                </div>
              )}

              {authTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Bangladeshi Mobile */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Smartphone className="h-3 w-3" />
                      <span>Bangladeshi Mobile Number</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0172010300"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-rose-500 transition-colors"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 pr-10 text-xs text-gray-800 outline-none focus:bg-white focus:border-rose-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-100 transition-all active:scale-98 cursor-pointer font-sans"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Verifying credentials...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Log In to Student Portal</span>
                      </>
                    )}
                  </button>

                  {/* Hint Box */}
                  <div className="rounded-xl bg-gray-50 p-2.5 border border-gray-150 text-[10px] text-gray-500 leading-normal text-left">
                    <span className="font-bold text-rose-600 block mb-0.5">Demo Credentials:</span>
                    Mobile: <strong className="font-mono text-gray-700">0172010300</strong><br />
                    Password: <strong className="font-mono text-gray-700">password123</strong>
                  </div>
                </form>
              ) : isVerifyingRegPhone ? (
                <form onSubmit={handleConfirmRegOtp} className="space-y-4">
                  {/* SMS Simulation Banner */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">SMS Simulation</span>
                      <span className="text-[8px] font-mono font-semibold text-amber-500">Just Now</span>
                    </div>
                    <p className="text-[10px] text-gray-700 leading-normal">
                      <strong>IELTS Mock Hub:</strong> Your 4-digit registration verification code is: <strong className="font-mono text-xs text-rose-600 bg-rose-100/50 px-1.5 py-0.5 rounded border border-rose-200 font-black">{regOtpCode}</strong>
                    </p>
                  </div>

                  {/* Code Input */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Key className="h-3 w-3 text-rose-500" />
                      <span>Enter 4-Digit Verification Code</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      placeholder="e.g. 1234"
                      value={enteredRegOtp}
                      onChange={(e) => setEnteredRegOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-center text-sm font-mono font-bold tracking-widest text-gray-800 outline-none focus:bg-white focus:border-rose-500 transition-colors"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsVerifyingRegPhone(false);
                        setAuthError(null);
                        setAuthSuccessMessage(null);
                        setEnteredRegOtp('');
                      }}
                      className="flex-1 py-2 border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                    >
                      Change Details
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-100 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Verify & Enter</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  {/* Name */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. S.M. Saidul Islam"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-rose-500 transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. saidul@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-rose-500 transition-colors"
                    />
                  </div>

                  {/* Bangladeshi Mobile */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Smartphone className="h-3 w-3" />
                      <span>Bangladeshi Mobile Number</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0172010300"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-rose-500 transition-colors"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>Set Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="At least 4 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 pr-10 text-xs text-gray-800 outline-none focus:bg-white focus:border-rose-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-100 transition-all active:scale-98 cursor-pointer font-sans"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Create Account & Register</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Secure Trust Stamp */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-rose-500" />
                <span>Verified Student Portal Access</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
