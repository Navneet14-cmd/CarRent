import { useState, useEffect } from "react";
import { getAiResponse } from "./aiService";
import { loadAllData } from "./csvLoader";
import ProfileCard from './components/ProfileCard';

// ── Safe initial placeholders; real data loaded from CSV on mount ──────────
const MOCK_BOOKINGS = [];

const NOTIFICATIONS = [
  { id: 1, type: "booking", msg: "Welcome! Your account is active.",                   time: "just now", read: true  },
  { id: 2, type: "offer",   msg: "🎉 Weekend Special: 20% off all bikes this Friday!", time: "1d ago",   read: true  },
];

// ── Icons ───────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const HomeIcon     = () => <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" />;
const SearchIcon   = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />;
const BookingsIcon = () => <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />;
const WalletIcon   = () => <Icon d="M21 12V7H5a2 2 0 010-4h14v4M21 12v5H5a2 2 0 000 4h16v-4" />;
const BellIcon     = () => <Icon d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />;
const UserIcon     = () => <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />;
const SettingsIcon = () => <Icon d="M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />;
const LogoutIcon   = () => <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />;
const FilterIcon   = () => <Icon d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />;
const CheckIcon    = () => <Icon d="M20 6L9 17l-5-5" />;
const LockIcon     = () => <Icon d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4" />;
const UploadIcon   = () => <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />;
const MoonIcon     = () => <Icon d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />;
const SunIcon      = () => <Icon d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z" />;
const MapPinIcon   = () => <Icon d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 10a1 1 0 11-2 0 1 1 0 012 0z" />;
const AlertIcon    = () => <Icon d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />;
const PhoneCallIcon= () => <Icon d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.1 1.19 2 2 0 012.1 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.17 7.84a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />;
const FileIcon     = () => <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />;
const ShieldIcon   = () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const GiftIcon     = () => <Icon d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />;
const HelpIcon     = () => <Icon d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01M22 12A10 10 0 1112 2a10 10 0 0110 10z" />;
const GlobeIcon    = () => <Icon d="M12 2a10 10 0 100 20A10 10 0 0012 2zM2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />;
const ReceiptIcon  = () => <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4" />;
const ClockIcon    = () => <Icon d="M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2" />;
const HeartIcon    = ({ filled }) => filled
  ? <svg width={20} height={20} viewBox="0 0 24 24" fill="#f97316" stroke="#f97316" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
  : <Icon d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />;
const StarIcon     = ({ filled }) => <svg width={14} height={14} viewBox="0 0 24 24" fill={filled ? "#f97316" : "none"} stroke="#f97316" strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const CarIcon      = () => <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M5 17H3v-5l2-5h14l2 5v5h-2M5 17a2 2 0 104 0M15 17a2 2 0 104 0"/><path d="M5 12h14"/></svg>;
const BikeIcon     = () => <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17l3-8 3 3h3M6 17l4-8h5"/></svg>;
const ScootyIcon   = () => <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/><path d="M14 17H10M17 14V7l-3-3H9l-2 4"/></svg>;

// ── Helpers ─────────────────────────────────────────────────────────────────
const Stars = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => <StarIcon key={i} filled={i <= Math.round(rating)} />)}
  </div>
);

// ── Reusable password input with show/hide toggle ─────────────────────────────
const EyeOpenIcon  = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeCloseIcon = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/></svg>;
const PwInput = ({ placeholder, dark }) => {
  const [show, setShow] = useState(false);
  return (
    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm ${dark ? "bg-slate-700 border-white/10 text-white placeholder-slate-500 focus-within:border-sky-500/60" : "bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus-within:border-sky-400"} transition-colors`}>
      <input type={show ? "text" : "password"} placeholder={placeholder} className="flex-1 bg-transparent focus:outline-none placeholder-inherit" />
      <button type="button" onClick={() => setShow(v => !v)} className={`flex-shrink-0 ${dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"} transition-colors`}>
        {show ? <EyeCloseIcon /> : <EyeOpenIcon />}
      </button>
    </div>
  );
};

// ── HOME PAGE ────────────────────────────────────────────────────────────────
const HomePage = ({ setPage, setSelectedVehicle, vehicles = [] }) => {
  const [aiQuery, setAiQuery]     = useState("");
  const [aiResponse, setAiResponse] = useState("Hi! I'm your RideHive assistant. Need a ride in Dehradun or Rishikesh?");
  const [isTyping, setIsTyping]   = useState(false);

  const handleAiChat = async () => {
    if (!aiQuery.trim() || isTyping) return;
    setIsTyping(true);
    setAiResponse("Thinking...");
    try {
      setAiResponse(await getAiResponse(aiQuery));
    } catch {
      setAiResponse("I'm having trouble connecting right now. Please try again!");
    } finally { setAiQuery(""); setIsTyping(false); }
  };

  const recommended = vehicles.filter(v => v.rating >= 4.7);
  const offers = [
    { title: "Weekend Getaway", desc: "20% off on all bikes this weekend", color: "from-sky-500 to-cyan-400", code: "RIDE20" },
    { title: "EV Special",      desc: "Flat ₹200 off on electric vehicles",  color: "from-emerald-500 to-teal-400",  code: "GOGREEN" },
  ];
  const categories = [
    { label: "Cars",   icon: <CarIcon />,   color: "from-blue-500/20 to-blue-600/10 border-blue-500/30",     count: vehicles.filter(v=>v.type==="Car").length },
    { label: "Bikes",  icon: <BikeIcon />,  color: "from-sky-500/20 to-sky-600/10 border-sky-500/30", count: vehicles.filter(v=>v.type==="Bike").length },
    { label: "Scooty", icon: <ScootyIcon />,color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",count: vehicles.filter(v=>v.type==="Scooty").length },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 p-6 md:p-10">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"radial-gradient(circle at 70% 50%, #3b82f6 0%, transparent 60%)"}}/>
        <div className="relative">
          <p className="text-sky-600 font-semibold text-sm tracking-widest uppercase mb-2">Explore Uttarakhand</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-2">Find Your<br/>Perfect Ride</h2>
          <p className="text-slate-600 text-sm mb-5 max-w-xs">Cars, bikes & scooties across Dehradun, Rishikesh & Mussoorie</p>
          <button onClick={() => setPage("search")} className="bg-sky-500 hover:bg-sky-400 text-white font-bold px-6 py-2.5 rounded-xl transition-all text-sm">Browse Vehicles →</button>
        </div>
      </div>

      {/* AI */}
      <section className="p-5 rounded-2xl bg-white border border-sky-200 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white text-[10px] font-black">AI</div>
          <h3 className="text-slate-900 font-bold text-sm uppercase tracking-tight">Smart Trip Planner</h3>
        </div>
        <div className="bg-slate-100 rounded-xl p-4 mb-4 min-h-[48px] border border-sky-200">
          <p className="text-slate-700 text-xs leading-relaxed italic">{aiResponse}</p>
        </div>
        <div className="flex gap-2">
          <input value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyPress={e => e.key==="Enter" && handleAiChat()}
            placeholder="Ask AI for recommendations..."
            className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-700 outline-none focus:border-sky-500" />
          <button onClick={handleAiChat} disabled={isTyping} className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50">{isTyping ? "..." : "Ask"}</button>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h3 className="text-slate-900 font-bold text-lg mb-4">Vehicle Categories</h3>
        <div className="grid grid-cols-3 gap-3">
          {categories.map(cat => (
            <button key={cat.label} onClick={() => setPage("search")} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border bg-gradient-to-br ${cat.color} hover:scale-105 transition-all text-white`}>
              <span className="text-white/80">{cat.icon}</span>
              <span className="text-white font-bold text-sm">{cat.label}</span>
              <span className="text-white/50 text-xs">{cat.count} available</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <h3 className="text-white font-bold text-lg mb-4">Recommended for You</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recommended.map(v => (
            <div key={v.id} onClick={() => { setSelectedVehicle(v); setPage("details"); }}
              className="bg-white border border-slate-300 rounded-2xl p-4 flex gap-4 items-center cursor-pointer hover:border-sky-400 transition-all">
              <span className="text-4xl">{v.img}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{v.name}</p>
                <Stars rating={v.rating} />
                <p className="text-sky-400 font-bold text-sm mt-1">₹{v.daily}<span className="text-slate-500 font-normal">/day</span></p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${v.available ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                {v.available ? "Free" : "Busy"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Offers */}
      <section>
        <h3 className="text-white font-bold text-lg mb-4">Current Offers</h3>
        <div className="space-y-3">
          {offers.map(o => (
            <div key={o.code} className={`bg-gradient-to-r ${o.color} rounded-2xl p-4 flex justify-between items-center`}>
              <div>
                <p className="text-white font-bold">{o.title}</p>
                <p className="text-white/80 text-xs mt-0.5">{o.desc}</p>
              </div>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/30">{o.code}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// ── VEHICLE CARD ─────────────────────────────────────────────────────────────
const VehicleCard = ({ vehicle: v, inWishlist, toggleWishlist, onBook, onDetails, compact }) => (
  <div className={`bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-sky-300 transition-all ${compact ? "flex gap-4 p-4 items-center" : "p-4"}`}>
    <div className={`flex items-center justify-center bg-slate-700/60 rounded-xl ${compact ? "w-16 h-16 flex-shrink-0 text-3xl" : "h-28 text-5xl mb-4"}`}>
      {v.img}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <p className="text-white font-bold text-sm truncate pr-2">{v.name}</p>
        <button onClick={() => toggleWishlist(v.id)} className="flex-shrink-0 mt-0.5"><HeartIcon filled={inWishlist} /></button>
      </div>
      <div className="flex items-center gap-2 mt-1"><Stars rating={v.rating} /><span className="text-slate-500 text-xs">({v.reviews})</span></div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{v.fuel}</span>
        <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">📍 {v.location}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${v.available ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
          {v.available ? "✓ Available" : "✗ Booked"}
        </span>
      </div>
      {!compact && (
        <div className="flex items-center justify-between mt-3">
          <p className="text-sky-400 font-black text-lg">₹{v.daily}<span className="text-slate-500 text-xs font-normal">/day</span></p>
          <div className="flex gap-2">
            <button onClick={onDetails} className="text-xs px-3 py-1.5 rounded-xl border border-white/20 text-slate-300 hover:border-white/40 transition-colors">Details</button>
            <button onClick={onBook} disabled={!v.available} className="text-xs px-3 py-1.5 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Book Now</button>
          </div>
        </div>
      )}
      {compact && (
        <div className="flex items-center gap-2 mt-2">
          <p className="text-sky-400 font-bold text-sm flex-1">₹{v.daily}/day</p>
          <button onClick={onDetails} className="text-xs px-2 py-1 rounded-lg border border-white/20 text-slate-300">Details</button>
          <button onClick={onBook} disabled={!v.available} className="text-xs px-2 py-1 rounded-lg bg-sky-500 text-white font-semibold disabled:opacity-40 transition-colors">Book</button>
        </div>
      )}
    </div>
  </div>
);

// ── SEARCH PAGE ──────────────────────────────────────────────────────────────
const SearchPage = ({ wishlist, toggleWishlist, setPage, setSelectedVehicle, vehicles = [] }) => {
  const [query, setQuery]           = useState("");
  const [location, setLocation]     = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]       = useState({ type: "All", fuel: "All", maxPrice: 4000, rating: 0 });
  const [view, setView]             = useState("grid");

  const filtered = vehicles.filter(v => {
    const q = query.toLowerCase();
    return (
      (q === "" || v.name.toLowerCase().includes(q) || v.location.toLowerCase().includes(q)) &&
      (location === "" || v.location.toLowerCase().includes(location.toLowerCase())) &&
      (filters.type === "All" || v.type === filters.type) &&
      (filters.fuel === "All" || v.fuel === filters.fuel) &&
      v.daily <= filters.maxPrice &&
      v.rating >= filters.rating
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><SearchIcon /></span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search vehicle or city..."
            className="w-full bg-white border border-slate-300 text-slate-700 placeholder-slate-400 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-sky-500/60 transition-colors" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${showFilters ? "bg-sky-500 border-sky-500 text-white" : "bg-white border-slate-300 text-slate-700"}`}>
          <FilterIcon /><span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      <input value={location} onChange={e => setLocation(e.target.value)} placeholder="📍 Pickup location (e.g. Dehradun)"
        className="w-full bg-white border border-slate-300 text-slate-700 placeholder-slate-400 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-sky-500/60 transition-colors" />

      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h4 className="text-white font-semibold text-sm">Refine Results</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Vehicle Type</label>
              <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}
                className="w-full bg-slate-700 border border-white/10 text-white px-3 py-2 rounded-xl text-sm focus:outline-none">
                {["All","Car","Bike","Scooty"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Fuel Type</label>
              <select value={filters.fuel} onChange={e => setFilters({...filters, fuel: e.target.value})}
                className="w-full bg-slate-700 border border-white/10 text-white px-3 py-2 rounded-xl text-sm focus:outline-none">
                {["All","Petrol","Diesel","Electric"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Max Price: ₹{filters.maxPrice}/day</label>
            <input type="range" min={200} max={4000} step={100} value={filters.maxPrice}
              onChange={e => setFilters({...filters, maxPrice: +e.target.value})} className="w-full accent-sky-500" />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Min Rating: {filters.rating}⭐</label>
            <input type="range" min={0} max={5} step={0.5} value={filters.rating}
              onChange={e => setFilters({...filters, rating: +e.target.value})} className="w-full accent-sky-500" />
          </div>
          <button onClick={() => setFilters({ type:"All", fuel:"All", maxPrice:4000, rating:0 })}
            className="text-sky-400 text-xs hover:text-sky-300 transition-colors">Reset filters</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm"><span className="text-white font-semibold">{filtered.length}</span> vehicles found</p>
        <div className="flex gap-1">
          {["grid","list"].map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view===v ? "bg-sky-500 text-white" : "bg-white text-slate-700 border border-slate-300"}`}>{v==="grid"?"⊞":"☰"}</button>
          ))}
        </div>
      </div>

      <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-3"}>
        {filtered.length === 0 ? (
          <p className="text-slate-500 text-center py-10 col-span-2">No vehicles match your criteria.</p>
        ) : filtered.map(v => (
          <VehicleCard key={v.id} vehicle={v} inWishlist={wishlist.includes(v.id)} toggleWishlist={toggleWishlist}
            onBook={() => { setSelectedVehicle(v); setPage("booking"); }}
            onDetails={() => { setSelectedVehicle(v); setPage("details"); }}
            compact={view === "list"} />
        ))}
      </div>
    </div>
  );
};

// ── VEHICLE DETAILS PAGE ─────────────────────────────────────────────────────
const VehicleDetailsPage = ({ vehicle: v, inWishlist, toggleWishlist, setPage }) => {
  if (!v) return <p className="text-slate-400 text-center py-20">No vehicle selected. Go to Search.</p>;
  const specs = [["Type", v.type], ["Fuel", v.fuel], ["Seats", v.seats], ["CC", v.cc || "Electric"], ["Brand", v.brand], ["Location", v.location]];
  return (
    <div className="space-y-5">
      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-8 flex flex-col items-center">
        <span className="text-8xl mb-4">{v.img}</span>
        <h2 className="text-white font-black text-2xl">{v.name}</h2>
        <div className="flex items-center gap-2 mt-1"><Stars rating={v.rating} /><span className="text-slate-400 text-sm">({v.reviews} reviews)</span></div>
        <p className="text-sky-400 font-black text-3xl mt-2">₹{v.daily}<span className="text-slate-500 text-sm font-normal">/day</span></p>
        <p className="text-slate-500 text-sm">₹{v.hourly}/hour</p>
      </div>

      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-3">Description</h3>
        <p className="text-slate-400 text-sm leading-relaxed">The {v.name} is a reliable {v.type.toLowerCase()} ideal for exploring the hills of Uttarakhand. Comfortable for both city rides and mountain terrains, it offers excellent mileage and smooth handling.</p>
      </div>

      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-3">Specifications</h3>
        <div className="grid grid-cols-3 gap-3">
          {specs.map(([k, val]) => (
            <div key={k} className="bg-slate-700/50 rounded-xl p-3 text-center">
              <p className="text-slate-400 text-xs">{k}</p>
              <p className="text-white font-semibold text-sm mt-0.5">{val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-3">Owner Info</h3>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400"><UserIcon /></div>
          <div>
            <p className="text-white font-semibold text-sm">Rajesh Kumar</p>
            <p className="text-slate-400 text-xs">⭐ 4.9 · 142 trips · Verified Owner</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-3">Reviews</h3>
        <div className="space-y-3">
          {["Great ride, perfect for Mussoorie hills!", "Very smooth and fuel efficient. Highly recommended!", "Clean vehicle, owner was helpful."].map((r, i) => (
            <div key={i} className="border-b border-white/5 pb-3 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-slate-600 text-xs flex items-center justify-center text-white">U{i+1}</div>
                <Stars rating={5 - i * 0.5} />
              </div>
              <p className="text-slate-400 text-xs">{r}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => toggleWishlist(v.id)}
          className={`flex-1 py-3 rounded-2xl font-bold text-sm border transition-all ${inWishlist ? "bg-sky-500/20 border-sky-500/50 text-sky-400" : "border-white/20 text-white hover:border-white/40"}`}>
          {inWishlist ? "❤️ Wishlisted" : "🤍 Add to Wishlist"}
        </button>
        <button disabled={!v.available} onClick={() => setPage("booking")}
          className="flex-1 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white font-bold text-sm transition-all">
          Book Now
        </button>
      </div>
    </div>
  );
};

// ── BOOKING PAGE ─────────────────────────────────────────────────────────────
const BookingPage = ({ vehicle: v, licenseVerified, setPage }) => {
  const [bookingType, setBookingType] = useState("daily");
  const [date, setDate]               = useState("");
  const [returnDate, setReturnDate]   = useState("");
  const [hours, setHours]             = useState(1);
  const [coupon, setCoupon]           = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [payMethod, setPayMethod]     = useState("card");
  const [confirmed, setConfirmed]     = useState(false);

  if (!v) return <p className="text-slate-400 text-center py-20">No vehicle selected.</p>;

  const days     = bookingType === "daily" && date && returnDate ? Math.max(1, Math.ceil((new Date(returnDate) - new Date(date)) / 86400000)) : 1;
  const subtotal = bookingType === "daily" ? v.daily * days : v.hourly * hours;
  const discount = couponApplied ? Math.round(subtotal * 0.2) : 0;
  const total    = subtotal - discount;

  const handlePay = () => {
    if (!licenseVerified) { setPage("profile"); return; }
    if (bookingType === "daily" && (!date || !returnDate)) return;
    const booking = { vehicleName: v.name, type: bookingType, duration: bookingType === "daily" ? `${days} day(s)` : `${hours} hour(s)`, totalPrice: total, timestamp: new Date().toLocaleString() };
    const existing = JSON.parse(localStorage.getItem("ridehive_bookings")) || [];
    localStorage.setItem("ridehive_bookings", JSON.stringify([...existing, booking]));
    setConfirmed(true);
  };

  if (confirmed) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400"><CheckIcon /></div>
      <h2 className="text-white font-black text-2xl">Booking Confirmed!</h2>
      <p className="text-slate-400 text-sm">Your {v.name} is booked for {bookingType === "daily" ? `${days} day(s)` : `${hours} hour(s)`}.</p>
      <p className="text-sky-400 font-bold text-xl">Total Paid: ₹{total}</p>
      <p className="text-slate-500 text-xs">Booking ID: BK{Math.floor(Math.random()*900+100)}</p>
      <button onClick={() => setPage("bookings")} className="mt-4 bg-sky-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm">View My Bookings</button>
    </div>
  );

  return (
    <div className="space-y-5">
      {!licenseVerified && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-red-400"><LockIcon /></span>
          <div>
            <p className="text-red-400 font-semibold text-sm">License Not Verified</p>
            <p className="text-slate-400 text-xs">Verify your license before booking.</p>
          </div>
          <button onClick={() => setPage("profile")} className="ml-auto text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-semibold">Verify →</button>
        </div>
      )}

      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-4 flex gap-4 items-center">
        <span className="text-4xl">{v.img}</span>
        <div>
          <p className="text-white font-bold">{v.name}</p>
          <p className="text-slate-400 text-xs mt-1">₹{v.daily}/day · ₹{v.hourly}/hour</p>
        </div>
      </div>

      {/* Booking type */}
      <div className="flex gap-2">
        <button onClick={() => setBookingType("daily")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${bookingType==="daily" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400 border border-white/10"}`}>Daily</button>
        <button onClick={() => setBookingType("hourly")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${bookingType==="hourly" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400 border border-white/10"}`}>Hourly</button>
      </div>

      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5 space-y-4">
        <h3 className="text-white font-bold">Booking Details</h3>
        {bookingType === "daily" ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Pickup Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-700 border border-white/10 text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-500/60" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Return Date</label>
              <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)}
                className="w-full bg-slate-700 border border-white/10 text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-500/60" />
            </div>
          </div>
        ) : (
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Number of Hours</label>
            <input type="number" value={hours} min={1} onChange={e => setHours(+e.target.value)}
              className="w-full bg-slate-700 border border-white/10 text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-500/60" />
          </div>
        )}

        <div className="flex gap-2">
          <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter coupon code (try RIDE20)"
            className="flex-1 bg-slate-700 border border-white/10 text-white placeholder-slate-500 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-500/60" />
          <button onClick={() => { if(coupon === "RIDE20") setCouponApplied(true); }}
            className="bg-sky-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-sky-400 transition-colors">Apply</button>
        </div>
        {couponApplied && <p className="text-emerald-400 text-xs">✓ Coupon applied! 20% off</p>}
      </div>

      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5 space-y-2">
        <h3 className="text-white font-bold mb-3">Price Breakdown</h3>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">{bookingType === "daily" ? `₹${v.daily} × ${days} day(s)` : `₹${v.hourly} × ${hours} hour(s)`}</span>
          <span className="text-white">₹{subtotal}</span>
        </div>
        {couponApplied && <div className="flex justify-between text-sm"><span className="text-emerald-400">Discount (RIDE20)</span><span className="text-emerald-400">-₹{discount}</span></div>}
        <div className="border-t border-white/10 pt-2 flex justify-between">
          <span className="text-white font-bold">Total</span>
          <span className="text-sky-400 font-black text-lg">₹{total}</span>
        </div>
      </div>

      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-3">Payment Method</h3>
        <div className="grid grid-cols-2 gap-3">
          {[["card","💳 Card"],["wallet","👛 Wallet"]].map(([m, label]) => (
            <button key={m} onClick={() => setPayMethod(m)}
              className={`py-3 rounded-xl text-sm font-semibold border transition-all ${payMethod===m ? "bg-sky-500 border-sky-500 text-white" : "bg-slate-700 border-white/10 text-slate-300"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handlePay} disabled={bookingType === "daily" && (!date || !returnDate)}
        className="w-full py-4 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base rounded-2xl transition-all">
        {!licenseVerified ? "Verify License to Continue" : `Pay Now ₹${total}`}
      </button>
    </div>
  );
};

// ── MY BOOKINGS PAGE ─────────────────────────────────────────────────────────
const MyBookingsPage = ({ csvBookings = [] }) => {
  const [tab, setTab] = useState("upcoming");
  const saved = JSON.parse(localStorage.getItem("ridehive_bookings")) || [];
  const savedMapped = saved.map((b, i) => ({
    id: `MY${i}`, vehicle: b.vehicleName, from: b.timestamp?.split(",")[0] || "—",
    to: "—", price: b.totalPrice, status: "upcoming", img: "🚗",
  }));
  const csvMapped = csvBookings.map(b => ({
    id: b.id, vehicle: b.vehicle, from: b.from, to: b.to,
    price: b.amount, status: b.status?.toLowerCase() || "upcoming",
    img: b.type === "Car" ? "🚗" : b.type === "Bike" ? "🏍️" : "🛵",
  }));
  const all = [...csvMapped, ...savedMapped];
  const filtered = all.filter(b => b.status === tab);
  const tabs = [["upcoming","Upcoming"],["completed","Completed"],["cancelled","Cancelled"]];
  const statusColor = { upcoming:"text-blue-400 bg-blue-500/20", completed:"text-emerald-400 bg-emerald-500/20", cancelled:"text-red-400 bg-red-500/20" };

  return (
    <div className="space-y-5">
      <div className="flex bg-slate-800/60 border border-white/10 rounded-2xl p-1">
        {tabs.map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${tab===k ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"}`}>{l}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-slate-500 text-center py-16">No {tab} bookings.</p>
      ) : filtered.map(b => (
        <div key={b.id} className="bg-slate-800/70 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{b.img}</span>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">{b.vehicle}</p>
              <p className="text-slate-400 text-xs mt-0.5">{b.from} → {b.to}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${statusColor[b.status]}`}>{b.status}</span>
            </div>
            <p className="text-sky-400 font-black text-lg">₹{b.price}</p>
          </div>
          <p className="text-slate-500 text-xs">Booking ID: #{b.id}</p>
          <div className="flex gap-2 pt-1">
            {tab === "upcoming"  && <><button className="flex-1 py-2 rounded-xl border border-red-500/40 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors">Cancel</button><button className="flex-1 py-2 rounded-xl border border-blue-500/40 text-blue-400 text-sm font-semibold hover:bg-blue-500/10 transition-colors">Extend</button></>}
            {tab === "completed" && <button className="flex-1 py-2 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-400 transition-colors">Book Again</button>}
            {tab === "cancelled" && <button className="flex-1 py-2 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-400 transition-colors">Book Again</button>}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── WISHLIST PAGE ────────────────────────────────────────────────────────────
const WishlistPage = ({ wishlist, toggleWishlist, setPage, setSelectedVehicle, vehicles = [] }) => {
  const items = vehicles.filter(v => wishlist.includes(v.id));
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <p className="text-5xl">🤍</p>
          <p className="text-white font-bold">Your wishlist is empty</p>
          <p className="text-slate-400 text-sm">Save vehicles you love while browsing.</p>
        </div>
      ) : items.map(v => (
        <div key={v.id} className="bg-slate-800/70 border border-white/10 rounded-2xl p-4 flex gap-4 items-center">
          <span className="text-4xl">{v.img}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{v.name}</p>
            <Stars rating={v.rating} />
            <p className="text-sky-400 font-bold text-sm mt-1">₹{v.daily}/day</p>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => { setSelectedVehicle(v); setPage("booking"); }}
              className="bg-sky-500 text-white text-xs px-3 py-1.5 rounded-xl font-semibold hover:bg-sky-400 transition-colors">Book</button>
            <button onClick={() => toggleWishlist(v.id)} className="border border-white/20 text-slate-400 text-xs px-3 py-1.5 rounded-xl hover:border-red-500/40 hover:text-red-400 transition-colors">Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── WALLET PAGE ──────────────────────────────────────────────────────────────
const WalletPage = () => {
  const [balance, setBalance] = useState(2450);
  const [amount, setAmount]   = useState("");
  const txns = [
    { type:"credit", desc:"Added via UPI",        amt: 500, date:"Apr 3"  },
    { type:"debit",  desc:"Booking BK002",         amt: 499, date:"Mar 20" },
    { type:"credit", desc:"Refund - BK003",        amt: 250, date:"Mar 8"  },
    { type:"debit",  desc:"Booking BK001 deposit", amt: 200, date:"Mar 1"  },
  ];
  return (
    <div className="space-y-5">
      <div className="relative bg-gradient-to-br from-sky-500 to-cyan-400 rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:"radial-gradient(circle at 80% 20%, white 0%, transparent 60%)"}} />
        <p className="text-white/80 text-sm font-medium">Available Balance</p>
        <p className="text-white font-black text-4xl mt-1">₹{balance.toLocaleString()}</p>
        <p className="text-white/60 text-xs mt-2">Last updated just now</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-4 space-y-2">
          <p className="text-slate-400 text-xs font-semibold">Add Money</p>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ Enter amount"
            className="w-full bg-slate-700 border border-white/10 text-white placeholder-slate-500 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-sky-500/60" />
          <button onClick={() => { if(+amount > 0) { setBalance(b => b + +amount); setAmount(""); } }}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-xl transition-colors">Add ₹{amount||0}</button>
        </div>
        <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-4 space-y-2">
          <p className="text-slate-400 text-xs font-semibold">Withdraw</p>
          <input type="number" placeholder="₹ Enter amount"
            className="w-full bg-slate-700 border border-white/10 text-white placeholder-slate-500 px-3 py-2 rounded-xl text-sm focus:outline-none" />
          <button className="w-full py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm font-bold rounded-xl transition-colors">Withdraw</button>
        </div>
      </div>
      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Transaction History</h3>
        <div className="space-y-3">
          {txns.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${t.type==="credit" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                {t.type==="credit" ? "+" : "-"}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{t.desc}</p>
                <p className="text-slate-500 text-xs">{t.date}</p>
              </div>
              <p className={`font-bold text-sm ${t.type==="credit" ? "text-emerald-400" : "text-red-400"}`}>
                {t.type==="credit" ? "+" : "-"}₹{t.amt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── NOTIFICATIONS PAGE ───────────────────────────────────────────────────────
const NotificationsPage = ({ notes, setNotes }) => {
  const typeIcon  = { booking:"🚗", reminder:"⏰", offer:"🎉" };
  const markAll   = () => setNotes(n => n.map(x => ({...x, read:true})));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">{notes.filter(n=>!n.read).length} unread</span>
        <button onClick={markAll} className="text-sky-400 text-xs hover:text-sky-300 transition-colors">Mark all read</button>
      </div>
      {notes.map(n => (
        <div key={n.id} onClick={() => setNotes(prev => prev.map(x => x.id===n.id ? {...x, read:true} : x))}
          className={`flex gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${n.read ? "bg-slate-800/40 border-white/5" : "bg-slate-800/80 border-sky-500/20"}`}>
          <span className="text-xl flex-shrink-0 mt-0.5">{typeIcon[n.type]}</span>
          <div className="flex-1">
            <p className={`text-sm ${n.read ? "text-slate-400" : "text-white"}`}>{n.msg}</p>
            <p className="text-slate-600 text-xs mt-1">{n.time}</p>
          </div>
          {!n.read && <div className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0 mt-2" />}
        </div>
      ))}
    </div>
  );
};

// ── PROFILE PAGE ─────────────────────────────────────────────────────────────
const ProfilePage = ({ licenseVerified, setLicenseVerified, currentUser = { name: "User", email: "" }, onUpdateUser }) => {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded]   = useState(false);
  const [name, setName]   = useState(currentUser.name || "");
  const [email, setEmail] = useState(currentUser.email || "");
  const [phone, setPhone] = useState(currentUser.phone || "+91 98765 43210");
  const [city, setCity]   = useState(currentUser.city || "Dehradun");
  const [saved, setSaved] = useState(false);
  const handleUpload = () => { setUploading(true); setTimeout(() => { setUploading(false); setUploaded(true); }, 1500); };
  const handleVerify = () => { setTimeout(() => setLicenseVerified(true), 800); };
  const handleSave = () => { if (onUpdateUser) onUpdateUser({ name, email, phone, city }); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
  <div className="space-y-6">

    {/* 🔥 PROFILE CARD (NEW) */}
    <div className="flex justify-center">
      <ProfileCard
        name={name}
        title="RideHive Premium"
        handle={email?.split("@")[0] || "user"}
        status={licenseVerified ? "Verified" : "Not Verified"}
        contactText="Edit Profile"
      />
    </div>

    {/* 📝 PERSONAL INFO FORM (OLD - KEPT) */}
    <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5 space-y-4">
      <h3 className="text-white font-bold">Personal Information</h3>

      {[
        ["Full Name", name, setName],
        ["Email", email, setEmail],
        ["Phone", phone, setPhone],
        ["City", city, setCity]
      ].map(([label, value, setter]) => (
        <div key={label}>
          <label className="text-slate-400 text-xs mb-1 block">{label}</label>
          <input
            value={value}
            onChange={(e) => setter(e.target.value)}
            className="w-full bg-slate-700 border border-white/10 text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500/60"
          />
        </div>
      ))}

      <button
        onClick={handleSave}
        className={`w-full py-2.5 font-bold text-sm rounded-xl transition-colors ${
          saved
            ? "bg-emerald-500 text-white"
            : "bg-sky-500 hover:bg-sky-400 text-white"
        }`}
      >
        {saved ? "✓ Saved!" : "Save Changes"}
      </button>
    </div>

    {/* 🚗 LICENSE SECTION (UNCHANGED) */}
    <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold">Driving License</h3>
        <span
          className={`text-xs px-3 py-1 rounded-full font-semibold ${
            licenseVerified
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {licenseVerified ? "✓ Verified" : "✗ Not Verified"}
        </span>
      </div>

      {!licenseVerified && (
        <>
          <p className="text-slate-400 text-sm">
            Upload your driving license to unlock booking.
          </p>

          <div
            className={`border-2 border-dashed rounded-2xl p-6 text-center ${
              uploaded
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-white/20 hover:border-sky-500/40"
            }`}
          >
            {uploaded ? (
              <div>
                <p className="text-emerald-400 font-semibold text-sm">
                  ✓ License uploaded
                </p>
                <p className="text-slate-500 text-xs">license_dl.pdf</p>
              </div>
            ) : (
              <div>
                <p className="text-slate-400 text-sm">
                  Drop your license here
                </p>
                <p className="text-slate-600 text-xs">
                  PDF, JPG or PNG · Max 5MB
                </p>
              </div>
            )}
          </div>

          {!uploaded ? (
            <button
              onClick={handleUpload}
              className="w-full py-2.5 border border-sky-500/50 text-sky-400 font-semibold text-sm rounded-xl"
            >
              {uploading ? "Uploading..." : "Upload License"}
            </button>
          ) : (
            <button
              onClick={handleVerify}
              className="w-full py-2.5 bg-emerald-500 text-white font-bold text-sm rounded-xl"
            >
              Submit for Verification
            </button>
          )}
        </>
      )}

      {licenseVerified && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <span className="text-emerald-400 text-xl">✓</span>
          <div>
            <p className="text-emerald-400 font-semibold text-sm">
              License Verified
            </p>
            <p className="text-slate-500 text-xs">
              DL No: UK05-2018-0041234 · Valid till 2030
            </p>
          </div>
        </div>
      )}
    </div>

  </div>
);
};

// ── SETTINGS PAGE ────────────────────────────────────────────────────────────
const SettingsPage = ({ darkMode, setDarkMode }) => {
  const [notifPrefs, setNotifPrefs] = useState({ booking:true, reminders:true, offers:false });
  const [showPw, setShowPw]         = useState(false);
  return (
    <div className="space-y-5">
      <div className="bg-slate-800/70 border border-white/10 rounded-2xl divide-y divide-white/5">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            {darkMode ? <MoonIcon /> : <SunIcon />}
            <div>
              <p className="text-white font-semibold text-sm">Dark Mode</p>
              <p className="text-slate-500 text-xs">Toggle app appearance</p>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 rounded-full transition-all relative ${darkMode ? "bg-sky-500" : "bg-slate-600"}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${darkMode ? "left-7" : "left-1"}`} />
          </button>
        </div>
        <div className="p-5">
          <button onClick={() => setShowPw(!showPw)} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <LockIcon />
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Change Password</p>
                <p className="text-slate-500 text-xs">Update your account password</p>
              </div>
            </div>
            <span className="text-slate-400 text-xs">{showPw ? "▲" : "▼"}</span>
          </button>
          {showPw && (
            <div className="mt-4 space-y-3">
              {["Current Password","New Password","Confirm Password"].map(l => (
                <PwInput key={l} placeholder={l} dark />
              ))}
              <button className="w-full py-2.5 bg-sky-500 text-white font-bold text-sm rounded-xl hover:bg-sky-400 transition-colors">Update Password</button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5 space-y-4">
        <h3 className="text-white font-bold">Notification Preferences</h3>
        {[["booking","Booking Updates","Get alerts for booking status"],["reminders","Ride Reminders","Get pickup & return reminders"],["offers","Offers & Promotions","Receive exclusive deals"]].map(([k,l,d]) => (
          <div key={k} className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">{l}</p>
              <p className="text-slate-500 text-xs">{d}</p>
            </div>
            <button onClick={() => setNotifPrefs(p => ({...p, [k]:!p[k]}))}
              className={`w-12 h-6 rounded-full transition-all relative ${notifPrefs[k] ? "bg-sky-500" : "bg-slate-600"}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifPrefs[k] ? "left-7" : "left-1"}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── ACTIVE RIDE TRACKER ──────────────────────────────────────────────────────
const RideTrackerPage = () => {
  const [elapsed, setElapsed] = useState(0);
  const [active, setActive]   = useState(true);
  const activeRide = { id:"BK001", vehicle:"Royal Enfield Himalayan", img:"🏍️", pickup:"Rajpur Road, Dehradun", dropoff:"Mall Road, Mussoorie", pickupTime:"10:00 AM", returnTime:"6:00 PM", date:"Apr 10, 2025", total:2400 };
  const stages = ["Confirmed","Picked Up","Ride Active","Returned"];
  const [stage, setStage] = useState(1);

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e+1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const returnHour = 18, now = new Date(), remaining = Math.max(0, (new Date().setHours(returnHour,0,0,0) - now)/1000);

  return (
    <div className="space-y-5">
      {/* Active badge */}
      <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <p className="text-emerald-400 font-bold text-sm">Ride In Progress</p>
        <span className="ml-auto text-emerald-400 font-mono text-sm font-bold">{fmt(elapsed)}</span>
      </div>

      {/* Vehicle */}
      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5 flex gap-4 items-center">
        <span className="text-5xl">{activeRide.img}</span>
        <div>
          <p className="text-white font-black text-lg">{activeRide.vehicle}</p>
          <p className="text-slate-400 text-xs mt-0.5">Booking #{activeRide.id} · {activeRide.date}</p>
          <p className="text-sky-400 font-bold text-sm mt-1">Total: ₹{activeRide.total}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Ride Progress</h3>
        <div className="relative">
          <div className="absolute top-3.5 left-3.5 right-3.5 h-0.5 bg-slate-700 z-0" />
          <div className="absolute top-3.5 left-3.5 h-0.5 bg-sky-500 z-0 transition-all duration-500" style={{width:`${(stage/(stages.length-1))*100}%`}} />
          <div className="relative flex justify-between">
            {stages.map((s,i) => (
              <div key={s} className="flex flex-col items-center gap-2 z-10">
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
                  ${i<=stage ? "bg-sky-500 border-sky-500 text-white" : "bg-slate-800 border-slate-600 text-slate-500"}`}>
                  {i < stage ? "✓" : i+1}
                </div>
                <span className={`text-[10px] font-medium text-center w-14 ${i<=stage ? "text-sky-400" : "text-slate-500"}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        {stage < stages.length-1 && (
          <button onClick={()=>setStage(s=>Math.min(s+1,stages.length-1))} className="w-full mt-4 py-2 text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors">
            Advance Stage (Demo)
          </button>
        )}
      </div>

      {/* Location */}
      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5 space-y-3">
        <h3 className="text-white font-bold">Route Details</h3>
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5"><MapPinIcon /></div>
          <div><p className="text-white text-sm font-medium">Pickup</p><p className="text-slate-400 text-xs">{activeRide.pickup}</p><p className="text-slate-500 text-xs">{activeRide.pickupTime}</p></div>
        </div>
        <div className="ml-3.5 border-l-2 border-dashed border-slate-700 h-4" />
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5"><MapPinIcon /></div>
          <div><p className="text-white text-sm font-medium">Drop-off</p><p className="text-slate-400 text-xs">{activeRide.dropoff}</p><p className="text-slate-500 text-xs">{activeRide.returnTime}</p></div>
        </div>
      </div>

      {/* Return countdown */}
      <div className="bg-slate-800/70 border border-sky-500/20 rounded-2xl p-5 text-center">
        <p className="text-slate-400 text-xs mb-1">Time Until Return Deadline</p>
        <p className="text-sky-400 font-mono font-black text-3xl">{fmt(Math.floor(remaining))}</p>
        <p className="text-slate-500 text-xs mt-1">Return by {activeRide.returnTime} to avoid late fees</p>
      </div>

      {/* SOS */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white flex-shrink-0"><AlertIcon /></div>
        <div className="flex-1"><p className="text-red-400 font-bold text-sm">Emergency / SOS</p><p className="text-slate-400 text-xs">Contact support immediately if needed</p></div>
        <a href="tel:+911800123456" className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-400 transition-colors">Call SOS</a>
      </div>
    </div>
  );
};

// ── RATINGS & REVIEWS PAGE ───────────────────────────────────────────────────
const RatingsPage = ({ csvBookings = [] }) => {
  const [ratings, setRatings] = useState({});
  const [reviews, setReviews] = useState({});
  const [submitted, setSubmitted] = useState({});
  const toRate = csvBookings
    .filter(b => b.status?.toLowerCase() === "completed")
    .map(b => ({
      id: b.id,
      vehicle: b.vehicle,
      img: b.type === "Car" ? "🚗" : b.type === "Bike" ? "🏍️" : "🛵",
      status: "completed",
    }));

  const handleSubmit = (id) => {
    if (!ratings[id]) return;
    setSubmitted(s => ({...s, [id]: true}));
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-center">
        <p className="text-2xl font-black text-white">⭐ Rate Your Rides</p>
        <p className="text-slate-400 text-sm mt-1">Your feedback helps owners improve their service</p>
      </div>

      {toRate.map(b => (
        <div key={b.id} className="bg-slate-800/70 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{b.img}</span>
            <div><p className="text-white font-bold text-sm">{b.vehicle}</p><p className="text-slate-400 text-xs">{b.from} → {b.to} · ₹{b.price}</p></div>
            {submitted[b.id] && <span className="ml-auto bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full font-semibold">✓ Submitted</span>}
          </div>

          {!submitted[b.id] ? (
            <>
              <div>
                <p className="text-slate-400 text-xs mb-2">Your Rating</p>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => setRatings(r => ({...r, [b.id]: star}))}
                      className="transition-transform hover:scale-110">
                      <svg width={32} height={32} viewBox="0 0 24 24"
                        fill={star <= (ratings[b.id]||0) ? "#f97316" : "none"}
                        stroke="#f97316" strokeWidth={2}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </button>
                  ))}
                  {ratings[b.id] && <span className="text-sky-400 font-bold text-sm self-center ml-1">{["","Poor","Fair","Good","Great","Excellent!"][ratings[b.id]]}</span>}
                </div>
              </div>
              <textarea value={reviews[b.id]||""} onChange={e => setReviews(r => ({...r, [b.id]: e.target.value}))}
                placeholder="Share your experience (optional)..."
                rows={3} className="w-full bg-slate-700 border border-white/10 text-white placeholder-slate-500 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-sky-500/60 resize-none" />
              <button onClick={() => handleSubmit(b.id)} disabled={!ratings[b.id]}
                className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors">
                Submit Review
              </button>
            </>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
              <p className="text-emerald-400 font-semibold text-sm">Thanks for your review! 🎉</p>
              <div className="flex justify-center gap-1 mt-1">
                {[1,2,3,4,5].map(s => <svg key={s} width={16} height={16} viewBox="0 0 24 24" fill={s<=ratings[b.id]?"#f97316":"none"} stroke="#f97316" strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ── BOOKING RECEIPTS PAGE ────────────────────────────────────────────────────
const ReceiptsPage = () => {
  const [expanded, setExpanded] = useState(null);
  const receipts = [
    { id:"BK001", vehicle:"Royal Enfield Himalayan", img:"🏍️", date:"Apr 10–12, 2025", days:2, rate:1200, subtotal:2400, discount:0, gst:432, total:2832, pickup:"Rajpur Road, Dehradun", dropoff:"Mall Road, Mussoorie", payMethod:"Card •••• 4242", status:"upcoming" },
    { id:"BK002", vehicle:"Honda Activa 6G",         img:"🛵", date:"Mar 20–21, 2025", days:1, rate:500,  subtotal:500,  discount:100,gst:72,  total:472,  pickup:"ISBT Rishikesh",       dropoff:"Laxman Jhula",         payMethod:"Wallet",        status:"completed" },
    { id:"BK003", vehicle:"Tata Nexon",              img:"🚗", date:"Mar 5–7, 2025",   days:2, rate:3500, subtotal:7000, discount:0,  gst:1260, total:7000, pickup:"Clement Town, Ddn",    dropoff:"Landour, Mussoorie",   payMethod:"UPI",           status:"cancelled" },
  ];
  const statusColor = { upcoming:"text-blue-400", completed:"text-emerald-400", cancelled:"text-red-400" };

  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">Tap any receipt to view full breakdown</p>
      {receipts.map(r => (
        <div key={r.id} className="bg-slate-800/70 border border-white/10 rounded-2xl overflow-hidden">
          <button onClick={() => setExpanded(expanded===r.id ? null : r.id)}
            className="w-full flex items-center gap-4 p-4 text-left">
            <span className="text-3xl">{r.img}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">{r.vehicle}</p>
              <p className="text-slate-400 text-xs">{r.date}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sky-400 font-black">₹{r.total}</p>
              <p className={`text-xs font-semibold ${statusColor[r.status]}`}>{r.status}</p>
            </div>
            <span className="text-slate-500 ml-2">{expanded===r.id ? "▲" : "▼"}</span>
          </button>

          {expanded === r.id && (
            <div className="border-t border-white/10 p-4 space-y-3 bg-slate-900/50">
              <div className="text-xs text-slate-400 space-y-2">
                <div className="flex justify-between"><span>Booking ID</span><span className="text-white font-mono">#{r.id}</span></div>
                <div className="flex justify-between"><span>Vehicle</span><span className="text-white">{r.vehicle}</span></div>
                <div className="flex justify-between"><span>Duration</span><span className="text-white">{r.days} day(s) × ₹{r.rate}</span></div>
                <div className="flex justify-between"><span>Pickup</span><span className="text-white text-right max-w-[55%]">{r.pickup}</span></div>
                <div className="flex justify-between"><span>Drop-off</span><span className="text-white text-right max-w-[55%]">{r.dropoff}</span></div>
                <div className="flex justify-between"><span>Payment</span><span className="text-white">{r.payMethod}</span></div>
                <div className="border-t border-white/10 pt-2 flex justify-between"><span>Subtotal</span><span className="text-white">₹{r.subtotal}</span></div>
                {r.discount>0 && <div className="flex justify-between"><span>Discount</span><span className="text-emerald-400">-₹{r.discount}</span></div>}
                <div className="flex justify-between"><span>GST (18%)</span><span className="text-white">₹{r.gst}</span></div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-sm"><span className="text-white">Total Paid</span><span className="text-sky-400">₹{r.total}</span></div>
              </div>
              <button className="w-full py-2.5 border border-sky-500/40 text-sky-400 text-xs font-bold rounded-xl hover:bg-sky-500/10 transition-colors">
                📄 Download PDF Receipt
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ── REFERRAL & LOYALTY PAGE ──────────────────────────────────────────────────
const LoyaltyPage = ({ currentUser }) => {
  const [copied, setCopied] = useState(false);
  const referralCode = "RIDE-" + (currentUser?.name?.substring(0,3).toUpperCase() || "USR") + "2025";
  const points = 1240;
  const tier = points >= 2000 ? "Gold" : points >= 1000 ? "Silver" : "Bronze";
  const tierColor = { Gold:"from-sky-400 to-cyan-500", Silver:"from-slate-300 to-slate-400", Bronze:"from-sky-600 to-cyan-700" };
  const nextTier = points >= 2000 ? null : points >= 1000 ? { name:"Gold", need:2000-points } : { name:"Silver", need:1000-points };
  const history = [
    { desc:"Completed BK002", pts:"+50", date:"Mar 21" },
    { desc:"Referral bonus - Friend joined", pts:"+200", date:"Mar 15" },
    { desc:"Welcome bonus", pts:"+100", date:"Mar 1" },
    { desc:"Redeemed for discount", pts:"-200", date:"Feb 28" },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode).catch(()=>{});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Tier card */}
      <div className={`relative bg-gradient-to-br ${tierColor[tier]} rounded-2xl p-6 overflow-hidden`}>
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:"radial-gradient(circle at 80% 20%, white 0%, transparent 60%)"}} />
        <div className="relative">
          <p className="text-white/80 text-sm font-semibold">{tier} Member 🏆</p>
          <p className="text-white font-black text-4xl mt-1">{points.toLocaleString()} pts</p>
          {nextTier && <p className="text-white/70 text-xs mt-2">{nextTier.need} pts more to reach {nextTier.name}</p>}
        </div>
      </div>

      {/* Progress to next tier */}
      {nextTier && (
        <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>{tier}</span><span>{nextTier.name}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className="bg-sky-500 h-2.5 rounded-full transition-all" style={{width:`${(points/(points+nextTier.need))*100}%`}} />
          </div>
          <p className="text-slate-400 text-xs mt-2 text-center">{nextTier.need} points to unlock {nextTier.name} benefits</p>
        </div>
      )}

      {/* Referral */}
      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5 space-y-3">
        <h3 className="text-white font-bold">🎁 Refer & Earn</h3>
        <p className="text-slate-400 text-sm">Share your code and earn <span className="text-sky-400 font-bold">200 points</span> per friend who joins!</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-700 border border-white/10 rounded-xl px-4 py-3">
            <p className="text-sky-400 font-mono font-black text-lg tracking-widest">{referralCode}</p>
          </div>
          <button onClick={handleCopy} className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${copied ? "bg-emerald-500 text-white" : "bg-sky-500 hover:bg-sky-400 text-white"}`}>
            {copied ? "✓" : "Copy"}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[["3","Friends Referred"],["600","Points Earned"],["₹120","Saved"]].map(([v,l]) => (
            <div key={l} className="bg-slate-700/50 rounded-xl p-3">
              <p className="text-white font-black text-lg">{v}</p>
              <p className="text-slate-400 text-[10px] mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How to earn */}
      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5 space-y-3">
        <h3 className="text-white font-bold">How to Earn Points</h3>
        {[["🚗","Complete a Booking","+50 pts"],["⭐","Leave a Review","+20 pts"],["👥","Refer a Friend","+200 pts"],["🎂","Birthday Bonus","+100 pts"],["📅","7-Day Streak","+150 pts"]].map(([ico,act,pts]) => (
          <div key={act} className="flex items-center gap-3">
            <span className="text-xl w-8">{ico}</span>
            <span className="text-slate-300 text-sm flex-1">{act}</span>
            <span className="text-sky-400 font-bold text-sm">{pts}</span>
          </div>
        ))}
      </div>

      {/* Points history */}
      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-3">Points History</h3>
        <div className="space-y-3">
          {history.map((h,i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${h.pts.startsWith("+") ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>{h.pts.startsWith("+")?"+":"-"}</div>
              <div className="flex-1"><p className="text-white text-sm">{h.desc}</p><p className="text-slate-500 text-xs">{h.date}</p></div>
              <span className={`font-bold text-sm ${h.pts.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{h.pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── SUPPORT / HELP CENTER PAGE ───────────────────────────────────────────────
const SupportPage = () => {
  const [ticket, setTicket]     = useState({ subject:"", desc:"", type:"general" });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq]   = useState(null);

  const faqs = [
    { q:"How do I cancel a booking?", a:"Go to My Bookings → select the upcoming booking → tap Cancel. Cancellations 24h before pickup are fully refunded." },
    { q:"What if the vehicle breaks down?", a:"Immediately call our SOS number 1800-123-456. We'll arrange a replacement within 2 hours or issue a full refund." },
    { q:"How is the security deposit handled?", a:"A deposit of ₹500–₹2000 is held at booking and released within 3 business days after the vehicle is returned safely." },
    { q:"Can I extend my booking?", a:"Yes! Go to My Bookings → Upcoming → Extend. Subject to vehicle availability." },
    { q:"What documents do I need?", a:"A valid Driving License and one government ID (Aadhaar/Passport). Upload them in Profile → Document Vault." },
    { q:"Is insurance included?", a:"Basic third-party insurance is included. Comprehensive coverage can be added during booking for ₹99/day." },
  ];

  return (
    <div className="space-y-5">
      {/* Quick contact */}
      <div className="grid grid-cols-3 gap-3">
        {[["📞","Call Us","1800-123-456"],["💬","Live Chat","Available 24/7"],["📧","Email","help@vrentaluk.in"]].map(([ico,label,val]) => (
          <div key={label} className="bg-slate-800/70 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-2">{ico}</p>
            <p className="text-white font-semibold text-xs">{label}</p>
            <p className="text-slate-500 text-[10px] mt-0.5">{val}</p>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div className="bg-slate-800/70 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-bold">Frequently Asked Questions</h3>
        </div>
        {faqs.map((f,i) => (
          <div key={i} className="border-b border-white/5 last:border-0">
            <button onClick={() => setOpenFaq(openFaq===i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
              <span className="text-white text-sm font-medium pr-4">{f.q}</span>
              <span className="text-slate-400 flex-shrink-0">{openFaq===i ? "▲" : "▼"}</span>
            </button>
            {openFaq===i && <p className="text-slate-400 text-sm px-4 pb-4 leading-relaxed">{f.a}</p>}
          </div>
        ))}
      </div>

      {/* Raise ticket */}
      <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-5 space-y-4">
        <h3 className="text-white font-bold">Raise a Support Ticket</h3>
        {submitted ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-4xl">✅</p>
            <p className="text-white font-bold">Ticket Submitted!</p>
            <p className="text-slate-400 text-sm">Our team will respond within 2–4 hours.</p>
            <p className="text-sky-400 text-xs font-mono">Ticket #TK{Math.floor(Math.random()*9000+1000)}</p>
            <button onClick={() => setSubmitted(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Raise another</button>
          </div>
        ) : (
          <>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Issue Type</label>
              <select value={ticket.type} onChange={e => setTicket({...ticket, type:e.target.value})}
                className="w-full bg-slate-700 border border-white/10 text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-500/60">
                {[["general","General Inquiry"],["booking","Booking Issue"],["payment","Payment Problem"],["vehicle","Vehicle Complaint"],["refund","Refund Request"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Subject</label>
              <input value={ticket.subject} onChange={e => setTicket({...ticket, subject:e.target.value})} placeholder="Brief subject..."
                className="w-full bg-slate-700 border border-white/10 text-white placeholder-slate-500 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-500/60" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Description</label>
              <textarea value={ticket.desc} onChange={e => setTicket({...ticket, desc:e.target.value})} placeholder="Describe your issue in detail..." rows={4}
                className="w-full bg-slate-700 border border-white/10 text-white placeholder-slate-500 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-500/60 resize-none" />
            </div>
            <button onClick={() => { if(ticket.subject && ticket.desc) setSubmitted(true); }}
              disabled={!ticket.subject || !ticket.desc}
              className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors">
              Submit Ticket
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ── DOCUMENT VAULT PAGE ──────────────────────────────────────────────────────
const DocumentVaultPage = () => {
  const [docs, setDocs] = useState([
    { id:1, name:"Driving License", icon:"🪪", status:"verified",  expiry:"2030-06-15", size:"1.2 MB" },
    { id:2, name:"Aadhaar Card",    icon:"📋", status:"verified",  expiry:"N/A",        size:"0.8 MB" },
    { id:3, name:"Passport",        icon:"📘", status:"pending",   expiry:"2028-03-22", size:"2.1 MB" },
    { id:4, name:"Vehicle Insurance",icon:"🛡️",status:"not_added", expiry:null,         size:null     },
  ]);
  const statusInfo = {
    verified:  { label:"Verified",   color:"text-emerald-400 bg-emerald-500/20 border-emerald-500/30" },
    pending:   { label:"Under Review",color:"text-yellow-400 bg-yellow-500/20 border-yellow-500/30"   },
    not_added: { label:"Not Added",   color:"text-slate-400 bg-slate-700/50 border-slate-600/30"       },
  };

  return (
    <div className="space-y-5">
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex gap-3 items-start">
        <ShieldIcon />
        <div>
          <p className="text-orange-400 font-semibold text-sm">Your documents are encrypted</p>
          <p className="text-slate-400 text-xs mt-0.5">Stored securely with AES-256 encryption. Only used for verification.</p>
        </div>
      </div>

      {docs.map(doc => {
        const s = statusInfo[doc.status];
        return (
          <div key={doc.id} className="bg-slate-800/70 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <span className="text-3xl">{doc.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">{doc.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.color}`}>{s.label}</span>
                {doc.expiry && doc.expiry !== "N/A" && <span className="text-slate-500 text-xs">Exp: {doc.expiry}</span>}
                {doc.size && <span className="text-slate-600 text-xs">{doc.size}</span>}
              </div>
            </div>
            <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0
              ${doc.status === "not_added" ? "bg-orange-500 hover:bg-orange-400 text-white" : "border border-white/20 text-slate-300 hover:border-white/40"}`}>
              {doc.status === "not_added" ? "Upload" : "View"}
            </button>
          </div>
        );
      })}

      <button className="w-full py-3 border-2 border-dashed border-white/20 hover:border-sky-500/40 text-slate-400 hover:text-sky-400 text-sm font-semibold rounded-2xl transition-all flex items-center justify-center gap-2">
        <UploadIcon /> Upload New Document
      </button>
    </div>
  );
};

// ── LANGUAGE PAGE ────────────────────────────────────────────────────────────
const LanguagePage = () => {
  const [selected, setSelected] = useState("en");
  const languages = [
    { code:"en", name:"English",    native:"English",    flag:"🇬🇧" },
    { code:"hi", name:"Hindi",      native:"हिंदी",      flag:"🇮🇳" },
    { code:"pa", name:"Punjabi",    native:"ਪੰਜਾਬੀ",     flag:"🇮🇳" },
    { code:"mr", name:"Marathi",    native:"मराठी",      flag:"🇮🇳" },
    { code:"gu", name:"Gujarati",   native:"ગુજરાતી",    flag:"🇮🇳" },
    { code:"ta", name:"Tamil",      native:"தமிழ்",      flag:"🇮🇳" },
  ];
  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">Choose your preferred language for the app interface.</p>
      <div className="space-y-2">
        {languages.map(l => (
          <button key={l.code} onClick={() => setSelected(l.code)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left
              ${selected===l.code ? "bg-orange-500/10 border-orange-500/40" : "bg-slate-800/70 border-white/10 hover:border-white/20"}`}>
            <span className="text-2xl">{l.flag}</span>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${selected===l.code ? "text-orange-400" : "text-white"}`}>{l.name}</p>
              <p className="text-slate-400 text-xs">{l.native}</p>
            </div>
            {selected===l.code && <span className="text-orange-400">✓</span>}
          </button>
        ))}
      </div>
      <button className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-sm transition-colors">
        Apply Language
      </button>
    </div>
  );
};

// ── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function VehicleBookingDashboard({ onLogout, currentUser = { name: "User", email: "" } }) {
  const [localUser, setLocalUser] = useState(currentUser);
  // ── CSV data ────────────────────────────────────────────────────────────────
  const [csvData, setCsvData]             = useState({ vehicles: [], bookings: [], promotions: [] });
  const [csvLoading, setCsvLoading]       = useState(true);

  useEffect(() => {
    loadAllData()
      .then(data => { setCsvData(data); setCsvLoading(false); })
      .catch(err => { console.error("CSV load error:", err); setCsvLoading(false); });
  }, []);

  // Derived slices used throughout the component
  const vehicles   = csvData.vehicles;
  const csvBookings = csvData.bookings.filter(b =>
    currentUser?.email && b.user &&
    (b.user.toLowerCase() === (currentUser.name || "").toLowerCase() ||
     b.userId === currentUser.id)
  );

  const [page, setPage]                   = useState("home");
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [wishlist, setWishlist]           = useState([]);
  const [licenseVerified, setLicenseVerified] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [darkMode, setDarkMode]           = useState(true);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unreadNotifs                      = notifications.filter(n => !n.read).length;

  const toggleWishlist = id => setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  const navigate = p => { setPage(p); setSidebarOpen(false); };

  const navItems = [
    { id:"home",          label:"Home",            icon:<HomeIcon /> },
    { id:"search",        label:"Search",           icon:<SearchIcon /> },
    { id:"tracker",       label:"Active Ride",      icon:<ClockIcon />,    badge: 1 },
    { id:"bookings",      label:"My Bookings",      icon:<BookingsIcon /> },
    { id:"receipts",      label:"Receipts",         icon:<ReceiptIcon /> },
    { id:"ratings",       label:"Rate & Review",    icon:<StarIcon filled={false} /> },
    { id:"wishlist",      label:"Wishlist",          icon:<HeartIcon filled={false} />, badge: wishlist.length },
    { id:"wallet",        label:"Wallet",            icon:<WalletIcon /> },
    { id:"loyalty",       label:"Loyalty & Rewards", icon:<GiftIcon /> },
    { id:"notifications", label:"Notifications",    icon:<BellIcon />, badge: unreadNotifs },
    { id:"documents",     label:"Document Vault",   icon:<ShieldIcon /> },
    { id:"support",       label:"Help & Support",   icon:<HelpIcon /> },
    { id:"language",      label:"Language",          icon:<GlobeIcon /> },
    { id:"profile",       label:"Profile",           icon:<UserIcon /> },
    { id:"settings",      label:"Settings",          icon:<SettingsIcon /> },
  ];

  const pageTitle = navItems.find(n => n.id === page)?.label || (page === "details" ? "Vehicle Details" : page === "booking" ? "Book Vehicle" : "");

  const renderPage = () => {
    switch(page) {
      case "home":          return <HomePage setPage={navigate} setSelectedVehicle={setSelectedVehicle} vehicles={vehicles} />;
      case "search":        return <SearchPage wishlist={wishlist} toggleWishlist={toggleWishlist} setPage={navigate} setSelectedVehicle={setSelectedVehicle} vehicles={vehicles} />;
      case "details":       return <VehicleDetailsPage vehicle={selectedVehicle} inWishlist={selectedVehicle && wishlist.includes(selectedVehicle.id)} toggleWishlist={toggleWishlist} setPage={navigate} />;
      case "booking":       return <BookingPage vehicle={selectedVehicle} licenseVerified={licenseVerified} setPage={navigate} />;
      case "tracker":       return <RideTrackerPage />;
      case "bookings":      return <MyBookingsPage csvBookings={csvBookings} />;
      case "receipts":      return <ReceiptsPage />;
      case "ratings":       return <RatingsPage csvBookings={csvBookings} />;
      case "wishlist":      return <WishlistPage wishlist={wishlist} toggleWishlist={toggleWishlist} setPage={navigate} setSelectedVehicle={setSelectedVehicle} vehicles={vehicles} />;
      case "wallet":        return <WalletPage />;
      case "loyalty":       return <LoyaltyPage currentUser={currentUser} />;
      case "notifications": return <NotificationsPage notes={notifications} setNotes={setNotifications} />;
      case "documents":     return <DocumentVaultPage />;
      case "support":       return <SupportPage />;
      case "language":      return <LanguagePage />;
      case "profile":       return <ProfilePage licenseVerified={licenseVerified} setLicenseVerified={setLicenseVerified} currentUser={localUser} onUpdateUser={u => setLocalUser(prev => ({...prev, ...u}))} />;
      case "settings":      return <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />;
      default:              return null;
    }
  };

  if (csvLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center flex-col gap-4">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 text-sm">Loading vehicle data…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}</style>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-40 flex flex-col backdrop-blur-xl transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white font-black text-sm">R</div>
            <div>
              <p className="text-slate-900 font-black text-base leading-none">RideHive</p>
              <p className="text-slate-500 text-xs">Vehicle Rentals</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative
                ${page === item.id ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              <span className={page === item.id ? "text-orange-400" : "text-slate-500"}>{item.icon}</span>
              {item.label}
              {item.badge > 0 && <span className="ml-auto bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white font-black text-xs">{currentUser.name?.[0]?.toUpperCase() || "U"}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{currentUser.name}</p>
              <p className="text-slate-500 text-xs">Premium Member</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
            <LogoutIcon /> Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-64 min-h-screen flex flex-col w-full">
        <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-slate-400 hover:text-white transition-colors p-1">
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          {(page === "details" || page === "booking") && (
            <button onClick={() => setPage(page === "booking" ? "details" : "search")} className="text-slate-400 hover:text-white transition-colors p-1">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </button>
          )}
          <h1 className="text-white font-black text-lg flex-1">{pageTitle}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("notifications")} className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <BellIcon />
              {unreadNotifs > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />}
            </button>
            <button onClick={() => navigate("profile")} className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white font-black text-xs">{currentUser.name?.[0]?.toUpperCase() || "U"}</button>
          </div>
        </header>
        <main className="flex-1 p-4 max-w-2xl mx-auto w-full pb-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
