import React, { useState, useEffect } from 'react';
import { users } from "./data";
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const styles = {
  accessBtnBase:  "flex-1 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-200 border",
  activeAccess:   "bg-[#FF6A00] border-[#FF6A00] text-white shadow-[0_0_16px_rgba(255,106,0,0.4)]",
  inactiveAccess: "bg-transparent border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300",
};

const GearIcon = () => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="white">
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
    <path fillRule="evenodd" clipRule="evenodd"
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33
         1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0
         01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0
         004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0
         001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83
         2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

export default function AuthPage({ onAuth }) {
  const [tab, setTab]                   = useState('login');
  const [accessLevel, setAccessLevel]   = useState('user');
  const [pendingOwner, setPendingOwner] = useState(null);

  useEffect(() => {
    if (accessLevel === 'admin') setTab('login');
  }, [accessLevel]);

  const handleLogin = (userData) => {
    const role = userData?.role || accessLevel;

    if (tab === 'signup' && role === 'admin') {
      alert("Admin accounts cannot be created via Sign Up. Please contact the platform administrator.");
      return;
    }

    if (tab === 'signup' && role === 'owner') {
      setPendingOwner({
        name:  userData?.name  || 'User',
        email: userData?.email || '',
        phone: userData?.phone || '',
        role:  'owner',
      });
      return;
    }

    // Pass the full user object through — preserves role, id, name from CSV
    onAuth({
      ...userData,
      name:  userData?.name  || 'User',
      email: userData?.email || '',
      phone: userData?.phone || '',
      role,
    });
  };

  const isAdmin = accessLevel === 'admin';

  if (pendingOwner) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4"
           style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="w-full max-w-[440px] bg-white rounded-3xl p-8 shadow-lg border border-slate-200 text-center">
          <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">⏳</span>
          </div>
          <h2 className="text-slate-900 font-black text-xl mb-2">Application Submitted!</h2>
          <p className="text-slate-600 text-sm mb-2">
            Hey <span className="text-slate-900 font-bold">{pendingOwner.name}</span>!
          </p>
          <p className="text-slate-500 text-sm mb-6">
            Your owner account is under review. Our admin team will verify your details
            and approve your account within <span className="text-sky-600 font-semibold">24-48 hours</span>.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Name</span>
              <span className="text-slate-900 font-semibold">{pendingOwner.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Email</span>
              <span className="text-slate-900 font-semibold">{pendingOwner.email || '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Role</span>
              <span className="text-sky-600 font-bold uppercase">Owner</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="text-sky-600 font-bold">Pending Review</span>
            </div>
          </div>
          <button
            onClick={() => setPendingOwner(null)}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[12px] transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;900&display=swap');`}</style>

      <div className="w-full max-w-[440px] bg-white rounded-3xl p-8 shadow-lg border border-slate-200">

        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-[#FF6A00] rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(255,106,0,0.45)]">
            <GearIcon />
          </div>
        </div>

        <div className="text-center mb-7">
          <h1 className="text-2xl font-black text-white tracking-tight">
            V-RENTAL <span className="text-[#FF6A00]">UK</span>
          </h1>
          <p className="text-[10px] font-semibold tracking-[0.22em] text-gray-500 mt-1 uppercase">
            Premium Mountain Access
          </p>
        </div>

        {!isAdmin ? (
          <div className="flex bg-[#060812] border border-gray-800 rounded-2xl p-1 mb-7">
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all duration-200
                  ${tab === t ? 'bg-[#1a2035] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex bg-[#060812] border border-gray-800 rounded-2xl p-1 mb-7">
            <div className="flex-1 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest text-center bg-[#1a2035] text-white shadow">
              Admin Login
            </div>
          </div>
        )}

        {tab === 'login' || isAdmin ? (
          <LoginForm
            onLogin={handleLogin}
            accessLevel={accessLevel}
            setAccessLevel={setAccessLevel}
            styles={styles}
          />
        ) : (
          <SignupForm
            onLogin={handleLogin}
            accessLevel={accessLevel}
            setAccessLevel={setAccessLevel}
            styles={styles}
          />
        )}
      </div>
    </div>
  );
}
