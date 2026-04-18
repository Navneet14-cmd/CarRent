import { useState, useRef, useEffect } from "react";
import { loadAllData } from "../csvLoader";
// ─── Recharts ───────────────────────────────────────────────────────────────
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const earningsData = {
  daily:   [{d:"Mon",e:1200},{d:"Tue",e:980},{d:"Wed",e:1540},{d:"Thu",e:870},{d:"Fri",e:2100},{d:"Sat",e:2800},{d:"Sun",e:2300}],
  weekly:  [{d:"W1",e:8400},{d:"W2",e:11200},{d:"W3",e:9800},{d:"W4",e:13400}],
  monthly: [{d:"Jan",e:32000},{d:"Feb",e:28000},{d:"Mar",e:41000},{d:"Apr",e:38000},{d:"May",e:45000},{d:"Jun",e:52000}],
};
const demandData = [{day:"Mon",demand:40},{day:"Tue",demand:55},{day:"Wed",demand:48},{day:"Thu",demand:70},{day:"Fri",demand:90},{day:"Sat",demand:100},{day:"Sun",demand:85}];



const bookingRequests = [
  { id:"BR001", user:"Priya Mehta", vehicle:"Royal Enfield Meteor", from:"Apr 10", to:"Apr 12", duration:"2 days", amount:1798, status:"pending", fraud:false, avatar:"P" },
  { id:"BR002", user:"Rahul Singh", vehicle:"Honda Activa 6G", from:"Apr 9", to:"Apr 9", duration:"1 day", amount:499, status:"pending", fraud:true, avatar:"R" },
  { id:"BR003", user:"Ananya Gupta", vehicle:"Tata Nexon EV", from:"Apr 11", to:"Apr 14", duration:"3 days", amount:5697, status:"accepted", fraud:false, avatar:"A" },
  { id:"BR004", user:"Vikram Rao", vehicle:"Maruti Swift", from:"Apr 8", to:"Apr 10", duration:"2 days", amount:2998, status:"rejected", fraud:false, avatar:"V" },
];

const reviews = [
  { id:1, user:"Priya M.", rating:5, comment:"Excellent bike, very well maintained. Owner was super helpful!", vehicle:"Royal Enfield", date:"Apr 3", reply:"" },
  { id:2, user:"Rahul S.", rating:4, comment:"Good scooty. A bit late on pickup time but overall fine.", vehicle:"Honda Activa", date:"Mar 28", reply:"Thank you Rahul!" },
  { id:3, user:"Ananya G.", rating:5, comment:"Amazing EV experience. Totally recommend Tata Nexon!", vehicle:"Tata Nexon EV", date:"Mar 20", reply:"" },
];

const notifications = [
  { id:1, type:"booking", msg:"New booking request from Priya Mehta for Royal Enfield", time:"2h ago", read:false },
  { id:2, type:"payment", msg:"Payment of ₹5,697 received for booking BR003", time:"5h ago", read:false },
  { id:3, type:"demand", msg:"🔥 High demand expected this weekend in Dehradun", time:"1d ago", read:true },
  { id:4, type:"fraud", msg:"⚠️ Suspicious booking detected from Rahul Singh", time:"2d ago", read:true },
];

const transactions = [
  { id:"TXN001", booking:"BR003", user:"Ananya G.", amount:5697, tax:1026, net:4671, date:"Apr 8", status:"received" },
  { id:"TXN002", booking:"BR004", user:"Vikram R.", amount:2998, tax:540, net:2458, date:"Apr 6", status:"received" },
  { id:"TXN003", booking:"BR001", user:"Priya M.", amount:1798, tax:324, net:1474, date:"Mar 30", status:"pending" },
];

const maintenanceLogs = [
  { vehicle:"Royal Enfield Meteor", date:"Mar 15", type:"Oil Change", cost:800, notes:"Synthetic oil, 5W-30" },
  { vehicle:"Honda Activa", date:"Mar 10", type:"Tyre Check", cost:300, notes:"Front tyre pressure corrected" },
  { vehicle:"Tata Nexon EV", date:"Feb 28", type:"Service", cost:3500, notes:"Full service + battery check" },
];

// ─── ICON COMPONENTS ─────────────────────────────────────────────────────────
const I = ({ d, s=18, cls="" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={cls}>
    <path d={d}/>
  </svg>
);
const DashIcon   = () => <I d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>;
const CarIcon    = () => <I d="M5 17H3v-5l2-5h14l2 5v5h-2M5 17a2 2 0 104 0M15 17a2 2 0 104 0M5 12h14"/>;
const PlusIcon   = () => <I d="M12 5v14M5 12h14"/>;
const CalIcon    = () => <I d="M8 2v4M16 2v4M3 10h18M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>;
const BookIcon   = () => <I d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>;
const CashIcon   = () => <I d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/>;
const TagIcon    = () => <I d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01"/>;
const StarIcon   = () => <I d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>;
const BellIcon   = () => <I d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>;
const UserIcon   = () => <I d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>;
const GearIcon   = () => <I d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>;
const HelpIcon   = () => <I d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>;
const LogoutIcon = () => <I d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>;
const EditIcon   = () => <I d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>;
const TrashIcon  = () => <I d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>;
const ChatIcon   = () => <I d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>;
const CheckIcon  = () => <I d="M20 6L9 17l-5-5"/>;
const XIcon      = () => <I d="M18 6L6 18M6 6l12 12"/>;
const UploadIcon = () => <I d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>;
const TrendIcon  = () => <I d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6"/>;
const WrenchIcon = () => <I d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>;
const BotIcon    = () => <I d="M12 2a2 2 0 012 2v2h4a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4V4a2 2 0 012-2zM8 13h2M14 13h2M10 17h4"/>;
const MapIcon    = () => <I d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 10a1 1 0 100-2 1 1 0 000 2z"/>;
const DownloadIcon=()=> <I d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>;
const MenuIcon   = () => <I d="M3 6h18M3 12h18M3 18h18"/>;

// ─── STARS ───────────────────────────────────────────────────────────────────
const Stars = ({ r, size=13 }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i=>(
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i<=Math.round(r)?"#0ea5e9":"none"} stroke="#0ea5e9" strokeWidth={2}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </div>
);

// ─── CARD ─────────────────────────────────────────────────────────────────────
const Card = ({ children, cls="" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${cls}`}>{children}</div>
);

// ─── BADGE ───────────────────────────────────────────────────────────────────
const Badge = ({ label, color="sky" }) => {
  const map = { sky:"bg-sky-100 text-sky-700", green:"bg-emerald-100 text-emerald-700", amber:"bg-amber-100 text-amber-700", red:"bg-red-100 text-red-700", slate:"bg-slate-100 text-slate-500" };
  return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${map[color]||map.slate}`}>{label}</span>;
};

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
const StatusBadge = ({ s }) => {
  const map = { active:["green","Active"], inactive:["slate","Inactive"], pending:["amber","Pending"], accepted:["green","Accepted"], rejected:["red","Rejected"] };
  const [c, l] = map[s]||["slate", s];
  return <Badge label={l} color={c}/>;
};

// ─── TOGGLE ──────────────────────────────────────────────────────────────────
const Toggle = ({ on, onToggle }) => (
  <button onClick={onToggle} className={`w-11 h-6 rounded-full transition-all relative ${on?"bg-sky-500":"bg-slate-200"}`}>
    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${on?"left-6":"left-1"}`}/>
  </button>
);

const EyeOpenIcon  = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeCloseIcon = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/></svg>;
const PwInput = ({ placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus-within:border-sky-400 transition-colors">
      <input type={show ? "text" : "password"} placeholder={placeholder} className="flex-1 bg-transparent text-slate-700 placeholder-slate-400 focus:outline-none text-sm" />
      <button type="button" onClick={() => setShow(v => !v)} className="text-slate-400 hover:text-slate-600 flex-shrink-0 transition-colors">
        {show ? <EyeCloseIcon /> : <EyeOpenIcon />}
      </button>
    </div>
  );
};

// ─── SECTION TITLE ───────────────────────────────────────────────────────────
const SectionTitle = ({ title, sub, action }) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-slate-800 font-black text-xl">{title}</h2>
      {sub && <p className="text-slate-400 text-sm mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

// ─── AI ASSISTANT (floating) ─────────────────────────────────────────────────
const AIAssistant = ({ ownerName }) => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { from:"ai", text:`Hi ${ownerName || "there"}! I'm your AI assistant. Ask me anything about pricing, demand, or listings.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const suggestions = ["Suggest price for Bike", "Demand insights this week", "Best time to list"];

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const q = text.trim();
    setMsgs(m => [...m, { from:"user", text:q }]);
    setInput("");
    setLoading(true);
    setMsgs(m => [...m, { from:"ai", text:"⏳ Thinking..." }]);
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: `You are an AI assistant for a vehicle owner on RideHive, a rental platform in Uttarakhand (Dehradun, Rishikesh, Mussoorie, Haridwar). The owner's name is ${ownerName || "there"}. Help them with pricing their vehicles, understanding demand trends, optimising their listings, managing availability, and maximising earnings. Be friendly, practical, and concise. Use rupee symbol for currency. Keep responses under 4 sentences.` },
            { role: "user", content: q }
          ]
        })
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "I'm having trouble connecting. Please try again!";
      setMsgs(m => [...m.slice(0, -1), { from:"ai", text: reply }]);
    } catch {
      setMsgs(m => [...m.slice(0, -1), { from:"ai", text:"I'm having trouble connecting. Please check your API key and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 flex items-center gap-2">
            <BotIcon/><span className="text-white font-bold text-sm flex-1">AI Assistant</span>
            <button onClick={()=>setOpen(false)} className="text-white/70 hover:text-white"><XIcon/></button>
          </div>
          <div className="h-52 overflow-y-auto p-3 space-y-2">
            {msgs.map((m,i)=>(
              <div key={i} className={`flex ${m.from==="user"?"justify-end":""}`}>
                <div className={`text-xs px-3 py-2 rounded-xl max-w-[85%] leading-relaxed ${m.from==="ai"?"bg-slate-100 text-slate-700":"bg-sky-500 text-white"}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="px-3 pb-2 flex flex-wrap gap-1">
            {suggestions.map(s=>(
              <button key={s} onClick={()=>send(s)} className="text-xs bg-sky-50 text-sky-600 px-2 py-1 rounded-lg hover:bg-sky-100 transition-colors border border-sky-200">{s}</button>
            ))}
          </div>
          <div className="px-3 pb-3 flex gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)} placeholder="Ask anything..." className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-sky-400"/>
            <button onClick={()=>send(input)} disabled={loading} className="bg-sky-500 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-sky-400 transition-colors disabled:opacity-50">{loading ? "..." : "Send"}</button>
          </div>
        </div>
      )}
      <button onClick={()=>setOpen(!open)} className="w-14 h-14 bg-gradient-to-br from-sky-500 to-cyan-400 rounded-2xl shadow-lg flex items-center justify-center text-white hover:scale-105 transition-all">
        <BotIcon/>
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// DASHBOARD
const DashboardPage = ({ setPage, vehicles = [], bookings = [] }) => {
  const [period, setPeriod] = useState("weekly");
  const summaryCards = [
    { label:"Total Vehicles", value:"4", icon:"🚘", delta:"+1 this month", color:"from-sky-500 to-cyan-400" },
    { label:"Active Bookings", value:"3", icon:"📋", delta:"2 pending", color:"from-violet-500 to-purple-400" },
    { label:"Total Earnings", value:"₹1,02,997", icon:"💰", delta:"+12% vs last month", color:"from-emerald-500 to-teal-400" },
    { label:"Avg Rating", value:"4.7 ⭐", icon:"🏆", delta:"Top 10% owners", color:"from-sky-500 to-cyan-400" },
  ];
  return (
    <div className="space-y-6">
      {/* Badges */}
      <div className="flex gap-2">
        <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-xl">🏅 Top Owner</span>
        <span className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-xl">⭐ Highly Rated</span>
        <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl">✅ KYC Verified</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(c => (
          <Card key={c.label} cls="overflow-hidden">
            <div className={`h-1.5 bg-gradient-to-r ${c.color}`}/>
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{c.label}</p>
                <span className="text-xl">{c.icon}</span>
              </div>
              <p className="text-slate-800 font-black text-2xl">{c.value}</p>
              <p className="text-slate-400 text-xs mt-1">{c.delta}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Earnings Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card cls="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-slate-800 font-bold">Earnings Overview</h3><p className="text-slate-400 text-xs">Revenue trend analysis</p></div>
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {["daily","weekly","monthly"].map(p=>(
                <button key={p} onClick={()=>setPeriod(p)} className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${period===p?"bg-white text-sky-600 shadow-sm":"text-slate-500 hover:text-slate-700"}`}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={earningsData[period]}>
              <defs><linearGradient id="eGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="d" tick={{fill:"#94a3b8",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#94a3b8",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v/1000}k`}/>
              <Tooltip formatter={v=>[`₹${v.toLocaleString()}`,"Earnings"]} contentStyle={{borderRadius:"12px",border:"1px solid #e2e8f0",fontSize:12}}/>
              <Area type="monotone" dataKey="e" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#eGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Demand Insights */}
        <Card cls="p-5">
          <h3 className="text-slate-800 font-bold mb-1">Demand Insights</h3>
          <p className="text-slate-400 text-xs mb-4">Peak days this week</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={demandData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="day" tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={v=>[`${v}%`,"Demand"]} contentStyle={{borderRadius:"12px",border:"1px solid #e2e8f0",fontSize:12}}/>
              <Bar dataKey="demand" fill="#0ea5e9" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 bg-sky-50 rounded-xl border border-sky-100">
            <p className="text-sky-700 font-semibold text-xs">📍 Top Location</p>
            <p className="text-sky-600 text-xs mt-0.5">Dehradun · 68% of bookings</p>
          </div>
        </Card>
      </div>

      {/* Top Vehicle + Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card cls="p-5">
          <h3 className="text-slate-800 font-bold mb-4">🏆 Top Performer</h3>
          <div className="flex flex-col items-center text-center bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-5 border border-sky-100">
            <span className="text-5xl mb-3">🏍️</span>
            <p className="text-slate-800 font-black text-sm">Royal Enfield Meteor 350</p>
            <Stars r={4.8} size={14}/>
            <div className="flex gap-3 mt-3 w-full">
              <div className="flex-1 bg-white rounded-xl p-2 shadow-sm"><p className="text-sky-600 font-black text-lg">42</p><p className="text-slate-400 text-xs">Bookings</p></div>
              <div className="flex-1 bg-white rounded-xl p-2 shadow-sm"><p className="text-emerald-600 font-black text-lg">₹37k</p><p className="text-slate-400 text-xs">Earned</p></div>
            </div>
          </div>
        </Card>

        <Card cls="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800 font-bold">Recent Bookings</h3>
            <button onClick={()=>setPage("bookings")} className="text-sky-500 text-xs font-semibold hover:text-sky-600">View all →</button>
          </div>
          <div className="space-y-3">
            {bookingRequests.slice(0,3).map(b=>(
              <div key={b.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white font-black text-sm">{b.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 font-semibold text-sm truncate">{b.user}</p>
                  <p className="text-slate-400 text-xs truncate">{b.vehicle} · {b.from}→{b.to}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-slate-700 font-bold text-sm">₹{b.amount.toLocaleString()}</p>
                  <StatusBadge s={b.status}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card cls="p-5">
        <h3 className="text-slate-800 font-bold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {[["Add Vehicle","add","🚘","sky"],["View Bookings","bookings","📋","violet"],["View Earnings","earnings","💰","emerald"],["Promotions","promotions","🏷️","amber"]].map(([l,p,icon,c])=>(
            <button key={p} onClick={()=>setPage(p)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-${c}-50 text-${c}-700 border border-${c}-200 hover:bg-${c}-100 transition-colors`}>
              {icon} {l}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

// MY VEHICLES
const MyVehiclesPage = ({ vehicles: initVehicles = [] }) => {
  const [vList, setVList] = useState(initVehicles);
  const [selected, setSelected] = useState([]);
  const [filterType, setFilterType] = useState("All");

  const toggleSelect = id => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);
  const toggleAvail = id => setVList(l => l.map(v => v.id===id ? {...v, available:!v.available} : v));
  const toggleInstant = id => setVList(l => l.map(v => v.id===id ? {...v, instantBook:!v.instantBook} : v));
  const deleteVehicle = id => setVList(l => l.filter(v=>v.id!==id));
  const bulkDelete = () => { setVList(l=>l.filter(v=>!selected.includes(v.id))); setSelected([]); };

  const filtered = filterType==="All" ? vList : vList.filter(v=>v.type===filterType);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {["All","Car","Bike","Scooty"].map(t=>(
            <button key={t} onClick={()=>setFilterType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType===t?"bg-white text-sky-600 shadow-sm":"text-slate-500"}`}>{t}</button>
          ))}
        </div>
        {selected.length > 0 && (
          <button onClick={bulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">
            <TrashIcon/> Delete {selected.length} selected
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(v => (
          <Card key={v.id} cls={`p-4 transition-all ${selected.includes(v.id)?"ring-2 ring-sky-400":""}`}>
            <div className="flex gap-4">
              <div className="relative">
                <input type="checkbox" checked={selected.includes(v.id)} onChange={()=>toggleSelect(v.id)} className="absolute top-0 left-0 w-4 h-4 accent-sky-500"/>
                <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center text-4xl border border-slate-200 mt-4">{v.img}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-800 font-bold text-sm truncate">{v.name}</p>
                    <p className="text-slate-400 text-xs">{v.brand} · {v.type} · 📍{v.location}</p>
                  </div>
                  <StatusBadge s={v.status}/>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Stars r={v.rating}/><span className="text-slate-400 text-xs">{v.bookings} trips</span>
                  {v.servicedue && <span className="bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-full font-semibold">🔧 Service Due</span>}
                </div>
                <p className="text-sky-600 font-black text-base mt-1">₹{v.price}<span className="text-slate-400 font-normal text-xs">/day</span></p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    Available <Toggle on={v.available} onToggle={()=>toggleAvail(v.id)}/>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    Instant Book <Toggle on={v.instantBook} onToggle={()=>toggleInstant(v.id)}/>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-50 text-sky-600 rounded-lg text-xs font-semibold border border-sky-200 hover:bg-sky-100 transition-colors"><EditIcon/> Edit</button>
                  <button onClick={()=>deleteVehicle(v.id)} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold border border-red-200 hover:bg-red-100 transition-colors"><TrashIcon/> Delete</button>
                  <button className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-100 transition-colors"><MapIcon/> Track</button>
                  <button className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-100 transition-colors"><WrenchIcon/> History</button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ADD VEHICLE
const AddVehiclePage = ({ vehicles = [] }) => {
  const [type, setType] = useState("Bike");
  const [generating, setGenerating] = useState(false);
  const [desc, setDesc] = useState("");
  const [images, setImages] = useState([]);
  const [aiPrice, setAiPrice] = useState(null);
  const fileRef = useRef(null);

  const generateDesc = () => {
    setGenerating(true);
    setTimeout(() => {
      setDesc("A well-maintained Royal Enfield Meteor 350 perfect for scenic hill rides across Uttarakhand. Smooth engine, comfortable for long trips, fuel-efficient with 35km/l average. Ideal for solo explorers and adventure seekers. Available with helmet and basic toolkit.");
      setGenerating(false);
    }, 1500);
  };

  const suggestPrice = () => {
    const prices = { Car:1499, Bike:899, Scooty:499 };
    setAiPrice(prices[type]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Card cls="p-6 space-y-4">
        <h3 className="text-slate-800 font-bold text-base border-b border-slate-100 pb-3">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">Vehicle Name *</label>
            <input placeholder="e.g. Royal Enfield Meteor 350" className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors"/>
          </div>
          <div>
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">Vehicle Type *</label>
            <select value={type} onChange={e=>setType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400">
              {["Car","Bike","Scooty"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">Brand *</label>
            <input placeholder="e.g. Royal Enfield" className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/>
          </div>
          <div className="col-span-2">
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">Location(s)</label>
            <input placeholder="e.g. Dehradun, Rishikesh" className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/>
          </div>
        </div>
      </Card>

      <Card cls="p-6 space-y-4">
        <h3 className="text-slate-800 font-bold text-base border-b border-slate-100 pb-3">Vehicle Specifications</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">Fuel Type</label>
            <select className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400">
              {["Petrol","Diesel","Electric","CNG"].map(f=><option key={f}>{f}</option>)}
            </select>
          </div>
          {type === "Car" && <>
            <div><label className="text-slate-600 text-xs font-semibold mb-1.5 block">Seats</label><input type="number" defaultValue={5} className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/></div>
            <div><label className="text-slate-600 text-xs font-semibold mb-1.5 block">AC</label><select className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"><option>Yes</option><option>No</option></select></div>
          </>}
          {type === "Bike" && <>
            <div><label className="text-slate-600 text-xs font-semibold mb-1.5 block">Engine CC</label><input type="number" placeholder="350" className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/></div>
            <div><label className="text-slate-600 text-xs font-semibold mb-1.5 block">Mileage (km/l)</label><input type="number" placeholder="35" className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/></div>
          </>}
          {type === "Scooty" && (
            <div><label className="text-slate-600 text-xs font-semibold mb-1.5 block">Mileage (km/l)</label><input type="number" placeholder="55" className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/></div>
          )}
        </div>
      </Card>

      <Card cls="p-6 space-y-4">
        <h3 className="text-slate-800 font-bold text-base border-b border-slate-100 pb-3">Pricing & Booking Rules</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">Price per Day (₹) *</label>
            <div className="relative">
              <input placeholder="e.g. 899" className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400 pr-24"/>
              <button onClick={suggestPrice} className="absolute right-2 top-1.5 bg-sky-500 text-white text-xs px-2 py-1 rounded-lg font-semibold hover:bg-sky-400 transition-colors">AI Suggest</button>
            </div>
            {aiPrice && <p className="text-sky-600 text-xs mt-1">💡 AI suggests ₹{aiPrice}/day based on market data</p>}
          </div>
          <div>
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">Security Deposit (₹)</label>
            <input placeholder="e.g. 2000" className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/>
          </div>
          <div>
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">Min Booking Days</label>
            <input type="number" defaultValue={1} className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/>
          </div>
          <div>
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">Max Booking Days</label>
            <input type="number" defaultValue={30} className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/>
          </div>
        </div>
      </Card>

      <Card cls="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-800 font-bold text-base">Description</h3>
          <button onClick={generateDesc} className="flex items-center gap-1.5 bg-violet-50 text-violet-600 border border-violet-200 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-violet-100 transition-colors">
            <BotIcon/> {generating ? "Generating..." : "AI Generate"}
          </button>
        </div>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4} placeholder="Describe your vehicle..." className="w-full bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors resize-none"/>
      </Card>

      <Card cls="p-6 space-y-3">
        <h3 className="text-slate-800 font-bold text-base">Vehicle Images</h3>
        <div onClick={()=>fileRef.current?.click()} className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-8 text-center cursor-pointer transition-colors">
          <UploadIcon/>
          <p className="text-slate-500 text-sm mt-2">Click to upload images</p>
          <p className="text-slate-400 text-xs mt-1">JPG, PNG · AI quality check enabled · Max 5MB each</p>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e=>setImages([...e.target.files].map(f=>f.name))}/>
        </div>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((img,i)=><span key={i} className="bg-sky-50 text-sky-600 text-xs px-2 py-1 rounded-lg border border-sky-200">📷 {img}</span>)}
          </div>
        )}
      </Card>

      <button className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-black text-base rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-sky-200">
        🚀 List Vehicle
      </button>
    </div>
  );
};

// BOOKING REQUESTS
const BookingRequestsPage = ({ bookingRequests: initReqs = [] }) => {
  const [reqs, setReqs] = useState(initReqs);
  const [chatOpen, setChatOpen] = useState(null);
  const [chatMsgs, setChatMsgs] = useState(["Hi, I'm interested in your vehicle!"]);
  const [chatInput, setChatInput] = useState("");

  const accept = id => setReqs(r=>r.map(b=>b.id===id?{...b,status:"accepted"}:b));
  const reject = id => setReqs(r=>r.map(b=>b.id===id?{...b,status:"rejected"}:b));

  return (
    <div className="space-y-4">
      {reqs.map(b => (
        <Card key={b.id} cls="p-5">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-white font-black text-lg">{b.avatar}</div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-slate-800 font-bold">{b.user}</p>
                  {b.fraud && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">⚠️ Fraud Alert</span>}
                </div>
                <p className="text-slate-500 text-xs">{b.vehicle} · {b.from} → {b.to} · {b.duration}</p>
                <p className="text-sky-600 font-bold text-sm mt-0.5">₹{b.amount.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge s={b.status}/>
              {b.status === "pending" && <>
                <button onClick={()=>accept(b.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors"><CheckIcon/> Accept</button>
                <button onClick={()=>reject(b.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-400 transition-colors"><XIcon/> Reject</button>
              </>}
              <button onClick={()=>setChatOpen(chatOpen===b.id?null:b.id)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors border border-slate-200"><ChatIcon/> Chat</button>
            </div>
          </div>

          {b.status === "accepted" && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-slate-600 text-xs font-semibold mb-2">Ride Photos</p>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-slate-300 rounded-xl text-xs text-slate-500 hover:border-sky-400 hover:text-sky-500 transition-colors"><UploadIcon/> Before Ride</button>
                <button className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-slate-300 rounded-xl text-xs text-slate-500 hover:border-sky-400 hover:text-sky-500 transition-colors"><UploadIcon/> After Ride</button>
              </div>
            </div>
          )}

          {chatOpen === b.id && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 rounded-xl p-3 h-32 overflow-y-auto space-y-2 mb-2">
                {chatMsgs.map((m,i)=>(
                  <div key={i} className={`flex ${i%2===0?"":"justify-end"}`}>
                    <span className={`text-xs px-3 py-1.5 rounded-xl max-w-[80%] ${i%2===0?"bg-white text-slate-700 border border-slate-200":"bg-sky-500 text-white"}`}>{m}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&chatInput.trim()){setChatMsgs(m=>[...m,chatInput]);setChatInput("");}}} placeholder="Type a message..." className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-sky-400"/>
                <button onClick={()=>{if(chatInput.trim()){setChatMsgs(m=>[...m,chatInput]);setChatInput("");}}} className="bg-sky-500 text-white px-3 py-2 rounded-xl text-xs font-bold">Send</button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

// AVAILABILITY CALENDAR
const CalendarPage = ({ bookings = [] }) => {
  const [blocked, setBlocked] = useState([5,6,12,19,20]);
  const [booked] = useState([3,10,11,17]);
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const dates = Array.from({length:30},(_,i)=>i+1);
  const month = "April 2026";

  const toggleBlock = d => {
    if (booked.includes(d)) return;
    setBlocked(b => b.includes(d) ? b.filter(x=>x!==d) : [...b, d]);
  };

  return (
    <div className="space-y-5">
      <Card cls="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-slate-800 font-black text-lg">{month}</h3>
            <p className="text-slate-400 text-xs">Click dates to block/unblock · Blue = Booked</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-500 inline-block"/>Booked</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-300 inline-block"/>Blocked</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block"/>Available</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map(d=><div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(2)].map((_,i)=><div key={`e${i}`}/>)}
          {dates.map(d => (
            <button key={d} onClick={()=>toggleBlock(d)}
              className={`aspect-square rounded-xl text-sm font-semibold transition-all
                ${booked.includes(d)?"bg-sky-500 text-white cursor-default":
                  blocked.includes(d)?"bg-red-200 text-red-700 hover:bg-red-300":
                  "bg-emerald-50 text-slate-700 hover:bg-emerald-100 border border-emerald-200"}`}>
              {d}
            </button>
          ))}
        </div>
      </Card>

      <Card cls="p-5">
        <h3 className="text-slate-800 font-bold mb-3">Blocked Dates Summary</h3>
        <div className="flex flex-wrap gap-2">
          {blocked.map(d=>(
            <span key={d} className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              Apr {d} <button onClick={()=>setBlocked(b=>b.filter(x=>x!==d))} className="hover:text-red-800"><XIcon/></button>
            </span>
          ))}
          {blocked.length===0 && <p className="text-slate-400 text-sm">No dates blocked.</p>}
        </div>
      </Card>
    </div>
  );
};

// EARNINGS
const EarningsPage = ({ transactions = [] }) => {
  const [period, setPeriod] = useState("monthly");
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[["Total Earnings","₹1,02,997","emerald"],["Monthly","₹52,000","sky"],["Pending","₹1,474","amber"]].map(([l,v,c])=>(
          <Card key={l} cls="p-4">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">{l}</p>
            <p className={`text-${c}-600 font-black text-2xl`}>{v}</p>
          </Card>
        ))}
      </div>

      <Card cls="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-800 font-bold">Earnings Graph</h3>
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {["daily","weekly","monthly"].map(p=>(
              <button key={p} onClick={()=>setPeriod(p)} className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${period===p?"bg-white text-sky-600 shadow-sm":"text-slate-500"}`}>{p}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={earningsData[period]}>
            <defs><linearGradient id="eGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
            <XAxis dataKey="d" tick={{fill:"#94a3b8",fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"#94a3b8",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v/1000}k`}/>
            <Tooltip formatter={v=>[`₹${v.toLocaleString()}`,"Earnings"]} contentStyle={{borderRadius:"12px",border:"1px solid #e2e8f0",fontSize:12}}/>
            <Area type="monotone" dataKey="e" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#eGrad2)"/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card cls="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-800 font-bold">Transactions</h3>
          <button className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold hover:bg-emerald-100 transition-colors"><DownloadIcon/> Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-slate-400 font-semibold border-b border-slate-100">
              {["Txn ID","Booking","User","Gross","GST (18%)","Net","Date","Status"].map(h=><th key={h} className="text-left pb-2 pr-3">{h}</th>)}
            </tr></thead>
            <tbody>
              {transactions.map(t=>(
                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 pr-3 text-sky-600 font-semibold text-xs">{t.id}</td>
                  <td className="py-2.5 pr-3 text-slate-600 text-xs">{t.booking}</td>
                  <td className="py-2.5 pr-3 text-slate-700 font-medium text-xs">{t.user}</td>
                  <td className="py-2.5 pr-3 text-slate-700 text-xs">₹{t.amount.toLocaleString()}</td>
                  <td className="py-2.5 pr-3 text-slate-500 text-xs">₹{t.tax}</td>
                  <td className="py-2.5 pr-3 text-emerald-600 font-bold text-xs">₹{t.net.toLocaleString()}</td>
                  <td className="py-2.5 pr-3 text-slate-400 text-xs">{t.date}</td>
                  <td className="py-2.5"><Badge label={t.status} color={t.status==="received"?"green":"amber"}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// PROMOTIONS
const PromotionsPage = () => {
  const [discount, setDiscount] = useState(20);
  const [promos, setPromos] = useState([
    { id:1, code:"WEEKEND20", discount:20, from:"Apr 12", to:"Apr 14", active:true },
    { id:2, code:"GOGREEN15", discount:15, from:"Apr 1", to:"Apr 30", active:false },
  ]);
  const addPromo = () => setPromos(p=>[...p,{id:Date.now(),code:`OFFER${Math.floor(Math.random()*99)}`,discount,from:"Apr 10",to:"Apr 20",active:true}]);

  return (
    <div className="space-y-5">
      <Card cls="p-6 space-y-4">
        <h3 className="text-slate-800 font-bold border-b border-slate-100 pb-3">Create New Offer</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">Coupon Code</label>
            <input placeholder="e.g. SUMMER25" className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/>
          </div>
          <div>
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">Discount: {discount}%</label>
            <input type="range" min={5} max={50} step={5} value={discount} onChange={e=>setDiscount(+e.target.value)} className="w-full accent-sky-500 mt-2"/>
          </div>
          <div>
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">From Date</label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/>
          </div>
          <div>
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">To Date</label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/>
          </div>
        </div>
        <button onClick={addPromo} className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm rounded-xl transition-colors">+ Create Promotion</button>
      </Card>

      <div className="space-y-3">
        {promos.map(p=>(
          <Card key={p.id} cls="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-center text-sky-600 font-black text-lg">{p.discount}%</div>
            <div className="flex-1">
              <p className="text-slate-800 font-bold text-sm">{p.code}</p>
              <p className="text-slate-400 text-xs">{p.from} – {p.to}</p>
            </div>
            <Toggle on={p.active} onToggle={()=>setPromos(pr=>pr.map(x=>x.id===p.id?{...x,active:!x.active}:x))}/>
            <Badge label={p.active?"Active":"Paused"} color={p.active?"green":"slate"}/>
          </Card>
        ))}
      </div>

      <Card cls="p-5 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
        <h3 className="text-violet-800 font-bold mb-2">📦 Subscription Plans</h3>
        <p className="text-violet-600 text-xs mb-3">Offer monthly rental packages to loyal customers</p>
        <div className="grid grid-cols-2 gap-3">
          {[["Basic","₹7,999/mo","Up to 10 bookings"],["Premium","₹14,999/mo","Unlimited bookings"]].map(([plan,price,desc])=>(
            <div key={plan} className="bg-white rounded-xl p-3 border border-violet-100 text-center">
              <p className="text-violet-700 font-bold text-sm">{plan}</p>
              <p className="text-violet-600 font-black text-lg">{price}</p>
              <p className="text-slate-400 text-xs">{desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// REVIEWS
const ReviewsPage = () => {
  const [revs, setRevs] = useState(reviews);
  const [replyInput, setReplyInput] = useState({});

  const submitReply = id => {
    setRevs(r=>r.map(x=>x.id===id?{...x,reply:replyInput[id]||""}:x));
    setReplyInput(i=>({...i,[id]:""}));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-2">
        <Card cls="p-4 text-center"><p className="text-3xl font-black text-sky-600">4.7</p><Stars r={4.7}/><p className="text-slate-400 text-xs mt-1">Avg Rating</p></Card>
        <Card cls="p-4 text-center"><p className="text-3xl font-black text-emerald-600">{revs.length}</p><p className="text-slate-400 text-xs mt-1">Total Reviews</p></Card>
        <Card cls="p-4 text-center"><p className="text-3xl font-black text-amber-600">{revs.filter(r=>r.rating===5).length}</p><p className="text-slate-400 text-xs mt-1">5-Star Reviews</p></Card>
      </div>

      {revs.map(r=>(
        <Card key={r.id} cls="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-black">{r.user[0]}</div>
              <div>
                <p className="text-slate-800 font-bold text-sm">{r.user}</p>
                <p className="text-slate-400 text-xs">{r.vehicle} · {r.date}</p>
              </div>
            </div>
            <Stars r={r.rating}/>
          </div>
          <p className="text-slate-600 text-sm bg-slate-50 rounded-xl p-3 border border-slate-100">"{r.comment}"</p>
          {r.reply ? (
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-3">
              <p className="text-sky-700 text-xs font-semibold mb-1">Your Reply</p>
              <p className="text-slate-600 text-sm">{r.reply}</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={replyInput[r.id]||""} onChange={e=>setReplyInput(i=>({...i,[r.id]:e.target.value}))} placeholder="Write a reply..." className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-sky-400"/>
              <button onClick={()=>submitReply(r.id)} className="bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-sky-400 transition-colors">Reply</button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

// NOTIFICATIONS
const NotificationsPage = ({ notes, setNotes }) => {
  const icon = { booking:"📋", payment:"💰", demand:"📈", fraud:"⚠️" };
  const color = { booking:"sky", payment:"emerald", demand:"amber", fraud:"red" };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 text-sm">{notes.filter(n=>!n.read).length} unread notifications</span>
        <button onClick={()=>setNotes(n=>n.map(x=>({...x,read:true})))} className="text-sky-500 text-xs font-semibold hover:text-sky-600">Mark all read</button>
      </div>
      {notes.map(n=>(
        <Card key={n.id} cls={`p-4 flex gap-3 cursor-pointer transition-all ${!n.read?"border-l-4 border-sky-400":""}`} onClick={()=>setNotes(nn=>nn.map(x=>x.id===n.id?{...x,read:true}:x))}>
          <div className={`w-10 h-10 rounded-xl bg-${color[n.type]}-100 flex items-center justify-center text-lg flex-shrink-0`}>{icon[n.type]}</div>
          <div className="flex-1">
            <p className={`text-sm ${n.read?"text-slate-500":"text-slate-800 font-semibold"}`}>{n.msg}</p>
            <p className="text-slate-400 text-xs mt-0.5">{n.time}</p>
          </div>
          {!n.read && <div className="w-2 h-2 bg-sky-500 rounded-full mt-2 flex-shrink-0"/>}
        </Card>
      ))}
    </div>
  );
};

// PROFILE
const ProfilePage = ({ currentUser, onUpdateUser }) => {
  const [kycStatus, setKycStatus] = useState("pending");
  const [name,  setName]  = useState(currentUser?.name  || "Owner");
  const [email, setEmail] = useState(currentUser?.email || "owner@ridehive.in");
  const [phone, setPhone] = useState(currentUser?.phone || "+91 98765 43210");
  const [city,  setCity]  = useState(currentUser?.city  || "Dehradun");
  const [bizName, setBizName] = useState("Kumar Vehicles Rental");
  const [gst,     setGst]     = useState("09AABCU9603R1ZX");
  const [bank,    setBank]    = useState("XXXX-XXXX-4521");
  const [saved,    setSaved]    = useState(false);
  const [bizSaved, setBizSaved] = useState(false);

  const handleSave = () => { if (onUpdateUser) onUpdateUser({ name, email, phone, city }); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handleBizSave = () => { setBizSaved(true); setTimeout(() => setBizSaved(false), 2000); };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Card cls="p-6">
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-sky-200">{name.charAt(0).toUpperCase()}</div>
          <div>
            <h3 className="text-slate-800 font-black text-xl">{name}</h3>
            <p className="text-slate-400 text-sm">Vehicle Owner · {city}</p>
            <Badge label="✅ Verified Owner" color="green"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[["Full Name", name, setName],["Email", email, setEmail],["Phone", phone, setPhone],["City", city, setCity]].map(([l,v,setter])=>(
            <div key={l}>
              <label className="text-slate-500 text-xs font-semibold mb-1.5 block">{l}</label>
              <input value={v} onChange={e=>setter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/>
            </div>
          ))}
        </div>
        <button onClick={handleSave} className={`mt-4 w-full py-2.5 font-bold text-sm rounded-xl transition-colors ${saved ? "bg-emerald-500 text-white" : "bg-sky-500 hover:bg-sky-400 text-white"}`}>{saved ? "✓ Saved!" : "Save Profile"}</button>
      </Card>

      <Card cls="p-6 space-y-4">
        <h3 className="text-slate-800 font-bold border-b border-slate-100 pb-3">Business Details</h3>
        {[["Business Name", bizName, setBizName],["GST Number", gst, setGst],["Bank Account", bank, setBank]].map(([l,v,setter])=>(
          <div key={l}>
            <label className="text-slate-500 text-xs font-semibold mb-1.5 block">{l}</label>
            <input value={v} onChange={e=>setter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/>
          </div>
        ))}
        <button onClick={handleBizSave} className={`w-full py-2.5 font-bold text-sm rounded-xl transition-colors ${bizSaved ? "bg-emerald-500 text-white" : "bg-sky-500 hover:bg-sky-400 text-white"}`}>{bizSaved ? "✓ Saved!" : "Save Business Details"}</button>
      </Card>

      <Card cls="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-800 font-bold">KYC Verification</h3>
          <Badge label={kycStatus==="verified"?"✅ Verified":"⏳ Pending"} color={kycStatus==="verified"?"green":"amber"}/>
        </div>
        {kycStatus !== "verified" && (
          <>
            <p className="text-slate-500 text-sm">Upload your government-issued ID to verify your account.</p>
            <div className="grid grid-cols-2 gap-3">
              {["Aadhaar Card","PAN Card"].map(doc=>(
                <div key={doc} className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-sky-400 cursor-pointer transition-colors">
                  <UploadIcon/>
                  <p className="text-slate-500 text-xs mt-1">{doc}</p>
                </div>
              ))}
            </div>
            <button onClick={()=>setKycStatus("verified")} className="w-full py-2.5 bg-emerald-500 text-white font-bold text-sm rounded-xl hover:bg-emerald-400 transition-colors">Submit for Verification</button>
          </>
        )}
        {kycStatus==="verified" && <p className="text-emerald-600 text-sm">✓ Your identity has been verified. You're a trusted owner!</p>}
      </Card>
    </div>
  );
};

// SETTINGS
const SettingsPage = () => {
  const [dark, setDark] = useState(false);
  const [notifs, setNotifs] = useState({booking:true,payment:true,demand:true,fraud:true});
  const [autoPricing, setAutoPricing] = useState({ weekend:true, lowDemand:false, weekendIncrease:20, lowDemandDiscount:15 });
  const [cancellation, setCancellation] = useState("24h");

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Card cls="p-6 divide-y divide-slate-100 space-y-0">
        <div className="flex items-center justify-between py-4 first:pt-0">
          <div><p className="text-slate-800 font-semibold text-sm">Dark Mode</p><p className="text-slate-400 text-xs">Switch app appearance</p></div>
          <Toggle on={dark} onToggle={()=>setDark(!dark)}/>
        </div>
        <div className="py-4">
          <p className="text-slate-800 font-semibold text-sm mb-3">Change Password</p>
          <div className="space-y-2">
            {["Current Password","New Password","Confirm Password"].map(p=>(
              <PwInput key={p} placeholder={p} />
            ))}
            <button className="w-full py-2.5 bg-sky-500 text-white font-bold text-sm rounded-xl hover:bg-sky-400 transition-colors">Update Password</button>
          </div>
        </div>
      </Card>

      <Card cls="p-6 space-y-4">
        <h3 className="text-slate-800 font-bold border-b border-slate-100 pb-3">Notification Preferences</h3>
        {[["booking","New Booking Requests"],["payment","Payment Received"],["demand","Demand Alerts"],["fraud","Fraud Alerts"]].map(([k,l])=>(
          <div key={k} className="flex items-center justify-between">
            <p className="text-slate-700 text-sm">{l}</p>
            <Toggle on={notifs[k]} onToggle={()=>setNotifs(n=>({...n,[k]:!n[k]}))}/>
          </div>
        ))}
      </Card>

      <Card cls="p-6 space-y-4">
        <h3 className="text-slate-800 font-bold border-b border-slate-100 pb-3">Auto Pricing Rules</h3>
        <div className="flex items-center justify-between">
          <div><p className="text-slate-700 text-sm">Weekend Price Increase</p><p className="text-slate-400 text-xs">Automatically raise rates on Fri–Sun</p></div>
          <Toggle on={autoPricing.weekend} onToggle={()=>setAutoPricing(p=>({...p,weekend:!p.weekend}))}/>
        </div>
        {autoPricing.weekend && (
          <div>
            <label className="text-slate-500 text-xs font-semibold mb-1 block">Increase by: {autoPricing.weekendIncrease}%</label>
            <input type="range" min={5} max={50} step={5} value={autoPricing.weekendIncrease} onChange={e=>setAutoPricing(p=>({...p,weekendIncrease:+e.target.value}))} className="w-full accent-sky-500"/>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div><p className="text-slate-700 text-sm">Low Demand Discount</p><p className="text-slate-400 text-xs">Auto-discount on slow days</p></div>
          <Toggle on={autoPricing.lowDemand} onToggle={()=>setAutoPricing(p=>({...p,lowDemand:!p.lowDemand}))}/>
        </div>
      </Card>

      <Card cls="p-6 space-y-3">
        <h3 className="text-slate-800 font-bold border-b border-slate-100 pb-3">Cancellation Policy</h3>
        <div className="grid grid-cols-3 gap-2">
          {[["flexible","Flexible"],["24h","24 Hours"],["strict","Strict"]].map(([v,l])=>(
            <button key={v} onClick={()=>setCancellation(v)} className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${cancellation===v?"bg-sky-500 border-sky-500 text-white":"border-slate-200 text-slate-600 hover:border-sky-300"}`}>{l}</button>
          ))}
        </div>
        <p className="text-slate-400 text-xs">
          {cancellation==="flexible"?"Full refund 24h before pickup":""}
          {cancellation==="24h"?"50% refund if cancelled within 24h":""}
          {cancellation==="strict"?"No refund within 48h of pickup":""}
        </p>
      </Card>
    </div>
  );
};

// MAINTENANCE
const MaintenancePage = ({ vehicles = [] }) => {
  const [logs, setLogs] = useState(maintenanceLogs);
  const [form, setForm] = useState({vehicle:"",type:"",cost:"",notes:""});

  const addLog = () => {
    if (!form.vehicle || !form.type) return;
    setLogs(l=>[{...form,date:"Apr 7"},... l]);
    setForm({vehicle:"",type:"",cost:"",notes:""});
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-2">
        <Card cls="p-4 border-l-4 border-amber-400">
          <p className="text-amber-600 font-bold text-sm">⚠️ Service Due</p>
          <p className="text-slate-700 text-sm mt-1">Honda Activa 6G</p>
          <p className="text-slate-400 text-xs">Next service: Apr 15</p>
        </Card>
        <Card cls="p-4 border-l-4 border-sky-400">
          <p className="text-sky-600 font-bold text-sm">🔧 Last Service</p>
          <p className="text-slate-700 text-sm mt-1">Tata Nexon EV</p>
          <p className="text-slate-400 text-xs">Feb 28 · Full Service</p>
        </Card>
        <Card cls="p-4 border-l-4 border-emerald-400">
          <p className="text-emerald-600 font-bold text-sm">✅ All Good</p>
          <p className="text-slate-700 text-sm mt-1">Royal Enfield</p>
          <p className="text-slate-400 text-xs">No upcoming service</p>
        </Card>
      </div>

      <Card cls="p-5 space-y-4">
        <h3 className="text-slate-800 font-bold">Add Repair / Service Log</h3>
        <div className="grid grid-cols-2 gap-3">
          <select value={form.vehicle} onChange={e=>setForm(f=>({...f,vehicle:e.target.value}))} className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400">
            <option value="">Select Vehicle</option>
            {vehicles.slice(0,20).map(v=><option key={v.id}>{v.name}</option>)}
          </select>
          <input value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} placeholder="Service Type (e.g. Oil Change)" className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/>
          <input value={form.cost} onChange={e=>setForm(f=>({...f,cost:e.target.value}))} type="number" placeholder="Cost (₹)" className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/>
          <input value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Notes" className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/>
        </div>
        <button onClick={addLog} className="w-full py-2.5 bg-sky-500 text-white font-bold text-sm rounded-xl hover:bg-sky-400 transition-colors">+ Add Log</button>
      </Card>

      <Card cls="p-5">
        <h3 className="text-slate-800 font-bold mb-4">Service History</h3>
        <div className="space-y-3">
          {logs.map((l,i)=>(
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><WrenchIcon/></div>
              <div className="flex-1">
                <p className="text-slate-700 font-semibold text-sm">{l.vehicle}</p>
                <p className="text-slate-400 text-xs">{l.type}{l.notes ? ` · ${l.notes}`:""}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-700 font-bold text-sm">₹{l.cost}</p>
                <p className="text-slate-400 text-xs">{l.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ANALYTICS
const AnalyticsPage = ({ vehicles = [] }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      {[["Most Booked","Royal Enfield Meteor","42 trips · ₹37k earned","🏍️","sky"],["Least Performing","Honda Activa 6G","31 trips · Needs promotion","🛵","amber"]].map(([t,v,d,i,c])=>(
        <Card key={t} cls="p-5">
          <p className={`text-${c}-600 text-xs font-semibold uppercase tracking-wide mb-3`}>{t}</p>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{i}</span>
            <div>
              <p className="text-slate-800 font-bold text-sm">{v}</p>
              <p className="text-slate-400 text-xs mt-0.5">{d}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
    <Card cls="p-5">
      <h3 className="text-slate-800 font-bold mb-4">Vehicle Performance Comparison</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={vehicles.slice(0,8).map(v=>({name:v.name.split(" ").slice(0,2).join(" "),bookings:v.bookings||0,earnings:Math.round((v.price||0)*((v.bookings||0)/10)/1000)}))}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
          <XAxis dataKey="name" tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false}/>
          <Tooltip contentStyle={{borderRadius:"12px",border:"1px solid #e2e8f0",fontSize:12}}/>
          <Bar dataKey="bookings" name="Bookings" fill="#0ea5e9" radius={[6,6,0,0]}/>
          <Bar dataKey="earnings" name="Earnings (₹k)" fill="#10b981" radius={[6,6,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </Card>
    <Card cls="p-5">
      <h3 className="text-slate-800 font-bold mb-4">Booking Trend (6 months)</h3>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={earningsData.monthly.map((e,i)=>({...e,bookings:[8,7,12,10,14,18][i]}))}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
          <XAxis dataKey="d" tick={{fill:"#94a3b8",fontSize:11}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:"#94a3b8",fontSize:11}} axisLine={false} tickLine={false}/>
          <Tooltip contentStyle={{borderRadius:"12px",border:"1px solid #e2e8f0",fontSize:12}}/>
          <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={2.5} dot={{fill:"#8b5cf6",r:4}}/>
        </LineChart>
      </ResponsiveContainer>
    </Card>
  </div>
);

// SUPPORT
const SupportPage = () => {
  const [issue, setIssue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="max-w-xl mx-auto space-y-5">
      <Card cls="p-6 bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100">
        <h3 className="text-sky-800 font-bold text-lg mb-1">Need Help?</h3>
        <p className="text-sky-600 text-sm">Our support team is available Mon–Sat, 9 AM – 7 PM</p>
        <div className="flex gap-3 mt-3">
          <button className="flex items-center gap-1.5 bg-sky-500 text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-sky-400 transition-colors">📞 Call Support</button>
          <button className="flex items-center gap-1.5 bg-white text-sky-600 text-sm px-4 py-2 rounded-xl font-semibold border border-sky-200 hover:bg-sky-50 transition-colors">💬 Live Chat</button>
        </div>
      </Card>

      <Card cls="p-6 space-y-4">
        <h3 className="text-slate-800 font-bold">Report an Issue</h3>
        {submitted ? (
          <div className="text-center py-6">
            <p className="text-5xl">✅</p>
            <p className="text-emerald-600 font-bold mt-2">Issue Reported!</p>
            <p className="text-slate-400 text-sm">We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <>
            <select className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400">
              <option>Select issue type</option>
              <option>Booking dispute</option>
              <option>Payment issue</option>
              <option>Vehicle damage</option>
              <option>Technical problem</option>
              <option>Other</option>
            </select>
            <textarea value={issue} onChange={e=>setIssue(e.target.value)} rows={4} placeholder="Describe the issue in detail..." className="w-full bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400 resize-none"/>
            <button onClick={()=>setSubmitted(true)} className="w-full py-3 bg-red-500 hover:bg-red-400 text-white font-bold text-sm rounded-xl transition-colors">🚨 Submit Report</button>
          </>
        )}
      </Card>

      <Card cls="p-5 space-y-3">
        <h3 className="text-slate-800 font-bold">FAQs</h3>
        {[["How do I add a new vehicle?","Go to Add Vehicle in the sidebar and fill the form."],["When do I receive payments?","Payments are credited within 2 business days after ride completion."],["How does AI pricing work?","AI suggests prices based on demand, location, and vehicle type."]].map(([q,a])=>(
          <div key={q} className="border border-slate-100 rounded-xl p-3">
            <p className="text-slate-700 font-semibold text-sm">{q}</p>
            <p className="text-slate-400 text-xs mt-1">{a}</p>
          </div>
        ))}
      </Card>
    </div>
  );
};
const GalleryPage = ({ vehicles = [] }) => {
  const [photos, setPhotos] = useState({});
  return (
    <div className="space-y-6">
      {vehicles.slice(0,20).map(v => (
        <Card key={v.id} cls="p-5">
          <h3 className="font-bold text-slate-800 mb-3">{v.img} {v.name}</h3>
          <div className="flex flex-wrap gap-3">
            <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-sky-400 text-slate-400 hover:text-sky-500 transition-all">
              <UploadIcon/>
              <span className="text-xs mt-1">Add Photo</span>
              <input type="file" accept="image/*" className="hidden"/>
            </label>
          </div>
        </Card>
      ))}
    </div>
  );
};

const HandoverPage = ({ vehicles = [] }) => {
  const checks = ["Fuel level noted","Odometer reading taken","Exterior photos clicked","Keys handed over","Documents verified","Helmet provided","Insurance copy shared"];
  const [done, setDone] = useState([]);
  const toggle = (c) => setDone(d => d.includes(c) ? d.filter(x=>x!==c) : [...d,c]);
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Card cls="p-5">
        <h3 className="font-bold text-slate-800 mb-4">Pickup Checklist</h3>
        <div className="space-y-3">
          {checks.map(c => (
            <div key={c} onClick={() => toggle(c)} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50">
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${done.includes(c) ? "bg-sky-500 border-sky-500" : "border-slate-300"}`}>
                {done.includes(c) && <CheckIcon/>}
              </div>
              <span className={`text-sm ${done.includes(c) ? "line-through text-slate-400" : "text-slate-700"}`}>{c}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">{done.length}/{checks.length} completed</p>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
            <div className="bg-sky-500 h-2 rounded-full transition-all" style={{width:`${(done.length/checks.length)*100}%`}}/>
          </div>
        </div>
      </Card>
    </div>
  );
};

const FuelLogPage = ({ vehicles = [] }) => {
  const [logs, setLogs] = useState([
    {vehicle:"Royal Enfield Meteor", fuel:"Full", odo:"12,450 km", date:"Apr 10", trip:"BR001"},
    {vehicle:"Tata Nexon EV", fuel:"80%", odo:"8,230 km", date:"Apr 8", trip:"BR003"},
  ]);
  return (
    <div className="space-y-4">
      <Card cls="p-5">
        <h3 className="font-bold text-slate-800 mb-4">Fuel & Odometer Log</h3>
        <div className="space-y-3">
          {logs.map((l,i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{l.vehicle}</p>
                <p className="text-xs text-slate-400">{l.date} · Trip {l.trip}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Fuel</p>
                <p className="text-sm font-bold text-sky-600">{l.fuel}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Odometer</p>
                <p className="text-sm font-bold text-slate-700">{l.odo}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const BlacklistPage = () => {
  const [blocked, setBlocked] = useState([
    {name:"Rahul Singh", email:"rahul@email.com", reason:"Late return + damage", date:"Apr 9", avatar:"R"},
  ]);
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Card cls="p-5">
        <h3 className="font-bold text-slate-800 mb-4">Block a User</h3>
        <div className="space-y-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="User name or email" className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/>
          <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason for blocking" className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400"/>
          <button onClick={()=>{if(name){setBlocked(b=>[...b,{name,email:"",reason,date:"Today",avatar:name[0]}]);setName("");setReason("");}}} className="w-full py-2.5 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-400">
            Block User
          </button>
        </div>
      </Card>
      <Card cls="p-5">
        <h3 className="font-bold text-slate-800 mb-4">Blocked Users ({blocked.length})</h3>
        <div className="space-y-3">
          {blocked.map((u,i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-red-200 text-red-700 flex items-center justify-center font-black text-sm">{u.avatar}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                <p className="text-xs text-slate-500">{u.reason} · {u.date}</p>
              </div>
              <button onClick={()=>setBlocked(b=>b.filter((_,j)=>j!==i))} className="text-xs text-red-500 font-semibold hover:text-red-700">Unblock</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const PayoutPage = ({ transactions = [] }) => {
  const payouts = [
    {id:"PAY001", amount:12400, date:"Apr 1",  trips:6, status:"paid",    utr:"UTR123456"},
    {id:"PAY002", amount:8900,  date:"Mar 15", trips:4, status:"paid",    utr:"UTR789012"},
    {id:"PAY003", amount:15200, date:"Mar 1",  trips:8, status:"paid",    utr:"UTR345678"},
    {id:"PAY004", amount:6500,  date:"Apr 15", trips:3, status:"pending", utr:"—"},
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card cls="p-4"><p className="text-xs text-slate-500 mb-1">Total Paid Out</p><p className="text-2xl font-black text-slate-800">₹36,500</p></Card>
        <Card cls="p-4"><p className="text-xs text-slate-500 mb-1">Pending</p><p className="text-2xl font-black text-sky-600">₹6,500</p></Card>
      </div>
      <Card cls="p-5">
        <h3 className="font-bold text-slate-800 mb-4">Payout History</h3>
        <div className="space-y-3">
          {payouts.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{p.id}</p>
                <p className="text-xs text-slate-400">{p.date} · {p.trips} trips · UTR: {p.utr}</p>
              </div>
              <p className="font-black text-slate-800">₹{p.amount.toLocaleString()}</p>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.status==="paid"?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-700"}`}>{p.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function OwnerDashboard({ currentUser, onLogout }) {
  const [localUser, setLocalUser] = useState(currentUser);
  // ── CSV data ──────────────────────────────────────────────────────────────
  const [csvData, setCsvData] = useState({
    vehicles: [], bookings: [], transactions: [], owners: [],
  });
  const [csvLoading, setCsvLoading] = useState(true);

  useEffect(() => {
    loadAllData()
      .then(data => { setCsvData(data); setCsvLoading(false); })
      .catch(err => { console.error("CSV load error:", err); setCsvLoading(false); });
  }, []);

  // Owner-scoped data: filter by currentUser identity where possible
  const vehicles         = csvData.vehicles;
  const bookingRequests  = csvData.bookings.slice(0, 50);   // show recent bookings
  const transactions     = csvData.transactions.slice(0, 50);

  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ownerNotifications, setOwnerNotifications] = useState(notifications);
  const unreadNotifs = ownerNotifications.filter(n => !n.read).length;

  // ─── Derive name from currentUser ──────────────────────────────────────────
  const ownerInitial   = (localUser?.name || "O").charAt(0).toUpperCase();
  const ownerFirstName = (localUser?.name || "Owner").split(" ")[0];
  const ownerFullName  = localUser?.name || "Owner";

  const navItems = [
    { id:"dashboard",  label:"Dashboard",       icon:<DashIcon/>  },
    { id:"vehicles",   label:"My Vehicles",      icon:<CarIcon/>   },
    { id:"add",        label:"Add Vehicle",      icon:<PlusIcon/>  },
    { id:"bookings",   label:"Booking Requests", icon:<BookIcon/>, badge:2 },
    { id:"calendar",   label:"Availability",     icon:<CalIcon/>   },
    { id:"earnings",   label:"Earnings",         icon:<CashIcon/>  },
    { id:"promotions", label:"Promotions",       icon:<TagIcon/>   },
    { id:"reviews",    label:"Reviews",          icon:<StarIcon/>  },
    { id:"notifications", label:"Notifications", icon:<BellIcon/>, badge:unreadNotifs },
    { id:"analytics",  label:"Analytics",        icon:<TrendIcon/> },
    { id:"maintenance",label:"Maintenance",      icon:<WrenchIcon/>},
    { id:"profile",    label:"Profile",          icon:<UserIcon/>  },
    { id:"settings",   label:"Settings",         icon:<GearIcon/>  },
    { id:"gallery",   label:"Photo Gallery",      icon:<UploadIcon/>  },
    { id:"handover",  label:"Handover Checklist",  icon:<CheckIcon/>   },
    { id:"fuellog",   label:"Fuel & Mileage Log",  icon:<CarIcon/>     },
    { id:"blacklist", label:"Blacklist",           icon:<XIcon/>       },
    { id:"payouts",   label:"Payout History",      icon:<CashIcon/>    },
    { id:"support",    label:"Support / Help",   icon:<HelpIcon/>  },
  ];

  const titles = {
    dashboard:"Dashboard", vehicles:"My Vehicles", add:"Add Vehicle",
    bookings:"Booking Requests", calendar:"Availability Calendar",
    earnings:"Earnings", promotions:"Promotions", reviews:"Reviews",
    notifications:"Notifications", analytics:"Analytics",
    maintenance:"Maintenance", profile:"Profile",
    gallery:   "Photo Gallery",
    handover:  "Handover Checklist",
    fuellog:   "Fuel & Mileage Log",
    blacklist: "Blacklisted Users",
    payouts:   "Payout History",
    settings:"Settings", support:"Support & Help",
  };

  const renderPage = () => {
    switch(page) {
      case "dashboard":     return <DashboardPage setPage={setPage} vehicles={vehicles} bookings={bookingRequests} />;
      case "vehicles":      return <MyVehiclesPage vehicles={vehicles} />;
      case "add":           return <AddVehiclePage vehicles={vehicles} />;
      case "bookings":      return <BookingRequestsPage bookingRequests={bookingRequests} />;
      case "calendar":      return <CalendarPage bookings={bookingRequests} />;
      case "earnings":      return <EarningsPage transactions={transactions} />;
      case "promotions":    return <PromotionsPage/>;
      case "reviews":       return <ReviewsPage/>;
      case "notifications": return <NotificationsPage notes={ownerNotifications} setNotes={setOwnerNotifications} />;
      case "analytics":     return <AnalyticsPage vehicles={vehicles} />;
      case "maintenance":   return <MaintenancePage vehicles={vehicles} />;
      case "profile":       return <ProfilePage currentUser={localUser} onUpdateUser={u => setLocalUser(prev => ({...prev, ...u}))} />;
      case "settings":      return <SettingsPage/>;
      case "gallery":   return <GalleryPage vehicles={vehicles} />;
      case "handover":  return <HandoverPage vehicles={vehicles} />;
      case "fuellog":   return <FuelLogPage vehicles={vehicles} />;
      case "blacklist": return <BlacklistPage/>;
      case "payouts":   return <PayoutPage transactions={transactions} />;
      case "support":       return <SupportPage/>;
      default:              return null;
    }
  };

  const navigate = p => { setPage(p); setSidebarOpen(false); };

  if (csvLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
      <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 text-sm">Loading owner data…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50" style={{fontFamily:"'Plus Jakarta Sans', 'Segoe UI', sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
        .sidebar-t{transition:transform .3s cubic-bezier(.4,0,.2,1)}
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-slate-100 z-40 flex flex-col sidebar-t shadow-xl ${sidebarOpen?"translate-x-0":"-translate-x-full"} lg:translate-x-0`}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-md shadow-sky-200">
              <span className="text-white font-black text-xs">RH</span>
            </div>
            <div>
              <p className="text-slate-800 font-black text-sm leading-none">RideHive</p>
              <p className="text-slate-400 text-xs">Owner Portal</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
          {navItems.map(item => (
            <button key={item.id} onClick={()=>navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group
                ${page===item.id ? "bg-sky-50 text-sky-600 border border-sky-100" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
              <span className={page===item.id?"text-sky-500":"text-slate-400 group-hover:text-slate-500"}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge>0 && <span className="bg-sky-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{item.badge}</span>}
            </button>
          ))}
        </nav>

        {/* Owner info + logout */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-md shadow-sky-200">
              {ownerInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-700 text-sm font-semibold truncate">{ownerFullName}</p>
              <p className="text-slate-400 text-xs truncate">Owner</p>
            </div>
          </div>
          <button
            onClick={() => { if (onLogout) onLogout(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-500 transition-all">
            <LogoutIcon/> Logout
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="lg:pl-60 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-5 py-3 flex items-center gap-4 shadow-sm">
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="lg:hidden text-slate-400 hover:text-slate-600 p-1">
            <MenuIcon/>
          </button>
          <h1 className="text-slate-800 font-black text-lg flex-1">{titles[page]}</h1>
          <div className="hidden sm:flex items-center bg-slate-100 rounded-xl px-3 py-2 gap-2 w-56">
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input placeholder="Search anything..." className="bg-transparent text-slate-600 text-xs flex-1 focus:outline-none placeholder-slate-400"/>
          </div>
          <button onClick={()=>navigate("notifications")} className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <BellIcon/>
            {unreadNotifs>0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full"/>}
          </button>
          <button onClick={()=>navigate("profile")} className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1 rounded-xl transition-colors">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-md shadow-sky-200">
              {ownerInitial}
            </div>
            <span className="text-slate-700 text-sm font-semibold hidden sm:block">{ownerFirstName}</span>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 max-w-5xl mx-auto w-full pb-10">
          {renderPage()}
        </main>
      </div>

      {/* AI Assistant */}
      <AIAssistant ownerName={ownerFirstName}/>
    </div>
  );
}
