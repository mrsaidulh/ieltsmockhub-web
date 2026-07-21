import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, Smartphone, Key, GraduationCap, UserCheck, 
  Eye, EyeOff, Lock
} from 'lucide-react';
import { StudentLead } from '../types';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyUser: (user: StudentLead) => void;
}

export default function StudentAuthModal({
  isOpen,
  onClose,
  onVerifyUser
}: StudentAuthModalProps) {
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
        name: 'Saidul Hasan',
        email: 'info@ieltsmockhub.com',
        phone: '01340861415',
        verified: true,
        password: 'IELTSRevolution'
      }
    ];
    localStorage.setItem('ielts_registered_students', JSON.stringify(defaults));
    return defaults;
  });

  // Sync registered students when localStorage changes
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    onClose();
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
  };

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

    const cleanPhone = regPhone.replace(/[\s-]/g, '');
    const isBdNumber = /(^(\+880|880)?(1[3-9]\d{8})$)/.test(cleanPhone) || /^(01[3-9]\d{8})$/.test(cleanPhone);
    
    if (!isBdNumber) {
      setAuthError('Please enter a valid Bangladeshi mobile number (e.g. 01340861314)');
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
      
      // Reset forms and close
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setIsVerifyingRegPhone(false);
      setRegOtpCode('');
      setEnteredRegOtp('');
      
      setTimeout(() => {
        handleClose();
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
      setAuthError('Please enter a valid Bangladeshi mobile number (e.g. 01340861314)');
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

      onVerifyUser(student);
      setAuthSuccessMessage(`Welcome back, ${student.name}! Loading student dashboard...`);

      setLoginPhone('');
      setLoginPassword('');

      setTimeout(() => {
        handleClose();
      }, 1200);
    }, 800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/40 backdrop-blur-sm" 
      id="student-auth-modal-backdrop"
      onClick={handleClose}
    >
      <div className="flex min-h-full items-center justify-center p-4" onClick={handleClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl sm:rounded-3xl max-w-sm w-full p-5 sm:p-6 border border-gray-150 shadow-2xl space-y-4 sm:space-y-5 relative my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
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
                  placeholder="e.g. 01340861314"
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
                Mobile: <strong className="font-mono text-gray-700">01340861415</strong><br />
                Password: <strong className="font-mono text-gray-700">IELTSRevolution</strong>
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
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Verify & Register
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-rose-500" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saidul Hasan"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-rose-500 transition-colors"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <span className="text-xs">@</span>
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. info@ieltsmockhub.com"
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
                  placeholder="e.g. 01340861314"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-rose-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Create Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
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
                    <span>Sending SMS verification...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Send SMS Verification Code</span>
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
