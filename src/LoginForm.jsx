import React, { useState, useEffect } from 'react';
import { getUsers } from "./data";
const LoginForm = ({ onLogin, accessLevel, setAccessLevel, styles }) => {
  const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [otp, setOtp]           = useState('');
  const [otpSent, setOtpSent]   = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('vrentaluk_remember'));
      if (saved?.email) { setEmail(saved.email); setRememberMe(true); }
      if (saved?.phone) { setPhone(saved.phone); setLoginMethod('phone'); setRememberMe(true); }
    } catch {}
  }, []);

  const handleLogin = () => {
    const foundUser = getUsers().find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) {
      alert("Invalid email or password");
      return;
    }

    // Role gate: selected button must match the account's role
    if (foundUser.role !== accessLevel) {
      alert(`Access denied.\n\nThese credentials belong to a "${foundUser.role}" account, but you selected "${accessLevel}".\n\nPlease click the correct role button before logging in.`);
      return;
    }

    if (rememberMe) {
      localStorage.setItem('vrentaluk_remember', JSON.stringify({ email }));
    } else {
      localStorage.removeItem('vrentaluk_remember');
    }

    onLogin(foundUser);
  };

  const handleSendOtp = () => {
    if (phone.trim().length >= 10) setOtpSent(true);
  };

  return (
    <div className="w-full animate-in fade-in zoom-in duration-300">

      {/* ── Login Method Toggle ───────────────────────────── */}
      <div className="flex gap-2 mb-5 bg-[#060812] border border-gray-800 rounded-xl p-1">
        <button
          type="button"
          onClick={() => { setLoginMethod('email'); setOtpSent(false); }}
          className={`flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all duration-200
            ${loginMethod === 'email'
              ? 'bg-[#FF6A00] text-white shadow-md'
              : 'text-gray-500 hover:text-gray-300'}`}
        >
          📧 Email
        </button>
        <button
          type="button"
          onClick={() => { setLoginMethod('phone'); setOtpSent(false); }}
          className={`flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all duration-200
            ${loginMethod === 'phone'
              ? 'bg-[#FF6A00] text-white shadow-md'
              : 'text-gray-500 hover:text-gray-300'}`}
        >
          📱 Phone
        </button>
      </div>

      {/* ── Email Login ───────────────────────────────────── */}
      {loginMethod === 'email' && (
        <>
          <div className="w-full bg-[#EBF1FD] p-5 rounded-2xl mb-5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-transparent text-gray-900 text-sm focus:outline-none placeholder-gray-400"
            />
          </div>

          <div className="w-full bg-[#060812] border border-gray-800 p-5 rounded-2xl mb-5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
              Password
            </label>
            <div className="flex items-center gap-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="flex-1 bg-transparent text-white focus:outline-none placeholder-gray-600 text-sm"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0">
                {showPassword
                  ? <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/></svg>
                  : <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Phone Login ───────────────────────────────────── */}
      {loginMethod === 'phone' && (
        <>
          <div className="w-full bg-[#EBF1FD] p-5 rounded-2xl mb-5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
              Phone Number
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-semibold text-sm">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98765 43210"
                className="flex-1 bg-transparent text-gray-900 text-sm focus:outline-none placeholder-gray-400"
              />
            </div>
          </div>

          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              className="w-full bg-[#1e2535] hover:bg-[#2a3347] text-white font-bold py-4 rounded-2xl uppercase tracking-widest text-[11px] mb-5 transition-all duration-200"
            >
              Send OTP
            </button>
          ) : (
            <div className="w-full bg-[#060812] border border-gray-800 p-5 rounded-2xl mb-5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •"
                className="w-full bg-transparent text-white focus:outline-none placeholder-gray-600 text-sm tracking-[0.5em]"
              />
            </div>
          )}
        </>
      )}

      {/* ── Role Selector ─────────────────────────────────── */}
      <div className="mb-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
          Select Your Role
        </p>
        <div className="flex gap-3">
          {['user', 'admin', 'owner'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setAccessLevel(role)}
              className={`${styles.accessBtnBase} ${accessLevel === role ? styles.activeAccess : styles.inactiveAccess}`}
            >
              {role === 'user' ? '👤' : role === 'admin' ? '🛡️' : '🔑'} {role}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-2">
          ⚠️ Your credentials must match the selected role
        </p>
      </div>

      {/* ── Remember Me ───────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 mt-5">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div
            onClick={() => setRememberMe(!rememberMe)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0
              ${rememberMe
                ? 'bg-[#FF6A00] border-[#FF6A00] shadow-[0_0_10px_rgba(255,106,0,0.4)]'
                : 'bg-transparent border-gray-600 group-hover:border-gray-400'}`}
          >
            {rememberMe && (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-[12px] font-medium text-gray-400 select-none">Remember me</span>
        </label>
        <button type="button" className="text-[11px] font-semibold text-[#FF6A00] hover:text-[#ff8533] transition-colors">
          Forgot password?
        </button>
      </div>

      {/* ── Access Dashboard Button ────────────────────────── */}
      <button
        onClick={handleLogin}
        type="button"
        disabled={loginMethod === 'phone' && !otpSent}
        className="w-full bg-[#FF6A00] hover:bg-[#ff7b1a] text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[13px] transition-all duration-200 shadow-[0_8px_24px_rgba(255,106,0,0.35)] hover:shadow-[0_12px_32px_rgba(255,106,0,0.5)] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Access Dashboard
      </button>
    </div>
  );
};

export default LoginForm;
