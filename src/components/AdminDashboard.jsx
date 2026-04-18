import { useState, useRef, useContext, createContext, useEffect } from "react";
import { loadAllData } from "../csvLoader";
import { AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  ReferenceLine
} from "recharts";
// import { Car, Bike, Zap, ChevronRight, AlertCircle, ReceiptText, TrendingUp, Users, Shield, Clock, MapPin, CreditCard, FileText, Menu as MenuIcon, LogOut as LogoutIcon, Moon as MoonIcon, Sun as SunIcon, Bell as BellIcon, X as XIcon, Search as SearchIcon, AlertTriangle as AlertIcon } from "lucide-react";
// ─── MOCK DATA (static/derived – not in CSVs) ───────────────────────────────

const revenueData = {
  daily:   [{d:"Mon",r:18400},{d:"Tue",r:22100},{d:"Wed",r:19800},{d:"Thu",r:25600},{d:"Fri",r:31200},{d:"Sat",r:42800},{d:"Sun",r:38900}],
  weekly:  [{d:"W1",r:142000},{d:"W2",r:178000},{d:"W3",r:155000},{d:"W4",r:210000},{d:"W5",r:198000}],
  monthly: [{d:"Jan",r:520000},{d:"Feb",r:480000},{d:"Mar",r:640000},{d:"Apr",r:590000},{d:"May",r:720000},{d:"Jun",r:850000}],
};
const bookingTrendStatic = [
  {d:"Jan",bookings:210,cancellations:18},{d:"Feb",bookings:185,cancellations:22},{d:"Mar",bookings:310,cancellations:15},
  {d:"Apr",bookings:275,cancellations:28},{d:"May",bookings:390,cancellations:12},{d:"Jun",bookings:445,cancellations:20},
];
const cityRevenueStatic = [
  {city:"Dehradun",revenue:38},{city:"Rishikesh",revenue:25},{city:"Mussoorie",revenue:20},{city:"Haridwar",revenue:17}
];
const vehicleTypeRevenueStatic = [
  {name:"Cars",value:45,color:"#0ea5e9"},{name:"Bikes",value:35,color:"#8b5cf6"},{name:"Scooties",value:20,color:"#10b981"}
];
const userGrowth = [
  {d:"Jan",users:1200},{d:"Feb",users:1450},{d:"Mar",users:1890},{d:"Apr",users:2100},{d:"May",users:2650},{d:"Jun",users:3200}
];

const mockBookingsStatic = [
  {id:"BK001",user:"Priya Mehta",vehicle:"Royal Enfield Meteor",type:"Bike",from:"Apr 10",to:"Apr 12",amount:1798,status:"ongoing",avatar:"P",doubleBook:false},
  {id:"BK002",user:"Rahul Singh",vehicle:"Honda Activa 6G",type:"Scooty",from:"Apr 9",to:"Apr 9",amount:499,status:"upcoming",avatar:"R",doubleBook:true},
  {id:"BK003",user:"Ananya Gupta",vehicle:"Tata Nexon EV",type:"Car",from:"Apr 11",to:"Apr 14",amount:5697,status:"upcoming",avatar:"A",doubleBook:false},
  {id:"BK004",user:"Vikram Rao",vehicle:"Maruti Swift",type:"Car",from:"Apr 8",to:"Apr 10",amount:2998,status:"completed",avatar:"V",doubleBook:false},
  {id:"BK005",user:"Sneha Joshi",vehicle:"KTM Duke 390",type:"Bike",from:"Apr 7",to:"Apr 8",amount:1199,status:"completed",avatar:"S",doubleBook:false},
  {id:"BK006",user:"Amit Sharma",vehicle:"TVS Jupiter",type:"Scooty",from:"Apr 12",to:"Apr 13",amount:449,status:"cancelled",avatar:"A",doubleBook:false},
];

const mockTransactionsStatic = [
  {id:"TXN001",booking:"BK003",user:"Ananya G.",amount:5697,tax:1026,net:4671,date:"Apr 8",status:"received",fraud:false,city:"Mussoorie",type:"Car"},
  {id:"TXN002",booking:"BK004",user:"Vikram R.",amount:2998,tax:540,net:2458,date:"Apr 6",status:"received",fraud:false,city:"Dehradun",type:"Car"},
  {id:"TXN003",booking:"BK001",user:"Priya M.",amount:1798,tax:324,net:1474,date:"Mar 30",status:"pending",fraud:false,city:"Dehradun",type:"Bike"},
  {id:"TXN004",booking:"BK002",user:"Rahul S.",amount:499,tax:90,net:409,date:"Apr 9",status:"received",fraud:true,city:"Rishikesh",type:"Scooty"},
  {id:"TXN005",booking:"BK005",user:"Sneha J.",amount:1199,tax:216,net:983,date:"Apr 7",status:"refunded",fraud:false,city:"Dehradun",type:"Bike"},
];

const mockVerificationsStatic = [
  {id:"KYC001",name:"Meena Devi",type:"Owner KYC",doc:"Aadhaar + PAN",submitted:"Apr 6",priority:"High",status:"pending",avatar:"M",aiCheck:"Pass"},
  {id:"KYC002",name:"Rahul Singh",type:"Driving License",doc:"DL Upload",submitted:"Apr 5",priority:"Medium",status:"pending",avatar:"R",aiCheck:"Suspicious"},
  {id:"KYC003",name:"Suresh Yadav",type:"Owner KYC",doc:"Aadhaar + GST",submitted:"Apr 4",priority:"Low",status:"approved",avatar:"S",aiCheck:"Pass"},
  {id:"KYC004",name:"Amit Sharma",type:"Driving License",doc:"DL Upload",submitted:"Apr 3",priority:"High",status:"pending",avatar:"A",aiCheck:"Pass"},
];

const mockReportsStatic = [
  {id:"RPT001",reporter:"Priya Mehta",against:"Rajesh Kumar",type:"Vehicle Damage",desc:"Bike had scratches on delivery",priority:"High",status:"open",date:"Apr 8",avatar:"P"},
  {id:"RPT002",reporter:"Vikram Rao",against:"Meena Devi",type:"Late Return",desc:"Car returned 5 hours late",priority:"Medium",status:"resolved",date:"Apr 6",avatar:"V"},
  {id:"RPT003",reporter:"Ananya Gupta",against:"Suresh Yadav",type:"Overcharging",desc:"Charged extra ₹500 beyond booking",priority:"High",status:"open",date:"Apr 7",avatar:"A"},
];

const mockPromotionsStatic = [
  {id:1,code:"WEEKEND20",type:"Percentage",discount:20,from:"Apr 12",to:"Apr 14",uses:45,active:true},
  {id:2,code:"GOGREEN15",type:"Percentage",discount:15,from:"Apr 1",to:"Apr 30",uses:128,active:true},
  {id:3,code:"FLAT200",type:"Flat",discount:200,from:"Mar 1",to:"Mar 31",uses:89,active:false},
];

const mockNotifications = [
  {id:1,type:"booking",msg:"New booking BK003 created by Ananya Gupta for Tata Nexon EV",time:"2h ago",read:false},
  {id:2,type:"fraud",msg:"⚠️ Suspicious transaction detected — TXN004 by Rahul Singh",time:"3h ago",read:false},
  {id:3,type:"verification",msg:"New KYC submitted by Meena Devi — requires review",time:"5h ago",read:false},
  {id:4,type:"report",msg:"Damage report filed by Priya Mehta against Rajesh Kumar",time:"8h ago",read:true},
  {id:5,type:"system",msg:"Platform uptime: 99.97% this month. All systems normal.",time:"1d ago",read:true},
  {id:6,type:"booking",msg:"Double booking conflict detected on Honda Activa 6G — Apr 9",time:"1d ago",read:true},
];

const mockPayouts = [
  { id:"PO001", owner:"Rajesh Kumar", avatar:"R", vehicles:4, earned:102997, platform:10300, net:92697,  status:"paid",    date:"Apr 1",  bank:"HDFC ****4521" },
  { id:"PO002", owner:"Meena Devi",   avatar:"M", vehicles:2, earned:38500,  platform:3850,  net:34650,  status:"pending", date:"Apr 10", bank:"SBI  ****8812" },
  { id:"PO003", owner:"Suresh Yadav", avatar:"S", vehicles:6, earned:214000, platform:21400, net:192600, status:"paid",    date:"Apr 1",  bank:"ICICI****1234" },
  { id:"PO004", owner:"Kavita Bhat",  avatar:"K", vehicles:1, earned:12800,  platform:1280,  net:11520,  status:"pending", date:"Apr 10", bank:"Axis ****7761" },
  { id:"PO005", owner:"Anil Rawat",   avatar:"A", vehicles:3, earned:67500,  platform:6750,  net:60750,  status:"failed",  date:"Apr 5",  bank:"BOB  ****2290" },
];

const mockAuditLogStatic = [
  { id:"AL001", admin:"Arjun Sharma", action:"Approved vehicle",   target:"V003 – Maruti Swift Dzire",        page:"vehicles",      time:"2m ago",  ip:"182.74.12.5", severity:"info"    },
  { id:"AL002", admin:"Arjun Sharma", action:"Blocked user",        target:"U002 – Rahul Singh",               page:"users",         time:"18m ago", ip:"182.74.12.5", severity:"warning" },
  { id:"AL003", admin:"Arjun Sharma", action:"Issued refund",       target:"TXN005 – ₹1,199",                  page:"transactions",  time:"1h ago",  ip:"182.74.12.5", severity:"info"    },
  { id:"AL004", admin:"Arjun Sharma", action:"Resolved report",     target:"RPT002 – Late Return",             page:"reports",       time:"2h ago",  ip:"182.74.12.5", severity:"info"    },
  { id:"AL005", admin:"Arjun Sharma", action:"Created promo code",  target:"WEEKEND20 – 20% off",              page:"promotions",    time:"3h ago",  ip:"182.74.12.5", severity:"info"    },
  { id:"AL006", admin:"Arjun Sharma", action:"Rejected vehicle",    target:"V006 – TVS Jupiter",               page:"vehicles",      time:"5h ago",  ip:"182.74.12.5", severity:"warning" },
  { id:"AL007", admin:"Arjun Sharma", action:"Approved KYC",        target:"KYC003 – Suresh Yadav",            page:"verifications", time:"6h ago",  ip:"182.74.12.5", severity:"info"    },
  { id:"AL008", admin:"Arjun Sharma", action:"Login",               target:"Admin panel access",               page:"auth",          time:"9h ago",  ip:"182.74.12.5", severity:"info"    },
  { id:"AL009", admin:"Arjun Sharma", action:"Cancelled booking",   target:"BK006 – Amit Sharma",              page:"bookings",      time:"1d ago",  ip:"182.74.12.5", severity:"warning" },
  { id:"AL010", admin:"Arjun Sharma", action:"Updated settings",    target:"Cancellation policy → 24h",        page:"settings",      time:"2d ago",  ip:"182.74.12.5", severity:"info"    },
];

const trustScores = {
  U001: { score:91, label:"Trusted",     color:"emerald", factors:{ bookings:12, cancellationRate:"8%",   disputeRate:"0%",  verified:true  } },
  U002: { score:31, label:"High Risk",   color:"red",     factors:{ bookings:3,  cancellationRate:"100%", disputeRate:"33%", verified:false } },
  U003: { score:98, label:"Superstar",   color:"emerald", factors:{ bookings:28, cancellationRate:"0%",   disputeRate:"0%",  verified:true  } },
  U004: { score:72, label:"Good",        color:"sky",     factors:{ bookings:7,  cancellationRate:"29%",  disputeRate:"0%",  verified:true  } },
  U005: { score:88, label:"Trusted",     color:"emerald", factors:{ bookings:19, cancellationRate:"5%",   disputeRate:"0%",  verified:true  } },
  U006: { score:45, label:"Medium Risk", color:"blue",   factors:{ bookings:5,  cancellationRate:"80%",  disputeRate:"20%", verified:true  } },
};

const cancellationRisk = {
  BK001: { score:12, label:"Low"  },
  BK002: { score:88, label:"High" },
  BK003: { score:24, label:"Low"  },
  BK004: { score:5,  label:"Low"  },
  BK005: { score:18, label:"Low"  },
  BK006: { score:92, label:"High" },
};

const vehiclesWithCoords = [
  { id:"V001", name:"Royal Enfield Meteor 350", type:"Bike",   lat:30.3165, lng:78.0322, city:"Dehradun",  price:899,  status:"approved", img:"🏍️", aiScore:92 },
  { id:"V002", name:"Honda Activa 6G",           type:"Scooty", lat:30.0869, lng:78.2676, city:"Rishikesh", price:499,  status:"approved", img:"🛵",  aiScore:71 },
  { id:"V003", name:"Maruti Swift Dzire",         type:"Car",    lat:30.3165, lng:78.0450, city:"Dehradun",  price:1499, status:"pending",  img:"🚗",  aiScore:96 },
  { id:"V004", name:"Tata Nexon EV",              type:"Car",    lat:30.4527, lng:78.1064, city:"Mussoorie", price:1899, status:"approved", img:"🚗",  aiScore:88 },
  { id:"V005", name:"KTM Duke 390",               type:"Bike",   lat:30.3245, lng:78.0310, city:"Dehradun",  price:1199, status:"pending",  img:"🏍️", aiScore:94 },
  { id:"V006", name:"TVS Jupiter",                type:"Scooty", lat:29.9457, lng:78.1642, city:"Haridwar",  price:449,  status:"rejected", img:"🛵",  aiScore:55 },
];

const pricingSuggestions = [
  { vehicleId:"V001", name:"Royal Enfield Meteor", current:899,  suggested:1049, reason:"High demand weekend",     delta:"+17%", urgent:true  },
  { vehicleId:"V002", name:"Honda Activa 6G",       current:499,  suggested:560,  reason:"Below market average",    delta:"+12%", urgent:false },
  { vehicleId:"V004", name:"Tata Nexon EV",          current:1899, suggested:1750, reason:"Low bookings this week",  delta:"−8%",  urgent:false },
  { vehicleId:"V005", name:"KTM Duke 390",            current:1199, suggested:1349, reason:"New listing, underpriced",delta:"+13%", urgent:true  },
];

const emailTemplates = [
  { id:"ET001", name:"Booking Confirmation",   subject:"Your booking is confirmed! 🎉",    trigger:"On booking created",   lastSent:"Apr 9", active:true  },
  { id:"ET002", name:"Cancellation Notice",    subject:"Your booking has been cancelled",  trigger:"On booking cancelled", lastSent:"Apr 7", active:true  },
  { id:"ET003", name:"KYC Approved",           subject:"Your account is now verified ✅",  trigger:"On KYC approval",      lastSent:"Apr 4", active:true  },
  { id:"ET004", name:"Fraud Alert (Internal)", subject:"⚠️ Suspicious activity detected", trigger:"On fraud flag",        lastSent:"Apr 9", active:true  },
  { id:"ET005", name:"Payout Processed",       subject:"Your payout has been sent 💰",     trigger:"On payout completed",  lastSent:"Apr 1", active:false },
  { id:"ET006", name:"Weekly Summary",         subject:"RideHive Weekly Report",           trigger:"Every Monday 9 AM",    lastSent:"Apr 8", active:true  },
];

const platformHealth = {
  uptime:            99.97,
  apiLatency:        142,
  errorRate:         0.03,
  activeConnections: 284,
  dbResponseTime:    38,
  storageUsed:       67,
  paymentGateway:    "operational",
  emailService:      "operational",
  smsGateway:        "degraded",
  mapService:        "operational",
};

const defaultWidgets = [
  { id:"w1", label:"Total Users",       icon:"👤", value:"3,248", delta:"+21%",   color:"sky",     visible:true,  order:0 },
  { id:"w2", label:"Total Owners",      icon:"🏠", value:"142",   delta:"+8",     color:"violet",  visible:true,  order:1 },
  { id:"w3", label:"Total Vehicles",    icon:"🚘", value:"389",   delta:"41 pend",color:"blue",   visible:true,  order:2 },
  { id:"w4", label:"Total Revenue",     icon:"💰", value:"₹28.5L",delta:"+18%",   color:"emerald", visible:true,  order:3 },
  { id:"w5", label:"Active Bookings",   icon:"📋", value:"2",     delta:"ongoing",color:"sky",     visible:false, order:4 },
  { id:"w6", label:"Pending KYC",       icon:"🪪", value:"3",     delta:"review", color:"blue",   visible:false, order:5 },
  { id:"w7", label:"Fraud Flags",       icon:"⚠️", value:"1",     delta:"today",  color:"red",     visible:false, order:6 },
  { id:"w8", label:"Avg Booking Value", icon:"💳", value:"₹1,847",delta:"per trip",color:"violet",  visible:false, order:7 },
];

// ─── DARK MODE CONTEXT ───────────────────────────────────────────────────────
const DarkContext = createContext({ dark: false, toggleDark: () => {} });
const useDark = () => useContext(DarkContext);

// ─── CSV EXPORT UTILITY ──────────────────────────────────────────────────────
const exportCSV = (filename, rows, headers) => {
  const escape = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ─── DATE RANGE CONTEXT ──────────────────────────────────────────────────────
const DateRangeContext = createContext({ from: "", to: "", setFrom: () => {}, setTo: () => {} });
const useDateRange = () => useContext(DateRangeContext);

// ─── ICONS ──────────────────────────────────────────────────────────────────
const I = ({ d, s = 18, cls = "" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={cls}>
    <path d={d} />
  </svg>
);
const DashIcon    = () => <I d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>;
const UsersIcon   = () => <I d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>;
const CarIcon     = () => <I d="M5 17H3v-5l2-5h14l2 5v5h-2M5 17a2 2 0 104 0M15 17a2 2 0 104 0M5 12h14"/>;
const BookIcon    = () => <I d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>;
const CashIcon    = () => <I d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/>;
const ShieldIcon  = () => <I d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>;
const FlagIcon    = () => <I d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>;
const TrendIcon   = () => <I d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6"/>;
const TagIcon     = () => <I d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01"/>;
const BotIcon     = () => <I d="M12 2a2 2 0 012 2v2h4a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4V4a2 2 0 012-2zM8 13h2M14 13h2M10 17h4"/>;
const BellIcon    = () => <I d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>;
const UserIcon    = () => <I d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>;
const GearIcon    = () => <I d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>;
const LogoutIcon  = () => <I d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>;
const PayIcon   = () => <I d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>;
const ClockIcon = () => <I d="M12 8v4l3 3M12 2a10 10 0 100 20A10 10 0 0012 2z"/>;
const CalIcon = () => <I d="M8 2v3M16 2v3M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zM10 13h4M12 11v4"/>;
const CheckIcon   = () => <I d="M20 6L9 17l-5-5"/>;
const XIcon       = () => <I d="M18 6L6 18M6 6l12 12"/>;
const MenuIcon    = () => <I d="M3 6h18M3 12h18M3 18h18"/>;
const EyeIcon     = () => <I d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z"/>;
const TrashIcon   = () => <I d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>;
const AlertIcon   = () => <I d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/>;
const ChatIcon    = () => <I d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>;
const EditIcon    = () => <I d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>;
const DownloadIcon= () => <I d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>;
const PlusIcon    = () => <I d="M12 5v14M5 12h14"/>;
const LockIcon    = () => <I d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4"/>;
const MapIcon     = () => <I d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 10a1 1 0 100-2 1 1 0 000 2z"/>;
const RefreshIcon = () => <I d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>;
const SunIcon     = () => <I d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z"/>;
const MoonIcon    = () => <I d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>;

// ─── GLOBAL SEARCH ──────────────────────────────────────────────────────────
// searchIndex is now built dynamically inside GlobalSearch from props
const GlobalSearch = ({ navigate, searchData = {} }) => {
  const { users = [], owners = [], vehicles = [], bookings = [], transactions = [], verifications = [], reports = [] } = searchData;
  const searchIndex = [
    ...users.map(u => ({ type: "User", label: u.name, sub: u.email, status: u.status, page: "users", icon: "👤", id: u.id })),
    ...owners.map(o => ({ type: "Owner", label: o.name, sub: o.email, status: o.status, page: "users", icon: "🏠", id: o.id })),
    ...vehicles.map(v => ({ type: "Vehicle", label: v.name, sub: `${v.type} · ${v.location} · ₹${v.price}/day`, status: v.status, page: "vehicles", icon: v.img, id: v.id })),
    ...bookings.map(b => ({ type: "Booking", label: b.id, sub: `${b.user} · ${b.vehicle} · ₹${b.amount}`, status: b.status, page: "bookings", icon: "📋", id: b.id })),
    ...transactions.map(t => ({ type: "Transaction", label: t.id, sub: `${t.user} · ₹${t.amount} · ${t.city}`, status: t.status, page: "transactions", icon: "💳", id: t.id })),
    ...verifications.map(v => ({ type: "KYC", label: v.name, sub: `${v.type} · ${v.doc}`, status: v.status, page: "verifications", icon: "🪪", id: v.id })),
    ...reports.map(r => ({ type: "Report", label: r.reporter, sub: `vs ${r.against} · ${r.type}`, status: r.status, page: "reports", icon: "🚨", id: r.id })),
  ];
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const results = query.trim().length < 2 ? [] : searchIndex.filter(item =>
    [item.label, item.sub, item.type, item.status, item.id].some(f =>
      f != null && String(f).toLowerCase().includes(query.toLowerCase())
    )
  ).slice(0, 8);

  const statusColors = {
    active: "bg-emerald-100 text-emerald-700", blocked: "bg-red-100 text-red-700",
    pending: "bg-sky-100 text-sky-700", approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700", ongoing: "bg-sky-100 text-sky-700",
    upcoming: "bg-violet-100 text-violet-700", completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-slate-100 text-slate-500", received: "bg-emerald-100 text-emerald-700",
    refunded: "bg-sky-100 text-sky-700", open: "bg-red-100 text-red-700",
    resolved: "bg-emerald-100 text-emerald-700", verified: "bg-emerald-100 text-emerald-700",
  };

  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused(f => Math.min(f + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setFocused(f => Math.max(f - 1, -1)); }
    if (e.key === "Enter" && focused >= 0 && results[focused]) { pick(results[focused]); }
    if (e.key === "Escape") { setOpen(false); setQuery(""); inputRef.current?.blur(); }
  };

  const pick = (item) => {
    navigate(item.page);
    setQuery("");
    setOpen(false);
    setFocused(-1);
  };

  // Close on outside click
  useRef(() => {});
  const handleBlur = (e) => {
    if (!containerRef.current?.contains(e.relatedTarget)) {
      setTimeout(() => setOpen(false), 150);
    }
  };

  const typeColors = {
    User: "bg-sky-50 text-sky-600", Owner: "bg-violet-50 text-violet-600",
    Vehicle: "bg-sky-50 text-sky-600", Booking: "bg-emerald-50 text-emerald-600",
    Transaction: "bg-teal-50 text-teal-600", KYC: "bg-purple-50 text-purple-600",
    Report: "bg-red-50 text-red-600",
  };

  return (
    <div ref={containerRef} className="relative hidden sm:block" onBlur={handleBlur}>
      <div className={`flex items-center bg-slate-100 rounded-xl px-3 py-2 gap-2 w-56 transition-all ${open && query ? "w-72 bg-white border border-violet-200 shadow-lg" : ""}`}>
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={open && query ? "#8b5cf6" : "#94a3b8"} strokeWidth={2}>
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setFocused(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Search anything..."
          className="bg-transparent text-slate-600 text-xs flex-1 focus:outline-none placeholder-slate-400"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }}
            className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-slate-400 text-sm">No results for <span className="font-semibold text-slate-600">"{query}"</span></p>
              <p className="text-slate-300 text-xs mt-1">Try searching by name, ID, email, or status</p>
            </div>
          ) : (
            <>
              <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
                <p className="text-slate-400 text-xs font-semibold">{results.length} result{results.length !== 1 ? "s" : ""}</p>
                <p className="text-slate-300 text-xs">↑↓ navigate · Enter to open · Esc close</p>
              </div>
              <div className="pb-2">
                {results.map((item, i) => (
                  <button key={`${item.type}-${item.id}`} onClick={() => pick(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${i === focused ? "bg-violet-50" : "hover:bg-slate-50"}`}>
                    <span className="text-lg w-7 text-center flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-slate-800 font-semibold text-xs truncate">{item.label}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${typeColors[item.type] || "bg-slate-100 text-slate-500"}`}>{item.type}</span>
                      </div>
                      <p className="text-slate-400 text-xs truncate">{item.sub}</p>
                    </div>
                    {item.status && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColors[item.status] || "bg-slate-100 text-slate-500"}`}>
                        {item.status}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 px-3 py-2 bg-slate-50">
                <p className="text-slate-400 text-xs">Searching across users, vehicles, bookings, transactions & more</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── SHARED COMPONENTS ──────────────────────────────────────────────────────
const Card = ({ children, cls = "" }) => {
  const { dark } = useDark();
  return (
    <div className={`rounded-lg border shadow-sm ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} ${cls}`}>{children}</div>
  );
};

const Badge = ({ label, color = "sky" }) => {
  const map = {
    sky: "bg-sky-100 text-sky-700", green: "bg-emerald-100 text-emerald-700",
    blue: "bg-sky-100 text-sky-700", red: "bg-red-100 text-red-700",
    slate: "bg-slate-100 text-slate-500", violet: "bg-violet-100 text-violet-700",
    blue: "bg-sky-100 text-sky-700",
  };
  return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${map[color] || map.slate}`}>{label}</span>;
};

const Toggle = ({ on, onToggle }) => (
  <button onClick={onToggle} className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${on ? "bg-sky-500" : "bg-slate-200"}`}>
    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
  </button>
);

const EyeOpenIcon  = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeCloseIcon = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/></svg>;
const PwInput = ({ placeholder }) => {
  const { dark } = useDark();
  const [show, setShow] = useState(false);
  return (
    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors ${dark ? "bg-slate-700 border-slate-600 text-slate-200 focus-within:border-violet-400" : "bg-slate-50 border-slate-200 text-slate-700 focus-within:border-sky-400"}`}>
      <input type={show ? "text" : "password"} placeholder={placeholder} className={`flex-1 bg-transparent focus:outline-none text-sm ${dark ? "placeholder-slate-500" : "placeholder-slate-400"}`} />
      <button type="button" onClick={() => setShow(v => !v)} className={`flex-shrink-0 transition-colors ${dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}>
        {show ? <EyeCloseIcon /> : <EyeOpenIcon />}
      </button>
    </div>
  );
};

const Avatar = ({ letter, color = "sky", size = "md" }) => {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-xl" : "w-10 h-10 text-sm";
  const bg = { sky: "from-sky-500 to-cyan-400", violet: "from-violet-500 to-purple-400", emerald: "from-emerald-500 to-teal-400", blue: "from-sky-500 to-cyan-400" };
  return (
    <div className={`${sz} rounded-xl bg-gradient-to-br ${bg[color] || bg.sky} flex items-center justify-center text-white font-black shadow-sm flex-shrink-0`}>
      {letter}
    </div>
  );
};

const SectionTitle = ({ title, sub, action }) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-slate-800 font-black text-xl">{title}</h2>
      {sub && <p className="text-slate-400 text-sm mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

const StatCard = ({ label, value, delta, icon, color }) => {
  const { dark } = useDark();
  const colors = {
    sky: "from-sky-500 to-cyan-400", violet: "from-violet-500 to-purple-400",
    emerald: "from-emerald-500 to-teal-400", blue: "from-sky-500 to-cyan-400",
  };
  return (
    <Card cls="overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${colors[color] || colors.sky}`} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
          <span className="text-xl">{icon}</span>
        </div>
        <p className={`font-black text-2xl ${dark ? "text-white" : "text-slate-800"}`}>{value}</p>
        <p className={`text-xs mt-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>{delta}</p>
      </div>
    </Card>
  );
};

// ─── STATUS BADGE ──────────────────────────────────────────────────────────
const StatusBadge = ({ s }) => {
  if (!s) return <Badge label="Unknown" color="slate" />;
  const map = {
    active: ["green", "Active"], blocked: ["red", "Blocked"], pending: ["blue", "Pending"],
    approved: ["green", "Approved"], rejected: ["red", "Rejected"], ongoing: ["sky", "Ongoing"],
    upcoming: ["violet", "Upcoming"], completed: ["green", "Completed"], cancelled: ["slate", "Cancelled"],
    received: ["green", "Received"], refunded: ["blue", "Refunded"], open: ["red", "Open"],
    resolved: ["green", "Resolved"], verified: ["green", "Verified"], High: ["red", "High"],
    Medium: ["blue", "Medium"], Low: ["green", "Low"],
  };
  const [c, l] = map[s] || ["slate", s];
  return <Badge label={l} color={c} />;
};

// ─── CONDITION TAG ─────────────────────────────────────────────────────────
const ConditionTag = ({ c }) => {
  const map = { New: "bg-emerald-50 text-emerald-700 border-emerald-200", Good: "bg-sky-50 text-sky-700 border-sky-200", "Needs Maintenance": "bg-sky-50 text-sky-700 border-sky-200" };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${map[c] || ""}`}>{c}</span>;
};

// ─── AI ASSISTANT (Floating) ───────────────────────────────────────────────
const AIAssistant = ({ fullPage = false }) => {
  const [open, setOpen] = useState(fullPage);
  const [msgs, setMsgs] = useState([
    { from: "ai", text: "Hello Admin! I'm your AI assistant. I can help with fraud detection, demand prediction, pricing insights, and platform analytics." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const suggestions = ["Fraud risk summary", "Peak demand this week", "Top earning vehicles", "Pricing suggestions"];

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const q = text.trim();
    setMsgs(m => [...m, { from: "user", text: q }]);
    setInput("");
    setLoading(true);
    setMsgs(m => [...m, { from: "ai", text: "⏳ Thinking..." }]);
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are an AI assistant for RideHive Admin — a vehicle rental platform in Uttarakhand (Dehradun, Rishikesh, Mussoorie, Haridwar). You help admins with fraud detection, demand forecasting, pricing strategy, KYC reviews, and platform analytics. The platform has Cars, Bikes, and Scooties. Be concise, data-driven, and actionable. Use rupee symbol for currency. Keep responses under 4 sentences." },
            { role: "user", content: q }
          ]
        })
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "I'm having trouble connecting. Please try again!";
      setMsgs(m => [...m.slice(0, -1), { from: "ai", text: reply }]);
    } catch {
      setMsgs(m => [...m.slice(0, -1), { from: "ai", text: "I'm having trouble connecting. Please check your API key and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (fullPage) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {[["🔍 Fraud Detection","2 suspicious transactions flagged today","red"],["📊 Demand Forecast","Dehradun weekend: 65% above avg","emerald"],["💡 Pricing AI","3 vehicles underpriced vs market","sky"],["📈 Growth Insight","User signups up 21% this month","violet"]].map(([t,d,c])=>(
            <Card key={t} cls={`p-4 border-l-4 border-${c}-400`}>
              <p className="font-bold text-slate-800 text-sm">{t}</p>
              <p className="text-slate-500 text-xs mt-1">{d}</p>
            </Card>
          ))}
        </div>
        <Card cls="overflow-hidden border-sky-100 bg-white/80 backdrop-blur-md">
          <div className="bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-4 flex items-center gap-3">
            <BotIcon /><span className="text-white font-bold">AI Admin Assistant</span>
            <span className="ml-auto text-white/70 text-xs bg-white/20 px-2 py-0.5 rounded-full">Powered by AI</span>
          </div>
          <div className="h-72 overflow-y-auto p-4 space-y-3 bg-white">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : ""}`}>
                <div className={`text-sm px-4 py-2.5 rounded-lg max-w-[85%] leading-relaxed ${m.from === "ai" ? "bg-slate-50 text-slate-700 border border-slate-200" : "bg-sky-500 text-white"}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="px-4 pb-3 pt-2 flex flex-wrap gap-1.5 bg-white">
            {suggestions.map(s => (
              <button key={s} onClick={() => send(s)} className="text-xs bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors border border-sky-200 font-medium">{s}</button>
            ))}
          </div>
          <div className="px-4 pb-4 flex gap-2 bg-white">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)} placeholder="Ask anything about the platform..." className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-sky-400" />
            <button onClick={() => send(input)} disabled={loading} className="bg-sky-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-sky-600 transition-colors disabled:opacity-50">{loading ? "..." : "Send"}</button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-sky-100 overflow-hidden ring-1 ring-sky-200">
          <div className="bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 flex items-center gap-2">
            <BotIcon /><span className="text-white font-bold text-sm flex-1">AI Assistant</span>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white"><XIcon size={18} /></button>
          </div>
          <div className="h-52 overflow-y-auto p-3 space-y-2 bg-white">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : ""}`}>
                <div className={`text-xs px-3 py-2 rounded-lg max-w-[85%] leading-relaxed ${m.from === "ai" ? "bg-slate-50 text-slate-700 border border-slate-200" : "bg-sky-500 text-white"}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="px-3 pb-2 flex flex-wrap gap-1 bg-white">
            {suggestions.slice(0, 2).map(s => (
              <button key={s} onClick={() => send(s)} className="text-xs bg-sky-50 text-sky-700 px-2 py-1 rounded-lg hover:bg-sky-100 border border-sky-200 font-medium">{s}</button>
            ))}
          </div>
          <div className="px-3 pb-3 flex gap-2 bg-white">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)} placeholder="Ask anything..." className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-sky-400" />
            <button onClick={() => send(input)} disabled={loading} className="bg-sky-500 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-sky-600 disabled:opacity-50">{loading ? "..." : "Send"}</button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="w-14 h-14 bg-gradient-to-br from-sky-500 to-cyan-400 rounded-lg shadow-lg flex items-center justify-center text-white hover:scale-105 transition-all shadow-sky-300 border border-sky-400">
        <BotIcon size={20} />
      </button>
    </div>
  );
};

// ─── DATE RANGE FILTER COMPONENT ─────────────────────────────────────────────
const DateRangeFilter = ({ from, to, setFrom, setTo, onExport }) => {
  const { dark } = useDark();
  const presets = [
    { label: "Today",    from: "2024-04-10", to: "2024-04-10" },
    { label: "This Week",from: "2024-04-08", to: "2024-04-14" },
    { label: "This Month",from: "2024-04-01", to: "2024-04-30" },
    { label: "All Time", from: "", to: "" },
  ];
  return (
    <div className={`flex flex-wrap items-center gap-3 p-4 rounded-2xl border mb-5 ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"} shadow-sm`}>
      <span className={`text-xs font-bold uppercase tracking-wide ${dark ? "text-slate-400" : "text-slate-500"}`}>📅 Date Range</span>
      <div className="flex gap-1 flex-wrap">
        {presets.map(p => (
          <button key={p.label} onClick={() => { setFrom(p.from); setTo(p.to); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
              ${from === p.from && to === p.to
                ? "bg-sky-500 border-sky-500 text-white"
                : dark ? "border-slate-600 text-slate-400 hover:border-sky-400 hover:text-sky-400" : "border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-500"}`}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)}
          className={`text-xs px-3 py-1.5 rounded-xl border focus:outline-none focus:border-violet-400 ${dark ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"}`} />
        <span className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>→</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)}
          className={`text-xs px-3 py-1.5 rounded-xl border focus:outline-none focus:border-violet-400 ${dark ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"}`} />
      </div>
      {onExport && (
        <button onClick={onExport}
          className="ml-auto flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm">
          <DownloadIcon /> Export CSV
        </button>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: DASHBOARD
// ════════════════════════════════════════════════════════════════
  const DashboardPage = ({ setPage, widgets = defaultWidgets, vehicles = [], bookings = [], vehicleTypeRevenue = [], bookingTrend = [], cityRevenue = [] }) => {
  const [period, setPeriod] = useState("monthly");
  const { dark } = useDark();
  const { from, to, setFrom, setTo } = useDateRange();

  const txt  = dark ? "text-slate-100" : "text-slate-800";
  const sub  = dark ? "text-slate-400" : "text-slate-400";
  const grid = dark ? "stroke-slate-700" : "#f1f5f9";

  const handleExport = () => exportCSV("dashboard_summary.csv", [
    { Metric: "Total Users", Value: "3,248", Change: "+21% this month" },
    { Metric: "Total Owners", Value: "142", Change: "+8 new this week" },
    { Metric: "Total Vehicles", Value: "389", Change: "41 pending approval" },
    { Metric: "Total Revenue", Value: "₹28.5L", Change: "+18% vs last month" },
  ], ["Metric", "Value", "Change"]);

  return (
    <div className="space-y-6">
      <DateRangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} onExport={handleExport} />

      {/* Summary Cards */}
{[...widgets].filter(w => w.visible).sort((a,b) => a.order - b.order).map(w => (
  <StatCard key={w.id} label={w.label} value={w.value} delta={w.delta} icon={w.icon} color={w.color} />
))}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card cls="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className={`font-bold ${txt}`}>Revenue Overview</h3><p className={`text-xs ${sub}`}>Platform-wide revenue {from && to ? `· ${from} to ${to}` : ""}</p></div>
            <div className={`flex rounded-xl p-1 gap-1 ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
              {["daily","weekly","monthly"].map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${period === p ? "bg-violet-500 text-white shadow-sm" : dark ? "text-slate-400" : "text-slate-500"}`}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData[period]}>
              <defs><linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#f1f5f9"} />
              <XAxis dataKey="d" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12, background: dark ? "#1e293b" : "#fff", color: dark ? "#e2e8f0" : "#334155" }} />
              <Area type="monotone" dataKey="r" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#rGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card cls="p-5">
          <h3 className={`font-bold mb-1 ${txt}`}>Revenue Split</h3>
          <p className={`text-xs mb-3 ${sub}`}>By vehicle type</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={vehicleTypeRevenue} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {vehicleTypeRevenue.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => [`${v}%`]} contentStyle={{ borderRadius: "12px", fontSize: 12, background: dark ? "#1e293b" : "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {vehicleTypeRevenue.map(e => (
              <div key={e.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                <span className={`flex-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>{e.name}</span>
                <span className={`font-bold ${txt}`}>{e.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Booking Trend + User Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card cls="p-5">
          <h3 className={`font-bold mb-1 ${txt}`}>Booking Trends</h3>
          <p className={`text-xs mb-4 ${sub}`}>Bookings vs cancellations</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={bookingTrend} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#f1f5f9"} vertical={false} />
              <XAxis dataKey="d" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12, background: dark ? "#1e293b" : "#fff", color: dark ? "#e2e8f0" : "#334155" }} />
              <Bar dataKey="bookings" name="Bookings" fill="#4ba1c9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancellations" name="Cancelled" fill="#71f8ed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card cls="p-5">
          <h3 className={`font-bold mb-1 ${txt}`}>User Growth</h3>
          <p className={`text-xs mb-4 ${sub}`}>Monthly active user trend</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#f1f5f9"} />
              <XAxis dataKey="d" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12, background: dark ? "#1e293b" : "#fff", color: dark ? "#e2e8f0" : "#334155" }} />
              <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: "#8b5cf6", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Alert Center */}
      <Card cls="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`font-bold ${txt}`}>Alert Center</h3>
            <p className={`text-xs ${sub}`}>Items requiring immediate attention</p>
          </div>
          <button onClick={() => setPage("verifications")} className="text-violet-500 text-xs font-semibold hover:text-violet-400">View All →</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {[
            { icon: "🕐", label: "Pending Verifications", value: 4, desc: "KYC & license reviews", color: "blue", page: "verifications" },
            { icon: "🚨", label: "Reported Issues", value: 2, desc: "Damage & complaint reports", color: "red", page: "reports" },
            { icon: "⚠️", label: "Suspicious Activities", value: 1, desc: "Fraud flagged by AI", color: "violet", page: "transactions" },
          ].map(a => (
            <button key={a.label} onClick={() => setPage(a.page)} className={`flex items-center gap-3 p-4 rounded-xl border hover:opacity-90 transition-all text-left w-full bg-${a.color}-50 border-${a.color}-200`}>
              <span className="text-2xl">{a.icon}</span>
              <div>
                <p className={`font-bold text-${a.color}-700 text-sm`}>{a.value} {a.label}</p>
                <p className={`text-${a.color}-500 text-xs`}>{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* City Revenue */}
      <Card cls="p-5">
        <h3 className={`font-bold mb-4 ${txt}`}>Revenue by City</h3>
        <div className="space-y-3">
          {cityRevenue.map(c => (
            <div key={c.city} className="flex items-center gap-3">
              <span className={`text-sm w-24 font-medium ${dark ? "text-slate-300" : "text-slate-600"}`}>{c.city}</span>
              <div className={`flex-1 rounded-full h-2 ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
                <div className="bg-gradient-to-r from-violet-500 to-purple-400 h-2 rounded-full transition-all" style={{ width: `${c.revenue}%` }} />
              </div>
              <span className={`font-bold text-sm w-8 text-right ${txt}`}>{c.revenue}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: USERS
// ════════════════════════════════════════════════════════════════
const UsersPage = ({ users: initUsers = [], owners: initOwners = [] }) => {
  const [users, setUsers] = useState(initUsers);
  const owners = initOwners;
  const [tab, setTab] = useState("users");
  const [selected, setSelected] = useState(null);
  const { dark } = useDark();
  const { from, to, setFrom, setTo } = useDateRange();

  const txt = dark ? "text-slate-100" : "text-slate-800";
  const sub = dark ? "text-slate-400" : "text-slate-400";

  const toggle = id => setUsers(u => u.map(x => x.id === id ? { ...x, status: x.status === "active" ? "blocked" : "active" } : x));

  const handleExportUsers = () => exportCSV("users.csv", users, ["id","name","email","status","bookings","cancellations","joined","lastLogin"]);
  const handleExportOwners = () => exportCSV("owners.csv", owners, ["id","name","email","vehicles","status","earnings"]);

  return (
    <div className="space-y-5">
      <DateRangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo}
        onExport={tab === "users" ? handleExportUsers : handleExportOwners} />
      <div className={`flex rounded-xl p-1 w-fit gap-1 ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
        {[["users","Users"],["owners","Owners"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === k ? "bg-violet-500 text-white shadow-sm" : dark ? "text-slate-400" : "text-slate-500"}`}>{l}</button>
        ))}
      </div>

      {tab === "users" && (
        <div className="space-y-3">
          {users.map(u => (
            <Card key={u.id} cls="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar letter={u.avatar} color={u.status === "blocked" ? "red" : "sky"} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-slate-800 font-bold text-sm">{u.name}</p>
                    <StatusBadge s={u.status} />
                  </div>
                  <p className="text-slate-400 text-xs">{u.email} · Joined {u.joined} · Last seen: {u.lastLogin}</p>
                </div>
                <div className="flex items-center gap-6 text-center">
                  <div><p className="text-sky-600 font-black text-lg">{u.bookings}</p><p className="text-slate-400 text-xs">Bookings</p></div>
                  <div><p className="text-red-500 font-black text-lg">{u.cancellations}</p><p className="text-slate-400 text-xs">Cancelled</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(selected === u.id ? null : u.id)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-100 transition-colors"><EyeIcon /> View</button>
                  <button onClick={() => toggle(u.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${u.status === "active" ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"}`}>
                    {u.status === "active" ? <><XIcon /> Block</> : <><CheckIcon /> Unblock</>}
                  </button>
                </div>
              </div>
              {selected === u.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[["User ID", u.id], ["Email", u.email], ["Joined", u.joined], ["Last Login", u.lastLogin]].map(([l, v]) => (
                    <div key={l} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-slate-400 text-xs">{l}</p>
                      <p className="text-slate-700 font-semibold text-sm mt-0.5">{v}</p>
                    </div>
                  ))}
                  <div className="col-span-2 lg:col-span-4 bg-sky-50 rounded-xl p-3 border border-sky-100">
                    <p className="text-sky-700 text-xs font-semibold mb-1">Activity Tracker</p>
                    <p className="text-sky-600 text-xs">Total bookings: {u.bookings} · Cancellations: {u.cancellations} · Cancellation rate: {u.bookings ? Math.round((u.cancellations/u.bookings)*100) : 0}% · Status: {u.cancellations > 2 ? "⚠️ High cancellation rate" : "✅ Good standing"}</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "owners" && (
        <div className="space-y-3">
          {owners.map(o => (
            <Card key={o.id} cls="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar letter={o.avatar} color="violet" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="text-slate-800 font-bold text-sm">{o.name}</p><StatusBadge s={o.status} /></div>
                  <p className="text-slate-400 text-xs">{o.email}</p>
                </div>
                <div className="flex items-center gap-6 text-center">
                  <div><p className="text-violet-600 font-black text-lg">{o.vehicles}</p><p className="text-slate-400 text-xs">Vehicles</p></div>
                  <div><p className="text-emerald-600 font-black text-sm">{o.earnings}</p><p className="text-slate-400 text-xs">Earnings</p></div>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-100 transition-colors"><EyeIcon /> View</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: VEHICLES
// ════════════════════════════════════════════════════════════════
const VehiclesPage = ({ vehicles: initVehicles = [] }) => {
  const [vehicles, setVehicles] = useState(initVehicles);
  const [filter, setFilter] = useState("All");

  const approve = id => setVehicles(v => v.map(x => x.id === id ? { ...x, status: "approved" } : x));
  const reject  = id => setVehicles(v => v.map(x => x.id === id ? { ...x, status: "rejected" } : x));
  const del     = id => setVehicles(v => v.filter(x => x.id !== id));

  const filtered = filter === "All" ? vehicles : vehicles.filter(v => v.type === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {["All","Car","Bike","Scooty"].map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === t ? "bg-white text-sky-600 shadow-sm" : "text-slate-500"}`}>{t}</button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto text-xs">
          <span className="bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1.5 rounded-xl font-semibold">⏳ {vehicles.filter(v=>v.status==="pending").length} Pending</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(v => (
          <Card key={v.id} cls="p-4">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center text-4xl border border-slate-200 flex-shrink-0">{v.img}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-slate-800 font-bold text-sm">{v.name}</p>
                    <p className="text-slate-400 text-xs">{v.owner} · 📍{v.location}</p>
                  </div>
                  <StatusBadge s={v.status} />
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <ConditionTag c={v.condition} />
                  <Badge label={v.type} color="sky" />
                  <span className="text-slate-400 text-xs">₹{v.price}/day</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${v.aiScore >= 85 ? "bg-emerald-50 text-emerald-700" : v.aiScore >= 70 ? "bg-sky-50 text-sky-700" : "bg-red-50 text-red-700"}`}>
                    🤖 AI Score: {v.aiScore}/100
                  </div>
                  {pricingSuggestions.find(s => s.vehicleId === v.id) && (() => {
  const s = pricingSuggestions.find(x => x.vehicleId === v.id);
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.delta.startsWith('+') ? 'bg-red-50 text-red-700' : 'bg-sky-50 text-sky-700'}`}>
      💡 Suggested ₹{s.suggested}/day ({s.delta})
    </span>
  );
})()}
                  <span className="text-slate-400 text-xs">{v.bookings} trips</span>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {v.status === "pending" && <>
                    <button onClick={() => approve(v.id)} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-400 transition-colors"><CheckIcon /> Approve</button>
                    <button onClick={() => reject(v.id)} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-400 transition-colors"><XIcon /> Reject</button>
                  </>}
                  <button onClick={() => del(v.id)} className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"><TrashIcon /> Delete</button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: BOOKINGS
// ════════════════════════════════════════════════════════════════
const BookingsPage = ({ bookings: mockBookings = [] }) => {
  const [bookings, setBookings] = useState(mockBookings);
  const [filter, setFilter] = useState("All");
  const { dark } = useDark();
  const { from, to, setFrom, setTo } = useDateRange();

  const cancel = id => setBookings(b => b.map(x => x.id === id ? { ...x, status: "cancelled" } : x));
  const filtered = filter === "All" ? bookings : bookings.filter(b => b.status === filter.toLowerCase());
  const handleExport = () => exportCSV("bookings.csv", filtered, ["id","user","vehicle","type","from","to","amount","status"]);

  return (
    <div className="space-y-5">
      <DateRangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} onExport={handleExport} />
      <div className="flex items-center gap-3 flex-wrap">
        <div className={`flex rounded-xl p-1 gap-1 flex-wrap ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
          {["All","Ongoing","Upcoming","Completed","Cancelled"].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === s ? "bg-violet-500 text-white shadow-sm" : dark ? "text-slate-400" : "text-slate-500"}`}>{s}</button>
          ))}
        </div>
        {bookings.some(b => b.doubleBook) && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-xl">
            <AlertIcon /> Double booking conflict detected!
          </div>
        )}
      </div>

      {bookings.filter(b => b.status === "ongoing").length > 0 && (
        <Card cls="p-4 border-l-4 border-sky-400 bg-sky-50/50">
          <p className="text-sky-700 font-bold text-sm mb-3">🔴 Live Booking Tracker</p>
          <div className="flex flex-wrap gap-3">
            {bookings.filter(b => b.status === "ongoing").map(b => (
              <div key={b.id} className="bg-white rounded-xl px-4 py-2.5 border border-sky-200 text-sm">
                <p className="font-bold text-slate-800">{b.vehicle}</p>
                <p className="text-sky-600 text-xs">{b.user} · {b.from}→{b.to}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {filtered.map(b => (
          <Card key={b.id} cls="p-4 hover:border-slate-300 transition-all cursor-pointer hover:shadow-md">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                {b.type === "Car" && <Car size={20} className="text-slate-400" />}
                {b.type === "Bike" && <Bike size={20} className="text-slate-400" />}
                {b.type === "Scooty" && <Zap size={20} className="text-slate-400" />}
              </div>
              
              {/* Name & Details */}
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 font-semibold text-sm truncate">{b.user}</p>
                <p className="text-slate-500 text-xs truncate">{b.vehicle} · {b.from} → {b.to}</p>
              </div>
              
              {/* Status Badge */}
              <div className="flex-shrink-0">
                <StatusBadge s={b.status} />
              </div>
              
              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className="text-slate-900 font-semibold text-sm">₹{b.amount.toLocaleString()}</p>
              </div>
              
              {/* Chevron */}
              <ChevronRight size={20} className="text-slate-300 flex-shrink-0" />
            </div>
            
            {/* Extra badges row if needed */}
            {(b.doubleBook || cancellationRisk[b.id]) && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                {b.doubleBook && (
                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <AlertIcon size={14} /> Double Booking
                  </span>
                )}
                {cancellationRisk[b.id] && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cancellationRisk[b.id].score > 60 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    ⚡ Cancel risk: {cancellationRisk[b.id].label}
                  </span>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: TRANSACTIONS
// ════════════════════════════════════════════════════════════════
const TransactionsPage = ({ transactions: mockTransactions = [], cityRevenue = [], vehicleTypeRevenue = [] }) => {
  const [txns, setTxns] = useState(mockTransactions);
  const { dark } = useDark();
  const { from, to, setFrom, setTo } = useDateRange();

  const refund = id => setTxns(t => t.map(x => x.id === id ? { ...x, status: "refunded" } : x));
  const handleExport = () => exportCSV("transactions.csv", txns, ["id","booking","user","amount","tax","net","date","city","type","status","fraud"]);

  return (
    <div className="space-y-5">
      <DateRangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} onExport={handleExport} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Gross Revenue" value="₹12,191" delta="This week" icon="💵" color="emerald" />
        <StatCard label="Net Payout" value="₹9,995" delta="After tax" icon="📤" color="sky" />
        <StatCard label="Pending" value="₹1,474" delta="1 transaction" icon="⏳" color="blue" />
        <StatCard label="Refunded" value="₹983" delta="1 refund" icon="↩️" color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card cls="p-5">
          <h3 className="text-slate-800 font-bold mb-4">Revenue by City</h3>
          <div className="space-y-2.5">
            {cityRevenue.map(c => (
              <div key={c.city} className="flex items-center gap-3">
                <span className="text-slate-600 text-sm w-24">{c.city}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full" style={{ width: `${c.revenue}%` }} />
                </div>
                <span className="font-bold text-sm text-slate-700 w-8 text-right">{c.revenue}%</span>
              </div>
            ))}
          </div>
        </Card>
        <Card cls="p-5">
          <h3 className="text-slate-800 font-bold mb-4">Revenue by Vehicle Type</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={vehicleTypeRevenue.map(v => ({ name: v.name, value: v.value }))} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ borderRadius: "12px", fontSize: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card cls="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-800 font-bold">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead><tr className="text-xs text-slate-400 font-semibold border-b border-slate-100">
              {["Txn ID","Booking","User","Gross","GST","Net","Date","City","Status","Fraud"].map(h => <th key={h} className="text-left pb-2 pr-3 whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody>
              {txns.map(t => (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 pr-3 text-sky-600 font-semibold text-xs">{t.id}</td>
                  <td className="py-2.5 pr-3 text-slate-500 text-xs">{t.booking}</td>
                  <td className="py-2.5 pr-3 text-slate-700 font-medium text-xs">{t.user}</td>
                  <td className="py-2.5 pr-3 text-slate-700 text-xs">₹{t.amount.toLocaleString()}</td>
                  <td className="py-2.5 pr-3 text-slate-500 text-xs">₹{t.tax}</td>
                  <td className="py-2.5 pr-3 text-emerald-600 font-bold text-xs">₹{t.net.toLocaleString()}</td>
                  <td className="py-2.5 pr-3 text-slate-400 text-xs">{t.date}</td>
                  <td className="py-2.5 pr-3 text-slate-400 text-xs">{t.city}</td>
                  <td className="py-2.5 pr-3"><StatusBadge s={t.status} /></td>
                  <td className="py-2.5 pr-3">
                    {t.fraud ? <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">⚠️ Flagged</span> : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {txns.filter(t => t.status === "received").map(t => (
            <button key={t.id} onClick={() => refund(t.id)} className="text-xs bg-sky-50 text-sky-600 border border-sky-200 px-3 py-1.5 rounded-xl font-semibold hover:bg-sky-100 transition-colors">↩ Refund {t.id}</button>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: VERIFICATIONS
// ════════════════════════════════════════════════════════════════
const VerificationsPage = ({ verifications: mockVerifications = [] }) => {
  const [items, setItems] = useState(mockVerifications);

  const approve = id => setItems(v => v.map(x => x.id === id ? { ...x, status: "approved" } : x));
  const reject  = id => setItems(v => v.map(x => x.id === id ? { ...x, status: "rejected" } : x));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Pending" value={items.filter(i=>i.status==="pending").length} delta="Awaiting review" icon="⏳" color="blue" />
        <StatCard label="Approved" value={items.filter(i=>i.status==="approved").length} delta="Verified this week" icon="✅" color="emerald" />
        <StatCard label="AI Pass Rate" value="75%" delta="3/4 auto-cleared" icon="🤖" color="sky" />
      </div>

      <div className="space-y-3">
        {items.map(v => (
          <Card key={v.id} cls="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar letter={v.avatar} color="violet" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-slate-800 font-bold text-sm">{v.name}</p>
                  <StatusBadge s={v.status} />
                  <StatusBadge s={v.priority} />
                </div>
                <p className="text-slate-400 text-xs">{v.type} · {v.doc} · Submitted {v.submitted}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border ${v.aiCheck === "Pass" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                🤖 AI: {v.aiCheck}
              </div>
              {v.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => approve(v.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors"><CheckIcon /> Approve</button>
                  <button onClick={() => reject(v.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-400 transition-colors"><XIcon /> Reject</button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: REPORTS
// ════════════════════════════════════════════════════════════════
const ReportsPage = ({ reports: mockReports = [] }) => {
  const [reports, setReports] = useState(mockReports);
  const [chat, setChat] = useState(null);
  const [chatMsgs, setChatMsgs] = useState({});
  const [chatInput, setChatInput] = useState("");

  const resolve  = id => setReports(r => r.map(x => x.id === id ? { ...x, status: "resolved" } : x));
  const escalate = id => setReports(r => r.map(x => x.id === id ? { ...x, priority: "High" } : x));

  const sendMsg = (id) => {
    if (!chatInput.trim()) return;
    setChatMsgs(m => ({ ...m, [id]: [...(m[id] || ["Hello, we are reviewing your report."]), chatInput] }));
    setChatInput("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <span className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-3 py-1.5 rounded-xl">{reports.filter(r=>r.status==="open").length} Open</span>
        <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl">{reports.filter(r=>r.status==="resolved").length} Resolved</span>
      </div>

      {reports.sort((a,b) => a.priority === "High" ? -1 : 1).map(r => (
        <Card key={r.id} cls="p-5">
          <div className="flex flex-wrap items-start gap-4">
            <Avatar letter={r.avatar} color="blue" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-slate-800 font-bold text-sm">{r.reporter}</p>
                <StatusBadge s={r.status} />
                <StatusBadge s={r.priority} />
              </div>
              <p className="text-slate-500 text-xs">vs {r.against} · {r.type} · {r.date}</p>
              <p className="text-slate-700 text-sm mt-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">"{r.desc}"</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {r.status === "open" && (
                <>
                  <button onClick={() => resolve(r.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors"><CheckIcon /> Resolve</button>
                  <button onClick={() => escalate(r.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-200 hover:bg-red-100 transition-colors"><AlertIcon /> Escalate</button>
                </>
              )}
              <button onClick={() => setChat(chat === r.id ? null : r.id)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-200 transition-colors"><ChatIcon /> Chat</button>
            </div>
          </div>
          {chat === r.id && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 rounded-xl p-3 h-28 overflow-y-auto space-y-2 mb-2">
                {(chatMsgs[r.id] || ["Hello, we are reviewing your report."]).map((m, i) => (
                  <div key={i} className={`flex ${i % 2 !== 0 ? "justify-end" : ""}`}>
                    <span className={`text-xs px-3 py-1.5 rounded-xl max-w-[80%] ${i % 2 === 0 ? "bg-white border border-slate-200 text-slate-700" : "bg-sky-500 text-white"}`}>{m}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg(r.id)} placeholder="Reply to user..." className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-sky-400" />
                <button onClick={() => sendMsg(r.id)} className="bg-sky-500 text-white px-3 py-2 rounded-xl text-xs font-bold">Send</button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: ANALYTICS
// ════════════════════════════════════════════════════════════════
const AnalyticsPage = ({ bookingTrend = [], cityRevenue = [], vehicleTypeRevenue = [] }) => {
  const heatmapData = [
    {city:"Dehradun",Mon:65,Tue:70,Wed:68,Thu:80,Fri:95,Sat:100,Sun:90},
    {city:"Rishikesh",Mon:40,Tue:45,Wed:50,Thu:60,Fri:75,Sat:88,Sun:82},
    {city:"Mussoorie",Mon:50,Tue:55,Wed:52,Thu:70,Fri:90,Sat:98,Sun:94},
    {city:"Haridwar",Mon:30,Tue:35,Wed:38,Thu:45,Fri:60,Sat:72,Sun:65},
  ];
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const getColor = (v) => {
    if (v >= 90) return "bg-sky-600 text-white";
    if (v >= 70) return "bg-sky-400 text-white";
    if (v >= 50) return "bg-sky-200 text-sky-900";
    return "bg-slate-100 text-slate-500";
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[["Most Booked","Royal Enfield Meteor","42 trips · ₹37k","🏍️","sky"],["Top City","Dehradun","68% of bookings","📍","violet"],["Avg Booking Value","₹1,847","Per booking","💳","emerald"],["Peak Day","Saturday","100% demand index","📅","blue"]].map(([l,v,d,icon,c])=>(
          <Card key={l} cls="p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{icon}</span>
              <div>
                <p className={`text-${c}-600 text-xs font-semibold uppercase tracking-wide`}>{l}</p>
                <p className="text-slate-800 font-bold text-sm">{v}</p>
                <p className="text-slate-400 text-xs">{d}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Heatmap */}
      <Card cls="p-5">
        <h3 className="text-slate-800 font-bold mb-1">Demand Heatmap</h3>
        <p className="text-slate-400 text-xs mb-4">Booking demand by city and day (% of capacity)</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr>
                <th className="text-xs text-slate-400 font-semibold text-left pb-2 w-24">City</th>
                {days.map(d => <th key={d} className="text-xs text-slate-400 font-semibold pb-2 text-center">{d}</th>)}
              </tr>
            </thead>
            <tbody className="space-y-1">
              {heatmapData.map(row => (
                <tr key={row.city}>
                  <td className="text-slate-700 font-semibold text-xs py-1 pr-2">{row.city}</td>
                  {days.map(d => (
                    <td key={d} className="py-1 px-0.5">
                      <div className={`${getColor(row[d])} rounded-lg text-xs font-bold text-center py-1.5 min-w-[36px]`}>{row[d]}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100 border"/><span>Low</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-200"/><span>Medium</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-400"/><span>High</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-600"/><span>Peak</span></div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card cls="p-5">
          <h3 className="text-slate-800 font-bold mb-4">Vehicle Performance</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={vehicles.map(v => ({ name: v.name.split(" ").slice(0,2).join(" "), bookings: v.bookings }))} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", fontSize: 12 }} />
              <Bar dataKey="bookings" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card cls="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800 font-bold">AI Demand Prediction</h3>
            <span className="bg-violet-50 text-violet-600 border border-violet-200 text-xs font-bold px-2.5 py-1 rounded-xl">🤖 AI</span>
          </div>
          <div className="space-y-3">
            {[["Dehradun (Fri-Sun)","95% demand","Surge pricing recommended","sky"],["Mussoorie (Weekend)","88% demand","Near full capacity","emerald"],["Rishikesh (Sat)","75% demand","High, monitor closely","blue"],["Haridwar (Mon-Wed)","32% demand","Consider discounts","slate"]].map(([city,val,rec,c])=>(
              <div key={city} className={`flex items-center gap-3 p-3 bg-${c}-50 rounded-xl border border-${c}-100`}>
                <MapIcon />
                <div className="flex-1">
                  <p className="text-slate-800 font-semibold text-sm">{city}</p>
                  <p className="text-slate-500 text-xs">{rec}</p>
                </div>
                <span className={`text-${c === "slate" ? "slate-500" : c+"-600"} font-bold text-sm`}>{val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: PROMOTIONS
// ════════════════════════════════════════════════════════════════
const PromotionsPage = ({ promotions: initPromotions = [] }) => {
  const [promos, setPromos] = useState(initPromotions.length ? initPromotions : mockPromotionsStatic);
  const [discount, setDiscount] = useState(20);
  const [newCode, setNewCode] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const addPromo = () => {
    if (!newCode.trim()) return;
    setPromos(p => [...p, { id: Date.now(), code: newCode.toUpperCase(), type: "Percentage", discount, from: "Apr 10", to: "Apr 20", uses: 0, active: true }]);
    setNewCode("");
  };

  const aiSuggest = () => setAiSuggestion("Based on demand data: Run 'WEEKEND25' (25% off bikes) in Dehradun for Apr 12-13. Expected 45% booking increase. Also suggest 'EV10' for Nexon EV — below-average bookings this week.");

  return (
    <div className="space-y-5">
      <Card cls="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-800 font-bold text-base">Create New Promotion</h3>
          <button onClick={aiSuggest} className="flex items-center gap-1.5 bg-violet-50 text-violet-600 border border-violet-200 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-violet-100 transition-colors"><BotIcon /> AI Suggest</button>
        </div>
        {aiSuggestion && (
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-violet-700 text-sm">💡 {aiSuggestion}</div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">Coupon Code</label>
            <input value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="e.g. SUMMER25" className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400" />
          </div>
          <div>
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">Discount: {discount}%</label>
            <input type="range" min={5} max={50} step={5} value={discount} onChange={e => setDiscount(+e.target.value)} className="w-full mt-3 accent-sky-500" />
          </div>
          <div>
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">From Date</label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400" />
          </div>
          <div>
            <label className="text-slate-600 text-xs font-semibold mb-1.5 block">To Date</label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400" />
          </div>
        </div>
        <button onClick={addPromo} className="w-full py-3 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-black text-sm rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-sky-200">+ Create Promotion</button>
      </Card>

      <div className="space-y-3">
        {promos.map(p => (
          <Card key={p.id} cls="p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-center text-sky-600 font-black text-lg flex-shrink-0">{p.discount}%</div>
            <div className="flex-1">
              <p className="text-slate-800 font-bold">{p.code}</p>
              <p className="text-slate-400 text-xs">{p.type} · {p.from} – {p.to} · {p.uses} uses</p>
            </div>
            <Toggle on={p.active} onToggle={() => setPromos(pr => pr.map(x => x.id === p.id ? { ...x, active: !x.active } : x))} />
            <StatusBadge s={p.active ? "active" : "inactive"} />
          </Card>
        ))}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: NOTIFICATIONS
// ════════════════════════════════════════════════════════════════
const NotificationsPage = ({ notes, setNotes }) => {
  const [filter, setFilter] = useState("All");

  const markRead = id => setNotes(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const markAll  = ()  => setNotes(n => n.map(x => ({ ...x, read: true })));
  const clearAll = ()  => setNotes([]);

  const typeIcon = { booking: "📋", fraud: "⚠️", verification: "🪪", report: "🚨", system: "⚙️" };
  const typeColor= { booking: "sky", fraud: "red", verification: "violet", report: "amber", system: "slate" };

  const filtered = filter === "All" ? notes : filter === "Unread" ? notes.filter(n => !n.read) : notes.filter(n => n.type === filter.toLowerCase());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1 flex-wrap">
          {["All","Unread","Booking","Fraud","Verification"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? "bg-white text-sky-600 shadow-sm" : "text-slate-500"}`}>{f}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={markAll} className="text-sky-500 text-xs font-semibold hover:text-sky-600">Mark all read</button>
          <span className="text-slate-300">·</span>
          <button onClick={clearAll} className="text-red-400 text-xs font-semibold hover:text-red-500">Clear all</button>
        </div>
      </div>

      {filtered.length === 0 && <div className="text-center py-16 text-slate-400">No notifications</div>}

      {filtered.map(n => (
        <Card key={n.id} cls={`p-4 flex gap-3 cursor-pointer transition-all hover:shadow-md ${!n.read ? "border-l-4 border-sky-400" : ""}`} onClick={() => markRead(n.id)}>
          <div className={`w-10 h-10 rounded-xl bg-${typeColor[n.type]}-100 flex items-center justify-center text-lg flex-shrink-0`}>{typeIcon[n.type]}</div>
          <div className="flex-1">
            <p className={`text-sm ${n.read ? "text-slate-500" : "text-slate-800 font-semibold"}`}>{n.msg}</p>
            <p className="text-slate-400 text-xs mt-0.5">{n.time}</p>
          </div>
          {!n.read && <div className="w-2 h-2 bg-sky-500 rounded-full mt-2 flex-shrink-0" />}
        </Card>
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: PROFILE
// ════════════════════════════════════════════════════════════════
const ProfilePage = ({ adminUser = {}, onUpdateAdmin }) => {
  const [name,  setName]  = useState(adminUser.name  || "Admin User");
  const [email, setEmail] = useState(adminUser.email || "admin@ridehive.in");
  const [phone, setPhone] = useState(adminUser.phone || "+91 98765 00000");
  const [saved, setSaved] = useState(false);
  const handleSave = () => { if (onUpdateAdmin) onUpdateAdmin({ name, email, phone }); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
  <div className="max-w-2xl mx-auto space-y-5">
    <Card cls="p-6">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <Avatar letter={name.charAt(0).toUpperCase()} color="violet" size="lg" />
        <div>
          <h3 className="text-slate-800 font-black text-xl">{name}</h3>
          <p className="text-slate-400 text-sm">{adminUser.role || "Super Admin"} · RideHive Platform</p>
          <Badge label={`🛡️ ${adminUser.role || "Super Admin"}`} color="violet" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[["Full Name", name, setName],["Email", email, setEmail],["Phone", phone, setPhone]].map(([l,v,setter])=>(
          <div key={l}>
            <label className="text-slate-500 text-xs font-semibold mb-1.5 block">{l}</label>
            <input value={v} onChange={e=>setter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-400" />
          </div>
        ))}
        {[["Role", adminUser.role || "Super Admin"],["Joined","Jan 2024"],["Last Login","Today, 9:30 AM"]].map(([l,v])=>(
          <div key={l}>
            <label className="text-slate-500 text-xs font-semibold mb-1.5 block">{l}</label>
            <input defaultValue={v} readOnly className="w-full bg-slate-100 border border-slate-200 text-slate-400 px-3 py-2.5 rounded-xl text-sm cursor-not-allowed" />
          </div>
        ))}
      </div>
      <button onClick={handleSave} className={`mt-4 w-full py-2.5 font-bold text-sm rounded-xl transition-colors ${saved ? "bg-emerald-500 text-white" : "bg-sky-500 hover:bg-sky-400 text-white"}`}>{saved ? "✓ Saved!" : "Save Profile"}</button>
    </Card>
  </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: SETTINGS
// ════════════════════════════════════════════════════════════════
const SettingsPage = () => {
  const [notifs, setNotifs] = useState({ booking: true, fraud: true, verification: true, reports: true, system: false });
  const [cancellation, setCancellation] = useState("24h");
  const [roles, setRoles] = useState([
    { id: 1, name: "Super Admin", permissions: ["All access"], active: true },
    { id: 2, name: "Booking Manager", permissions: ["Bookings", "Users"], active: true },
    { id: 3, name: "Finance Admin", permissions: ["Transactions", "Reports"], active: false },
    { id: 4, name: "Verifier", permissions: ["Verifications", "KYC"], active: true },
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Card cls="p-6 divide-y divide-slate-100">
        <div className="pb-4">
          <h3 className="text-slate-800 font-bold mb-4">Change Password</h3>
          <div className="space-y-3">
            {["Current Password","New Password","Confirm Password"].map(p => (
              <PwInput key={p} placeholder={p} />
            ))}
            <button className="w-full py-2.5 bg-sky-500 text-white font-bold text-sm rounded-xl hover:bg-sky-400 transition-colors">Update Password</button>
          </div>
        </div>
        <div className="pt-4">
          <h3 className="text-slate-800 font-bold mb-3">Two-Factor Authentication</h3>
          <div className="flex items-center justify-between">
            <div><p className="text-slate-700 text-sm">Enable 2FA</p><p className="text-slate-400 text-xs">Adds an extra layer of security</p></div>
            <Toggle on={true} onToggle={() => {}} />
          </div>
        </div>
      </Card>

      <Card cls="p-6 space-y-4">
        <h3 className="text-slate-800 font-bold border-b border-slate-100 pb-3">Notification Preferences</h3>
        {[["booking","New Bookings"],["fraud","Fraud Alerts"],["verification","KYC Submissions"],["reports","Damage Reports"],["system","System Updates"]].map(([k,l]) => (
          <div key={k} className="flex items-center justify-between">
            <p className="text-slate-700 text-sm">{l}</p>
            <Toggle on={notifs[k]} onToggle={() => setNotifs(n => ({ ...n, [k]: !n[k] }))} />
          </div>
        ))}
      </Card>

      <Card cls="p-6 space-y-4">
        <h3 className="text-slate-800 font-bold border-b border-slate-100 pb-3">Cancellation Policy</h3>
        <div className="grid grid-cols-3 gap-2">
          {[["flexible","Flexible"],["24h","24 Hours"],["strict","Strict"]].map(([v,l]) => (
            <button key={v} onClick={() => setCancellation(v)} className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${cancellation === v ? "bg-sky-500 border-sky-500 text-white" : "border-slate-200 text-slate-600 hover:border-sky-300"}`}>{l}</button>
          ))}
        </div>
      </Card>

      <Card cls="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-slate-800 font-bold">Role-Based Access Control</h3>
          <button className="flex items-center gap-1 text-xs bg-sky-50 text-sky-600 border border-sky-200 px-3 py-1.5 rounded-xl font-semibold hover:bg-sky-100 transition-colors"><PlusIcon /> Add Role</button>
        </div>
        <div className="space-y-3">
          {roles.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 flex-shrink-0"><LockIcon /></div>
              <div className="flex-1">
                <p className="text-slate-800 font-semibold text-sm">{r.name}</p>
                <p className="text-slate-400 text-xs">{r.permissions.join(" · ")}</p>
              </div>
              <Toggle on={r.active} onToggle={() => setRoles(rl => rl.map(x => x.id === r.id ? { ...x, active: !x.active } : x))} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// LOGIN GATE
// ════════════════════════════════════════════════════════════════
const OwnerPayoutPage = ({ owners: initOwners = [] }) => {
  // Map owners CSV data to payout shape expected by the UI
  const csvPayouts = initOwners.map(o => ({
    id: o.id,
    owner: o.name,
    avatar: o.avatar || o.name?.[0] || "O",
    vehicles: o.vehicles,
    earned: o.earned,
    platform: o.platform,
    net: o.net,
    status: o.status === "overdue" ? "pending" : (o.status || "pending"),
    date: o.lastPayoutDate || "—",
    bank: o.bank ? `${o.bank} ${o.account}` : "—",
  }));
  const [payouts, setPayouts] = useState(csvPayouts.length ? csvPayouts : mockPayouts);
  // Re-sync when CSV data arrives
  const prevLen = payouts.length;
  if (csvPayouts.length && prevLen === 0) setPayouts(csvPayouts);
  const { dark } = useDark();
  const txt = dark ? "text-slate-100" : "text-slate-800";
  const sub = dark ? "text-slate-400" : "text-slate-400";

  const totalPending = payouts.filter(p => p.status === "pending").reduce((s, p) => s + p.net, 0);
  const totalPaid    = payouts.filter(p => p.status === "paid").reduce((s, p) => s + p.net, 0);
  const platformFees = payouts.reduce((s, p) => s + p.platform, 0);

  const release = id => setPayouts(p => p.map(x => x.id === id ? { ...x, status:"paid" } : x));
  const retry   = id => setPayouts(p => p.map(x => x.id === id ? { ...x, status:"pending" } : x));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Payouts" value={`₹${(totalPending/1000).toFixed(1)}k`} delta={`${payouts.filter(p=>p.status==="pending").length} owners`} icon="⏳" color="amber" />
        <StatCard label="Paid Out"        value={`₹${(totalPaid/1000).toFixed(1)}k`}    delta="This cycle"    icon="✅" color="emerald" />
        <StatCard label="Platform Fees"   value={`₹${(platformFees/1000).toFixed(1)}k`} delta="10% commission" icon="🏦" color="violet" />
        <StatCard label="Failed"          value={payouts.filter(p=>p.status==="failed").length} delta="Need retry" icon="❌" color="sky" />
      </div>

      <Card cls="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className={`font-bold ${txt}`}>Owner Payout Schedule</h3>
            <p className={`text-xs mt-0.5 ${sub}`}>10% platform commission deducted automatically</p>
          </div>
          <button onClick={() => exportCSV("payouts.csv", payouts, ["id","owner","vehicles","earned","platform","net","status","date","bank"])}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors">
            <DownloadIcon /> Export CSV
          </button>
        </div>
        <div className="space-y-3">
          {payouts.map(p => (
            <div key={p.id} className={`p-4 rounded-xl border ${dark ? "border-slate-700 bg-slate-700/30" : "border-slate-100 bg-slate-50"}`}>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar letter={p.avatar} color="violet" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-bold text-sm ${txt}`}>{p.owner}</p>
                    <Badge label={`${p.vehicles} vehicles`} color="sky" />
                    <StatusBadge s={p.status} />
                  </div>
                  <p className={`text-xs mt-0.5 ${sub}`}>{p.bank} · Due {p.date}</p>
                </div>
                <div className="flex gap-6 text-center">
                  <div><p className="text-slate-500 text-xs">Earned</p><p className={`font-bold text-sm ${txt}`}>₹{p.earned.toLocaleString()}</p></div>
                  <div><p className="text-slate-500 text-xs">Fee</p><p className="font-bold text-sm text-red-500">−₹{p.platform.toLocaleString()}</p></div>
                  <div><p className="text-slate-500 text-xs">Net</p><p className="font-bold text-sm text-emerald-600">₹{p.net.toLocaleString()}</p></div>
                </div>
                <div className="flex gap-2">
                  {p.status === "pending" && (
                    <button onClick={() => release(p.id)} className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors">Release</button>
                  )}
                  {p.status === "failed" && (
                    <button onClick={() => retry(p.id)} className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-400 transition-colors">Retry</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
const ActivityAuditPage = ({ auditLog: mockAuditLog = [] }) => {
  const [filter, setFilter] = useState("All");
  const { dark } = useDark();
  const txt = dark ? "text-slate-100" : "text-slate-800";
  const sub = dark ? "text-slate-400" : "text-slate-400";

  const filtered = filter === "All" ? mockAuditLog : mockAuditLog.filter(l => l.severity === filter.toLowerCase());

  const pageColors = {
    vehicles:"sky", users:"violet", transactions:"emerald", reports:"red",
    promotions:"amber", verifications:"purple", bookings:"sky", auth:"slate", settings:"slate",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className={`flex rounded-xl p-1 gap-1 ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
          {["All","Info","Warning"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? "bg-violet-500 text-white" : dark ? "text-slate-400" : "text-slate-500"}`}>
              {f}
            </button>
          ))}
        </div>
        <p className={`text-xs ${sub}`}>{filtered.length} entries</p>
      </div>

      <Card cls="p-5">
        <div className="space-y-2">
          {filtered.map(log => (
            <div key={log.id} className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border transition-colors ${dark ? "border-slate-700 hover:bg-slate-700/40" : "border-slate-100 hover:bg-slate-50"}`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.severity === "warning" ? "bg-amber-400" : "bg-emerald-400"}`} />
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${txt}`}>{log.action}</p>
                <p className={`text-xs ${sub} truncate`}>{log.target}</p>
              </div>
              <Badge label={log.page} color={pageColors[log.page] || "slate"} />
              <p className={`text-xs ${sub} w-16 text-right`}>{log.time}</p>
              <p className={`text-xs font-mono ${sub} hidden lg:block`}>{log.ip}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
const VehicleMapPage = () => {
  const [filter, setFilter] = useState("All");
  const [activeCity, setActiveCity] = useState(null);
  const { dark } = useDark();
  const txt = dark ? "text-slate-100" : "text-slate-800";
  const sub = dark ? "text-slate-400" : "text-slate-400";

  const filtered = filter === "All" ? vehiclesWithCoords : vehiclesWithCoords.filter(v => v.type === filter);
  const cities = ["Dehradun","Rishikesh","Mussoorie","Haridwar"];

  const cityMeta = {
    Dehradun:  { x:"30%", y:"55%", color:"#8b5cf6", count: filtered.filter(v=>v.city==="Dehradun").length  },
    Rishikesh: { x:"55%", y:"70%", color:"#0ea5e9", count: filtered.filter(v=>v.city==="Rishikesh").length },
    Mussoorie: { x:"28%", y:"38%", color:"#10b981", count: filtered.filter(v=>v.city==="Mussoorie").length },
    Haridwar:  { x:"62%", y:"80%", color:"#f59e0b", count: filtered.filter(v=>v.city==="Haridwar").length  },
  };

  const statusColor = { approved:"emerald", pending:"amber", rejected:"red" };

  const scrollTo = (city) => {
    setActiveCity(city);
    document.getElementById(`city-${city}`)?.scrollIntoView({ behavior:"smooth", block:"start" });
  };

  return (
    <div className="space-y-5">
      <div className={`flex rounded-xl p-1 gap-1 w-fit ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
        {["All","Car","Bike","Scooty"].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === t ? "bg-violet-500 text-white" : dark ? "text-slate-400" : "text-slate-500"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Static SVG Map */}
      <Card cls="p-5">
        <h3 className={`font-bold mb-3 ${txt}`}>Uttarakhand Vehicle Map</h3>
        <div className="relative w-full h-52 rounded-xl overflow-hidden" style={{ background: dark ? "#1e3a2f" : "#d1fae5" }}>
          {/* Mountain silhouette */}
          <svg viewBox="0 0 800 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <polygon points="0,200 100,80 200,140 320,40 440,120 560,60 680,100 800,50 800,200" fill={dark ? "#14532d" : "#86efac"} />
            <polygon points="0,200 150,110 280,160 400,90 520,140 650,80 800,110 800,200" fill={dark ? "#166534" : "#4ade80"} opacity="0.5" />
          </svg>
          {/* River line */}
          <svg viewBox="0 0 800 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <path d="M 400,60 Q 480,100 520,150 T 650,190" stroke="#60a5fa" strokeWidth="3" fill="none" opacity="0.7" />
          </svg>
          {/* City pins */}
          {cities.map(city => {
            const m = cityMeta[city];
            return (
              <button key={city} onClick={() => scrollTo(city)}
                style={{ left: m.x, top: m.y, transform:"translate(-50%,-50%)" }}
                className="absolute flex flex-col items-center gap-1 group">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs transition-transform group-hover:scale-110"
                    style={{ background: m.color }}>
                    {m.count}
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-b-2 border-r-2 border-white"
                    style={{ background: m.color }} />
                </div>
                <span className="text-[10px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap">{city}</span>
              </button>
            );
          })}
        </div>
        <p className={`text-xs mt-2 ${sub}`}>Click a city pin to jump to its vehicles · Showing {filtered.length} vehicles</p>
      </Card>

      {/* City sections */}
      {cities.map(city => {
        const cityVehicles = filtered.filter(v => v.city === city);
        if (cityVehicles.length === 0) return null;
        return (
          <div key={city} id={`city-${city}`}>
            <Card cls="p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">📍</span>
                <h3 className={`font-bold ${txt}`}>{city}</h3>
                <Badge label={`${cityVehicles.length} vehicles`} color="sky" />
                {activeCity === city && <Badge label="Selected" color="violet" />}
              </div>
              <div className="flex flex-wrap gap-3">
                {cityVehicles.map(v => (
                  <div key={v.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${dark ? "border-slate-600 bg-slate-700" : "border-slate-200 bg-slate-50"}`}>
                    <span className="text-xl">{v.img}</span>
                    <div>
                      <p className={`text-xs font-bold ${txt}`}>{v.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-xs ${sub}`}>₹{v.price}/day</span>
                        <StatusBadge s={v.status} />
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${v.aiScore >= 85 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          🤖{v.aiScore}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};
const IntelligencePage = ({ bookings: mockBookings = [] }) => {
  const [tab, setTab] = useState("risk");
  const [suggestions, setSuggestions] = useState(pricingSuggestions);
  const { dark } = useDark();
  const txt = dark ? "text-slate-100" : "text-slate-800";
  const sub = dark ? "text-slate-400" : "text-slate-400";

  const applyPrice = (vehicleId, suggested) => {
    setSuggestions(s => s.map(x => x.vehicleId === vehicleId ? { ...x, current: suggested, applied: true } : x));
  };

  return (
    <div className="space-y-5">
      <div className={`flex rounded-xl p-1 gap-1 w-fit ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
        {[["risk","⚡ Cancel Risk"],["pricing","💡 Dynamic Pricing"],["trust","🛡️ Trust Scores"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === k ? "bg-violet-500 text-white" : dark ? "text-slate-400" : "text-slate-500"}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === "risk" && (
        <Card cls="p-5">
          <h3 className={`font-bold mb-4 ${txt}`}>Cancellation Risk per Booking</h3>
          <div className="space-y-3">
            {mockBookings.map(b => {
              const risk = cancellationRisk[b.id] || { score:0, label:"Low" };
              return (
                <div key={b.id} className={`p-3 rounded-xl border ${dark ? "border-slate-700" : "border-slate-100"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar letter={b.avatar} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-sm ${txt}`}>{b.user}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${risk.score > 60 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"}`}>
                          {risk.label} Risk
                        </span>
                      </div>
                      <p className={`text-xs ${sub}`}>{b.vehicle} · {b.from} → {b.to}</p>
                    </div>
                    <span className={`font-black text-lg ${risk.score > 60 ? "text-red-500" : "text-emerald-500"}`}>{risk.score}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
                    <div className={`h-2 rounded-full transition-all ${risk.score > 60 ? "bg-red-400" : risk.score > 30 ? "bg-amber-400" : "bg-emerald-400"}`}
                      style={{ width:`${risk.score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {tab === "pricing" && (
        <Card cls="p-5">
          <h3 className={`font-bold mb-1 ${txt}`}>AI Dynamic Pricing Suggestions</h3>
          <p className={`text-xs mb-4 ${sub}`}>Based on demand, market rates, and booking patterns</p>
          <div className="space-y-3">
            {suggestions.map(s => (
              <div key={s.vehicleId} className={`p-4 rounded-xl border ${dark ? "border-slate-700 bg-slate-700/30" : "border-slate-100 bg-slate-50"}`}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-sm ${txt}`}>{s.name}</p>
                      {s.urgent && <Badge label="Urgent" color="red" />}
                      {s.applied && <Badge label="Applied ✓" color="green" />}
                    </div>
                    <p className={`text-xs mt-0.5 ${sub}`}>{s.reason}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className={`text-xs ${sub}`}>Current</p>
                      <p className={`font-bold text-sm ${txt}`}>₹{s.current}</p>
                    </div>
                    <span className="text-slate-400 text-lg">→</span>
                    <div className="text-center">
                      <p className={`text-xs ${sub}`}>Suggested</p>
                      <p className={`font-bold text-sm ${s.delta.startsWith("+") ? "text-emerald-600" : "text-red-500"}`}>₹{s.suggested}</p>
                    </div>
                    <Badge label={s.delta} color={s.delta.startsWith("+") ? "green" : "sky"} />
                  </div>
                  {!s.applied && (
                    <button onClick={() => applyPrice(s.vehicleId, s.suggested)}
                      className="px-3 py-1.5 bg-violet-500 text-white rounded-xl text-xs font-bold hover:bg-violet-400 transition-colors">
                      Apply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "trust" && (
        <Card cls="p-5">
          <h3 className={`font-bold mb-4 ${txt}`}>User Trust Scores</h3>
          <div className="space-y-3">
            {users.map(u => {
              const ts = trustScores[u.id] || { score:50, label:"Unknown", color:"slate", factors:{} };
              return (
                <div key={u.id} className={`p-4 rounded-xl border ${dark ? "border-slate-700" : "border-slate-100"}`}>
                  <div className="flex flex-wrap items-center gap-4">
                    <Avatar letter={u.avatar} color={ts.color === "emerald" ? "emerald" : ts.color === "red" ? "amber" : "sky"} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-bold text-sm ${txt}`}>{u.name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-${ts.color}-100 text-${ts.color}-700`}>{ts.label}</span>
                      </div>
                      <div className={`w-full h-2 rounded-full mb-2 ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
                        <div className={`h-2 rounded-full bg-${ts.color}-400 transition-all`} style={{ width:`${ts.score}%` }} />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${dark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>📋 {ts.factors.bookings} bookings</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${dark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>❌ {ts.factors.cancellationRate} cancel</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${dark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>⚠️ {ts.factors.disputeRate} disputes</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${ts.factors.verified ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>{ts.factors.verified ? "✅ Verified" : "❌ Unverified"}</span>
                      </div>
                    </div>
                    <p className={`font-black text-2xl ${ts.color === "emerald" ? "text-emerald-500" : ts.color === "red" ? "text-red-500" : ts.color === "amber" ? "text-amber-500" : "text-sky-500"}`}>{ts.score}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
const EmailTemplatesPage = () => {
  const [templates, setTemplates] = useState(emailTemplates);
  const [editing, setEditing] = useState(null);
  const { dark } = useDark();
  const txt = dark ? "text-slate-100" : "text-slate-800";
  const sub = dark ? "text-slate-400" : "text-slate-400";

  const dummyBody = (name) => `Hi {{user_name}},\n\n${name === "Booking Confirmation" ? "Your booking has been confirmed! Here are the details:\n\nVehicle: {{vehicle_name}}\nDates: {{from_date}} → {{to_date}}\nAmount: ₹{{amount}}\n\nEnjoy your ride!" : name === "Cancellation Notice" ? "We're sorry to inform you that your booking has been cancelled.\n\nBooking ID: {{booking_id}}\nRefund (if applicable) will be processed within 3–5 business days." : name === "KYC Approved" ? "Great news! Your KYC verification has been approved.\n\nYou can now access all features on RideHive.\n\nWelcome aboard!" : "Thank you for using RideHive.\n\nThis is an automated message regarding your account activity."}\n\nWarm regards,\nTeam RideHive`;

  const toggle = id => setTemplates(t => t.map(x => x.id === id ? { ...x, active:!x.active } : x));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Active Templates" value={templates.filter(t=>t.active).length} delta="Sending now" icon="📧" color="emerald" />
        <StatCard label="Inactive"         value={templates.filter(t=>!t.active).length} delta="Paused"    icon="⏸️" color="amber" />
        <StatCard label="Total Templates"  value={templates.length}                       delta="All time"  icon="📋" color="sky" />
      </div>

      <div className="space-y-3">
        {templates.map(t => (
          <Card key={t.id} cls="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${dark ? "bg-slate-700" : "bg-slate-100"}`}>📧</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-sm ${txt}`}>{t.name}</p>
                  <Badge label={t.active ? "Active" : "Inactive"} color={t.active ? "green" : "slate"} />
                </div>
                <p className={`text-xs ${sub} truncate`}>{t.subject}</p>
                <p className={`text-xs ${sub}`}>{t.trigger} · Last sent {t.lastSent}</p>
              </div>
              <div className="flex items-center gap-2">
                <Toggle on={t.active} onToggle={() => toggle(t.id)} />
                <button onClick={() => setEditing(editing === t.id ? null : t.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${dark ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  <EditIcon /> Edit
                </button>
              </div>
            </div>
            {editing === t.id && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div>
                  <label className={`text-xs font-semibold mb-1 block ${sub}`}>Subject</label>
                  <input defaultValue={t.subject} className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:border-violet-400 ${dark ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"}`} />
                </div>
                <div>
                  <label className={`text-xs font-semibold mb-1 block ${sub}`}>Body</label>
                  <textarea rows={6} defaultValue={dummyBody(t.name)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-violet-400 font-mono resize-none ${dark ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"}`} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(null)} className="px-4 py-2 bg-violet-500 text-white rounded-xl text-xs font-bold hover:bg-violet-400 transition-colors">Save Template</button>
                  <button onClick={() => setEditing(null)} className={`px-4 py-2 rounded-xl text-xs font-semibold border ${dark ? "border-slate-600 text-slate-400" : "border-slate-200 text-slate-500"}`}>Cancel</button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
const PlatformHealthPage = () => {
  const { dark } = useDark();
  const txt = dark ? "text-slate-100" : "text-slate-800";
  const sub = dark ? "text-slate-400" : "text-slate-400";

  const statusDot = (s) => s === "operational" ? "bg-emerald-400" : s === "degraded" ? "bg-amber-400" : "bg-red-500";
  const statusLabel = (s) => s === "operational" ? "Operational" : s === "degraded" ? "Degraded" : "Down";
  const statusColor = (s) => s === "operational" ? "emerald" : s === "degraded" ? "amber" : "red";

  const services = [
    { name:"Payment Gateway", key:"paymentGateway", icon:"💳" },
    { name:"Email Service",   key:"emailService",   icon:"📧" },
    { name:"SMS Gateway",     key:"smsGateway",     icon:"📱" },
    { name:"Map Service",     key:"mapService",     icon:"🗺️" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Uptime"             value={`${platformHealth.uptime}%`}         delta="Last 30 days"   icon="🟢" color="emerald" />
        <StatCard label="API Latency"        value={`${platformHealth.apiLatency}ms`}    delta="Avg response"   icon="⚡" color="sky"     />
        <StatCard label="Error Rate"         value={`${platformHealth.errorRate}%`}      delta="All endpoints"  icon="🔴" color="amber"   />
        <StatCard label="Active Connections" value={platformHealth.activeConnections}    delta="Right now"      icon="🔗" color="violet"  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card cls="p-5">
          <h3 className={`font-bold mb-4 ${txt}`}>Service Status</h3>
          <div className="space-y-3">
            {services.map(svc => {
              const status = platformHealth[svc.key];
              return (
                <div key={svc.key} className={`flex items-center gap-3 p-3 rounded-xl border ${dark ? "border-slate-700 bg-slate-700/30" : "border-slate-100 bg-slate-50"}`}>
                  <span className="text-xl">{svc.icon}</span>
                  <p className={`flex-1 font-semibold text-sm ${txt}`}>{svc.name}</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusDot(status)} ${status === "operational" ? "shadow-sm shadow-emerald-300" : ""}`} />
                    <Badge label={statusLabel(status)} color={statusColor(status)} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card cls="p-5">
          <h3 className={`font-bold mb-4 ${txt}`}>Resource Usage</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-1.5">
                <p className={`text-sm font-semibold ${txt}`}>Storage Used</p>
                <p className={`text-sm font-bold ${platformHealth.storageUsed > 80 ? "text-red-500" : "text-emerald-600"}`}>{platformHealth.storageUsed}%</p>
              </div>
              <div className={`w-full h-3 rounded-full ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
                <div className={`h-3 rounded-full transition-all ${platformHealth.storageUsed > 80 ? "bg-red-400" : "bg-emerald-400"}`}
                  style={{ width:`${platformHealth.storageUsed}%` }} />
              </div>
              <p className={`text-xs mt-1 ${sub}`}>{platformHealth.storageUsed}GB of 100GB used</p>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <p className={`text-sm font-semibold ${txt}`}>DB Response Time</p>
                <p className="text-sm font-bold text-sky-600">{platformHealth.dbResponseTime}ms</p>
              </div>
              <div className={`w-full h-3 rounded-full ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
                <div className="h-3 rounded-full bg-sky-400 transition-all" style={{ width:`${(platformHealth.dbResponseTime/200)*100}%` }} />
              </div>
              <p className={`text-xs mt-1 ${sub}`}>Target: under 100ms · Status: excellent</p>
            </div>

            <div className={`p-3 rounded-xl border ${dark ? "border-emerald-800 bg-emerald-900/20" : "border-emerald-200 bg-emerald-50"}`}>
              <p className="text-emerald-600 font-bold text-sm">✅ All critical systems normal</p>
              <p className={`text-xs mt-0.5 ${sub}`}>SMS gateway running at degraded capacity — team notified</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
const CustomWidgetsPage = ({ widgets, setWidgets }) => {
  const { dark } = useDark();
  const txt = dark ? "text-slate-100" : "text-slate-800";
  const sub = dark ? "text-slate-400" : "text-slate-400";

  const toggle  = id => setWidgets(w => w.map(x => x.id === id ? { ...x, visible:!x.visible } : x));
  const moveUp  = id => setWidgets(w => {
    const sorted = [...w].sort((a,b) => a.order - b.order);
    const idx = sorted.findIndex(x => x.id === id);
    if (idx === 0) return w;
    const copy = [...sorted];
    [copy[idx-1].order, copy[idx].order] = [copy[idx].order, copy[idx-1].order];
    return copy;
  });
  const moveDown = id => setWidgets(w => {
    const sorted = [...w].sort((a,b) => a.order - b.order);
    const idx = sorted.findIndex(x => x.id === id);
    if (idx === sorted.length - 1) return w;
    const copy = [...sorted];
    [copy[idx+1].order, copy[idx].order] = [copy[idx].order, copy[idx+1].order];
    return copy;
  });

  const sorted = [...widgets].sort((a,b) => a.order - b.order);
  const visible = sorted.filter(w => w.visible);

  return (
    <div className="space-y-5">
      {/* Preview */}
      <Card cls="p-5">
        <h3 className={`font-bold mb-3 ${txt}`}>Dashboard Preview</h3>
        <p className={`text-xs mb-4 ${sub}`}>This is how your stat row will look</p>
        {visible.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No widgets selected — toggle some below</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {visible.map(w => (
              <StatCard key={w.id} label={w.label} value={w.value} delta={w.delta} icon={w.icon} color={w.color} />
            ))}
          </div>
        )}
      </Card>

      {/* Widget list */}
      <Card cls="p-5">
        <h3 className={`font-bold mb-4 ${txt}`}>Manage Widgets</h3>
        <div className="space-y-2">
          {sorted.map(w => (
            <div key={w.id} className={`flex items-center gap-3 p-3 rounded-xl border ${dark ? "border-slate-700 bg-slate-700/30" : "border-slate-100 bg-slate-50"}`}>
              <span className="text-xl w-8 text-center">{w.icon}</span>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${txt}`}>{w.label}</p>
                <p className={`text-xs ${sub}`}>{w.value} · {w.delta}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveUp(w.id)} className={`p-1.5 rounded-lg transition-colors ${dark ? "hover:bg-slate-600 text-slate-400" : "hover:bg-slate-200 text-slate-400"}`}>▲</button>
                <button onClick={() => moveDown(w.id)} className={`p-1.5 rounded-lg transition-colors ${dark ? "hover:bg-slate-600 text-slate-400" : "hover:bg-slate-200 text-slate-400"}`}>▼</button>
              </div>
              <Toggle on={w.visible} onToggle={() => toggle(w.id)} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
const LoginGate = ({ onLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return; }
    if (password.length < 4) { setError("Password must be at least 4 characters."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ name: name.trim(), email: email.trim(), role: "Super Admin" });
    }, 900);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center p-4" style={{ fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box}`}</style>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/40 mx-auto mb-4">
            <span className="text-white font-black text-xl">RH</span>
          </div>
          <h1 className="text-white font-black text-2xl">RideHive Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your admin panel</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold px-4 py-2.5 rounded-xl">{error}</div>
          )}

          <div className="space-y-1">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Full Name</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="e.g. Arjun Sharma"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="admin@ridehive.in"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors pr-12"
              />
              <button onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-xs font-semibold">
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-violet-500/30 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">RideHive Admin Panel · Uttarakhand</p>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// ROOT APP — Login Gate → Admin Dashboard
// ════════════════════════════════════════════════════════════════

const calendarBookings = [
  { id:"BK001", user:"Priya Mehta",   vehicle:"Royal Enfield Meteor", type:"Bike",   from:"2024-04-10", to:"2024-04-12", status:"ongoing",   avatar:"P", color:"sky" },
  { id:"BK002", user:"Rahul Singh",   vehicle:"Honda Activa 6G",      type:"Scooty", from:"2024-04-09", to:"2024-04-09", status:"upcoming",  avatar:"R", color:"red",    conflict:true },
  { id:"BK003", user:"Ananya Gupta",  vehicle:"Tata Nexon EV",        type:"Car",    from:"2024-04-11", to:"2024-04-14", status:"upcoming",  avatar:"A", color:"violet" },
  { id:"BK004", user:"Vikram Rao",    vehicle:"Maruti Swift",          type:"Car",    from:"2024-04-08", to:"2024-04-10", status:"completed", avatar:"V", color:"green" },
  { id:"BK005", user:"Sneha Joshi",   vehicle:"KTM Duke 390",          type:"Bike",   from:"2024-04-07", to:"2024-04-08", status:"completed", avatar:"S", color:"emerald" },
  { id:"BK006", user:"Amit Sharma",   vehicle:"TVS Jupiter",           type:"Scooty", from:"2024-04-12", to:"2024-04-13", status:"cancelled", avatar:"A", color:"slate" },
  { id:"BK007", user:"Nisha Patel",   vehicle:"Royal Enfield Classic", type:"Bike",   from:"2024-04-15", to:"2024-04-18", status:"upcoming",  avatar:"N", color:"sky" },
  { id:"BK008", user:"Dev Kumar",     vehicle:"Honda City",            type:"Car",    from:"2024-04-09", to:"2024-04-11", status:"ongoing",   avatar:"D", color:"red",    conflict:true },
  { id:"BK009", user:"Priya Mehta",   vehicle:"TVS Jupiter",           type:"Scooty", from:"2024-04-20", to:"2024-04-22", status:"upcoming",  avatar:"P", color:"violet" },
  { id:"BK010", user:"Rahul Singh",   vehicle:"Tata Nexon EV",         type:"Car",    from:"2024-04-25", to:"2024-04-27", status:"upcoming",  avatar:"R", color:"sky" },
];

// ════════════════════════════════════════════════════════════════
// PAGE: BOOKING CALENDAR
// ════════════════════════════════════════════════════════════════

const BookingCalendarPage = ({ bookings: mockBookings = [] }) => {
  const { dark } = useDark();
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 3, 1)); // April 2024
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewMode, setViewMode] = useState("month"); // "month" | "week"

  const txt  = dark ? "text-slate-100" : "text-slate-800";
  const sub  = dark ? "text-slate-400" : "text-slate-400";
  const cell = dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100";
  const hdr  = dark ? "bg-slate-700" : "bg-slate-50";

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  // Parse bookings into date ranges
  const getBookingsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return calendarBookings.filter(b => {
      return dateStr >= b.from && dateStr <= b.to;
    });
  };

  const statusColor = {
    ongoing:   "bg-sky-500",
    upcoming:  "bg-violet-500",
    completed: "bg-emerald-500",
    cancelled: "bg-slate-400",
  };

  const statusDot = {
    ongoing:   "bg-sky-400",
    upcoming:  "bg-violet-400",
    completed: "bg-emerald-400",
    cancelled: "bg-slate-400",
  };

  const conflictDays = new Set();
  calendarBookings.filter(b => b.conflict).forEach(b => {
    const start = new Date(b.from);
    const end   = new Date(b.to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getMonth() === month && d.getFullYear() === year) {
        conflictDays.add(d.getDate());
      }
    }
  });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToday   = () => { setCurrentMonth(new Date(2024, 3, 1)); setSelectedDay(10); };

  const selectedBookings = selectedDay ? getBookingsForDay(selectedDay) : [];
  const totalBookings     = calendarBookings.length;
  const conflictCount     = calendarBookings.filter(b => b.conflict).length;
  const ongoingCount      = calendarBookings.filter(b => b.status === "ongoing").length;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Build grid cells
  const cells = [];
  // Prev month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, current: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  // Next month leading days
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false });
  }

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Total Bookings", totalBookings, "This month", "📋", "sky"],
          ["Active Now",     ongoingCount,  "Ongoing trips", "🔴", "violet"],
          ["Conflicts",      conflictCount, "Need resolution", "⚠️", "amber"],
          ["Available Days", daysInMonth - conflictDays.size, "No conflicts", "✅", "emerald"],
        ].map(([label, value, delta, icon, color]) => (
          <StatCard key={label} label={label} value={value} delta={delta} icon={icon} color={color} />
        ))}
      </div>

      {/* Conflict Alert */}
      {conflictCount > 0 && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border-l-4 border-red-400 ${dark ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-200"}`}>
          <AlertIcon />
          <div>
            <p className={`font-bold text-sm ${dark ? "text-red-300" : "text-red-700"}`}>
              {conflictCount} double-booking conflict{conflictCount > 1 ? "s" : ""} detected
            </p>
            <p className={`text-xs mt-0.5 ${dark ? "text-red-400" : "text-red-500"}`}>
              Honda Activa 6G — Apr 9 is double-booked by Rahul Singh and Dev Kumar
            </p>
          </div>
          <button className="ml-auto text-xs bg-red-500 text-white px-3 py-1.5 rounded-xl font-semibold hover:bg-red-400 transition-colors">
            Resolve
          </button>
        </div>
      )}

      {/* Calendar Header */}
      <Card cls="overflow-hidden">
        {/* Toolbar */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? "border-slate-700" : "border-slate-100"}`}>
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className={`p-2 rounded-xl border transition-colors ${dark ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
              <I d="M15 18l-6-6 6-6" />
            </button>
            <h3 className={`font-black text-lg min-w-[180px] text-center ${txt}`}>{monthName}</h3>
            <button onClick={nextMonth} className={`p-2 rounded-xl border transition-colors ${dark ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
              <I d="M9 18l6-6-6-6" />
            </button>
            <button onClick={goToday} className="px-3 py-1.5 text-xs font-semibold bg-violet-500 text-white rounded-xl hover:bg-violet-400 transition-colors">
              Today
            </button>
          </div>
          {/* Legend */}
          <div className="hidden lg:flex items-center gap-4">
            {[["ongoing","sky","Ongoing"],["upcoming","violet","Upcoming"],["completed","emerald","Completed"],["cancelled","slate","Cancelled"]].map(([s,c,l]) => (
              <div key={s} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${statusDot[s]}`} />
                <span className={`text-xs ${sub}`}>{l}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 ring-2 ring-red-200" />
              <span className={`text-xs ${sub}`}>Conflict</span>
            </div>
          </div>
        </div>

        {/* Day Headers */}
        <div className={`grid grid-cols-7 border-b ${dark ? "border-slate-700" : "border-slate-100"}`}>
          {days.map(d => (
            <div key={d} className={`py-3 text-center text-xs font-bold uppercase tracking-wide ${dark ? "text-slate-400 bg-slate-750" : "text-slate-400 bg-slate-50"}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            const bookings    = cell.current ? getBookingsForDay(cell.day) : [];
            const hasConflict = cell.current && conflictDays.has(cell.day);
            const isSelected  = cell.current && selectedDay === cell.day;
            const isToday     = cell.current && cell.day === 10; // Apr 10

            return (
              <div
                key={i}
                onClick={() => cell.current && setSelectedDay(cell.day === selectedDay ? null : cell.day)}
                className={`min-h-[90px] border-r border-b p-1.5 cursor-pointer transition-all
                  ${dark ? "border-slate-700" : "border-slate-100"}
                  ${!cell.current ? dark ? "bg-slate-900/50" : "bg-slate-50/50" : ""}
                  ${isSelected ? dark ? "bg-violet-900/30 ring-2 ring-inset ring-violet-500" : "bg-violet-50 ring-2 ring-inset ring-violet-400" : ""}
                  ${hasConflict && !isSelected ? dark ? "bg-red-900/20" : "bg-red-50/60" : ""}
                  ${cell.current && !isSelected && !hasConflict ? dark ? "hover:bg-slate-700/50" : "hover:bg-slate-50" : ""}
                `}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all
                    ${!cell.current ? dark ? "text-slate-600" : "text-slate-300" : ""}
                    ${isToday ? "bg-violet-500 text-white" : ""}
                    ${cell.current && !isToday ? dark ? "text-slate-300" : "text-slate-700" : ""}
                  `}>
                    {cell.day}
                  </span>
                  {hasConflict && (
                    <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-[8px] font-black">!</span>
                    </span>
                  )}
                </div>

                {/* Booking Pills */}
                <div className="space-y-0.5">
                  {bookings.slice(0, 2).map(b => (
                    <div key={b.id} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate ${statusColor[b.status]} text-white`}>
                      {b.user.split(" ")[0]}
                    </div>
                  ))}
                  {bookings.length > 2 && (
                    <div className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${dark ? "bg-slate-600 text-slate-300" : "bg-slate-200 text-slate-600"}`}>
                      +{bookings.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Selected Day Panel */}
      {selectedDay && (
        <Card cls="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-black text-base ${txt}`}>
                April {selectedDay}, 2024
              </h3>
              <p className={`text-xs mt-0.5 ${sub}`}>
                {selectedBookings.length === 0 ? "No bookings on this day" : `${selectedBookings.length} booking${selectedBookings.length > 1 ? "s" : ""} active`}
              </p>
            </div>
            <button onClick={() => setSelectedDay(null)} className={`p-2 rounded-xl transition-colors ${dark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-400"}`}>
              <XIcon />
            </button>
          </div>

          {selectedBookings.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-3xl mb-2">📅</p>
              <p className="text-sm">No bookings on this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedBookings.map(b => (
                <div key={b.id} className={`flex items-center gap-4 p-3 rounded-xl border ${dark ? "border-slate-700 bg-slate-700/50" : "border-slate-100 bg-slate-50"}`}>
                  <Avatar letter={b.avatar} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-sm ${txt}`}>{b.user}</p>
                      <StatusBadge s={b.status} />
                      {b.conflict && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">⚠️ Conflict</span>}
                    </div>
                    <p className={`text-xs ${sub}`}>{b.vehicle} · {b.type} · {b.from} → {b.to}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${sub}`}>{b.id}</p>
                    {b.conflict && (
                      <button className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg mt-1 hover:bg-red-400 transition-colors">
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// REVENUE FORECAST DATA — add alongside your other mock data
// ════════════════════════════════════════════════════════════════

const generateForecastData = () => {
  // Historical: last 30 days (actual)
  const historical = [
    { date:"Mar 11", actual:18400, type:"historical" },
    { date:"Mar 12", actual:22100, type:"historical" },
    { date:"Mar 13", actual:19800, type:"historical" },
    { date:"Mar 14", actual:25600, type:"historical" },
    { date:"Mar 15", actual:31200, type:"historical" },
    { date:"Mar 16", actual:42800, type:"historical" },
    { date:"Mar 17", actual:38900, type:"historical" },
    { date:"Mar 18", actual:21000, type:"historical" },
    { date:"Mar 19", actual:23500, type:"historical" },
    { date:"Mar 20", actual:24200, type:"historical" },
    { date:"Mar 21", actual:27800, type:"historical" },
    { date:"Mar 22", actual:33100, type:"historical" },
    { date:"Mar 23", actual:44500, type:"historical" },
    { date:"Mar 24", actual:40200, type:"historical" },
    { date:"Mar 25", actual:22800, type:"historical" },
    { date:"Mar 26", actual:25100, type:"historical" },
    { date:"Mar 27", actual:28900, type:"historical" },
    { date:"Mar 28", actual:31400, type:"historical" },
    { date:"Mar 29", actual:35200, type:"historical" },
    { date:"Mar 30", actual:47800, type:"historical" },
    { date:"Mar 31", actual:43200, type:"historical" },
    { date:"Apr 1",  actual:23100, type:"historical" },
    { date:"Apr 2",  actual:26400, type:"historical" },
    { date:"Apr 3",  actual:29800, type:"historical" },
    { date:"Apr 4",  actual:32100, type:"historical" },
    { date:"Apr 5",  actual:37500, type:"historical" },
    { date:"Apr 6",  actual:51200, type:"historical" },
    { date:"Apr 7",  actual:46800, type:"historical" },
    { date:"Apr 8",  actual:28900, type:"historical" },
    { date:"Apr 9",  actual:31200, type:"historical" },
    { date:"Apr 10", actual:34800, type:"historical" },
  ];

  // Forecast: next 30 days with trend + weekend spikes + uncertainty band
  // Simple linear regression with seasonality
  const baseGrowth = 1.018; // ~1.8% weekly growth
  const weekendMultiplier = [1.0, 1.0, 1.0, 1.0, 1.0, 1.55, 1.42]; // Mon-Sun
  const lastActual = 34800;

  const forecast = [];
  const months = ["Apr","May"];
  let dayOfWeek = 3; // Apr 11 is Thursday
  let val = lastActual;

  for (let i = 1; i <= 30; i++) {
    const dateDay = 10 + i;
    const month = dateDay <= 30 ? "Apr" : "May";
    const day   = dateDay <= 30 ? dateDay : dateDay - 30;
    val = val * baseGrowth * weekendMultiplier[dayOfWeek % 7];
    const noise = 0.92 + Math.random() * 0.16;
    const projected = Math.round(val * noise);
    const lower = Math.round(projected * 0.82);
    const upper = Math.round(projected * 1.18);
    forecast.push({
      date: `${month} ${day}`,
      projected,
      lower,
      upper,
      type: "forecast",
      isWeekend: dayOfWeek % 7 === 5 || dayOfWeek % 7 === 6,
    });
    dayOfWeek++;
  }

  return { historical, forecast, combined: [...historical, ...forecast] };
};

const { historical: histData, forecast: forecastData, combined: combinedData } = generateForecastData();

// ════════════════════════════════════════════════════════════════
// PAGE: REVENUE FORECAST
// ════════════════════════════════════════════════════════════════

const RevenueForecastPage = ({ transactions: mockTransactions = [] }) => {
  const { dark } = useDark();
  const [horizon, setHorizon]   = useState(30);  // days to forecast
  const [scenario, setScenario] = useState("base"); // base | optimistic | pessimistic
  const [showBand, setShowBand] = useState(true);

  const txt = dark ? "text-slate-100" : "text-slate-800";
  const sub = dark ? "text-slate-400" : "text-slate-400";

  const scenarioMultiplier = { base: 1, optimistic: 1.22, pessimistic: 0.78 };
  const mult = scenarioMultiplier[scenario];

  const visibleForecast = forecastData.slice(0, horizon);
  const displayData = [
    ...histData.map(d => ({ ...d, projected: null, lower: null, upper: null })),
    ...visibleForecast.map(d => ({
      ...d,
      actual:    null,
      projected: Math.round(d.projected * mult),
      lower:     Math.round(d.lower * mult),
      upper:     Math.round(d.upper * mult),
    })),
  ];

  const totalProjected = visibleForecast.reduce((s, d) => s + Math.round(d.projected * mult), 0);
  const totalHistorical = histData.reduce((s, d) => s + d.actual, 0);
  const growthPct = ((totalProjected - totalHistorical) / totalHistorical * 100).toFixed(1);

  const peakDay = [...visibleForecast].sort((a, b) => b.projected - a.projected)[0];
  const avgDaily = Math.round(totalProjected / horizon);

  const scenarioColors = { base:"violet", optimistic:"emerald", pessimistic:"amber" };

  const tooltipStyle = {
    borderRadius: "12px",
    border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
    fontSize: 12,
    background: dark ? "#1e293b" : "#fff",
    color: dark ? "#e2e8f0" : "#334155",
  };

  return (
    <div className="space-y-5">

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Projected Revenue"
          value={`₹${(totalProjected/100000).toFixed(1)}L`}
          delta={`Next ${horizon} days`}
          icon="📈" color="violet"
        />
        <StatCard
          label="vs Last 30 Days"
          value={`${growthPct > 0 ? "+" : ""}${growthPct}%`}
          delta={growthPct > 0 ? "Trending up" : "Trending down"}
          icon={growthPct > 0 ? "🚀" : "📉"} color={growthPct > 0 ? "emerald" : "amber"}
        />
        <StatCard
          label="Peak Day"
          value={peakDay?.date ?? "—"}
          delta={`₹${Math.round((peakDay?.projected ?? 0) * mult / 1000)}k projected`}
          icon="🏆" color="sky"
        />
        <StatCard
          label="Daily Average"
          value={`₹${(avgDaily/1000).toFixed(1)}k`}
          delta={`Over ${horizon} days`}
          icon="📊" color="amber"
        />
      </div>

      {/* Controls */}
      <Card cls="p-5">
        <div className="flex flex-wrap items-center gap-6">
          {/* Horizon slider */}
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <span className={`text-xs font-semibold whitespace-nowrap ${sub}`}>Forecast horizon</span>
            <input
              type="range" min={7} max={30} step={1} value={horizon}
              onChange={e => setHorizon(+e.target.value)}
              className="flex-1 accent-violet-500"
            />
            <span className={`text-sm font-black min-w-[48px] ${txt}`}>{horizon}d</span>
          </div>

          {/* Scenario picker */}
          <div className={`flex rounded-xl p-1 gap-1 ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
            {[["base","Base"],["optimistic","Optimistic"],["pessimistic","Conservative"]].map(([k, l]) => (
              <button key={k} onClick={() => setScenario(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  scenario === k
                    ? k === "optimistic" ? "bg-emerald-500 text-white" : k === "pessimistic" ? "bg-amber-500 text-white" : "bg-violet-500 text-white"
                    : dark ? "text-slate-400" : "text-slate-500"
                }`}>
                {l}
              </button>
            ))}
          </div>

          {/* Confidence band toggle */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${sub}`}>Confidence band</span>
            <Toggle on={showBand} onToggle={() => setShowBand(v => !v)} />
          </div>
        </div>
      </Card>

      {/* Main Chart */}
      <Card cls="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className={`font-black text-base ${txt}`}>Revenue Forecast</h3>
            <p className={`text-xs mt-0.5 ${sub}`}>
              Historical (30d) + {horizon}-day AI projection · {scenario.charAt(0).toUpperCase() + scenario.slice(1)} scenario
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-sky-500 inline-block rounded" />
              <span className={sub}>Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-violet-500 inline-block rounded border-dashed border-t-2 border-violet-500 bg-transparent" />
              <span className={sub}>Projected</span>
            </div>
            {showBand && (
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-3 bg-violet-200 inline-block rounded opacity-50" />
                <span className={sub}>Confidence</span>
              </div>
            )}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={displayData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#f1f5f9"} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={false} tickLine={false}
              interval={6}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `₹${v/1000}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(val, name) => {
                if (!val) return [null, name];
                const labels = { actual:"Actual", projected:"Projected", upper:"Upper bound", lower:"Lower bound" };
                return [`₹${val.toLocaleString()}`, labels[name] || name];
              }}
            />
            {/* Confidence band */}
            {showBand && (
              <Area type="monotone" dataKey="upper" stroke="none" fill="#8b5cf6" fillOpacity={0.12} connectNulls />
            )}
            {showBand && (
              <Area type="monotone" dataKey="lower" stroke="none" fill="#fff" fillOpacity={1} connectNulls />
            )}
            {/* Actual line */}
            <Area
              type="monotone" dataKey="actual"
              stroke="#0ea5e9" strokeWidth={2.5}
              fill="url(#actualGrad)"
              connectNulls dot={false}
            />
            {/* Projected line */}
            <Area
              type="monotone" dataKey="projected"
              stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="6 3"
              fill="url(#projGrad)"
              connectNulls dot={false}
            />
            {/* Today divider */}
            <ReferenceLine x="Apr 10" stroke="#94a3b8" strokeDasharray="4 4" label={{ value:"Today", fill:"#94a3b8", fontSize:10 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Scenario Comparison + Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Scenario Comparison Table */}
        <Card cls="p-5">
          <h3 className={`font-bold mb-4 ${txt}`}>Scenario Comparison</h3>
          <div className="space-y-3">
            {[
              ["🚀 Optimistic", 1.22, "emerald", "+22% growth. Assumes Uttarakhand summer surge & new owner supply."],
              ["📊 Base",       1.00, "violet",  "Steady 1.8%/week growth extrapolated from current trend."],
              ["⚠️ Conservative", 0.78, "amber", "–22% buffer. Accounts for monsoon dip, cancellation spike."],
            ].map(([label, m, color, note]) => {
              const projected = visibleForecast.reduce((s, d) => s + Math.round(d.projected * m), 0);
              const isActive  = mult === m;
              return (
                <div key={label} className={`p-3 rounded-xl border transition-all ${
                  isActive
                    ? color === "emerald" ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20"
                    : color === "amber"   ? "border-amber-300 bg-amber-50"
                    : "border-violet-300 bg-violet-50"
                    : dark ? "border-slate-700 bg-slate-700/30" : "border-slate-100 bg-slate-50"
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold ${txt}`}>{label}</span>
                    <span className={`text-sm font-black ${color === "emerald" ? "text-emerald-600" : color === "amber" ? "text-amber-600" : "text-violet-600"}`}>
                      ₹{(projected/100000).toFixed(2)}L
                    </span>
                  </div>
                  <p className={`text-xs ${sub}`}>{note}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* AI Insights */}
        <Card cls="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold ${txt}`}>AI Insights</h3>
            <span className="bg-violet-50 text-violet-600 border border-violet-200 text-xs font-bold px-2.5 py-1 rounded-xl">🤖 AI</span>
          </div>
          <div className="space-y-3">
            {[
              { icon:"📈", color:"emerald", title:"Weekend surge incoming", desc:"Apr 13–14 projected at ₹55k/day — 58% above weekday average. Recommend enabling surge pricing +15%." },
              { icon:"📍", color:"sky",     title:"Mussoorie underserved", desc:"Demand forecast shows 94% weekend capacity but only 3 vehicles listed. Add 2+ vehicles to capture ₹18k extra." },
              { icon:"⚠️", color:"blue",   title:"May dip expected",      desc:"Historical pattern shows 12% dip in first week of May. Pre-run WELCOME15 coupon campaign to offset." },
              { icon:"🏍️", color:"violet",  title:"Bike demand spike",     desc:"Bikes trending +31% vs cars this month. Royal Enfield Meteor ROI is ₹882/day — highest on platform." },
            ].map(({ icon, color, title, desc }) => (
              <div key={title} className={`flex gap-3 p-3 rounded-xl border ${
                color === "emerald" ? "bg-emerald-50 border-emerald-100" :
                color === "sky"     ? "bg-sky-50 border-sky-100" :
                color === "amber"   ? "bg-amber-50 border-amber-100" :
                "bg-violet-50 border-violet-100"
              }`}>
                <span className="text-lg">{icon}</span>
                <div>
                  <p className={`font-semibold text-sm ${
                    color === "emerald" ? "text-emerald-800" :
                    color === "sky"     ? "text-sky-800" :
                    color === "amber"   ? "text-amber-800" :
                    "text-violet-800"
                  }`}>{title}</p>
                  <p className={`text-xs mt-0.5 ${
                    color === "emerald" ? "text-emerald-600" :
                    color === "sky"     ? "text-sky-600" :
                    color === "amber"   ? "text-amber-600" :
                    "text-violet-600"
                  }`}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Peak Days Table */}
      <Card cls="p-5">
        <h3 className={`font-bold mb-4 ${txt}`}>Top 7 Projected Days</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className={`text-xs font-semibold border-b ${dark ? "text-slate-400 border-slate-700" : "text-slate-400 border-slate-100"}`}>
                {["Rank","Date","Day","Projected Revenue","Confidence Range","Type"].map(h => (
                  <th key={h} className="text-left pb-2 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...visibleForecast]
                .sort((a, b) => b.projected - a.projected)
                .slice(0, 7)
                .map((d, i) => {
                  const dateObj = new Date(`2024-${d.date.replace("Apr ", "04-").replace("May ", "05-")}`);
                  const dayName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dateObj.getDay()] || "—";
                  return (
                    <tr key={d.date} className={`border-b transition-colors ${dark ? "border-slate-700/50 hover:bg-slate-700/30" : "border-slate-50 hover:bg-slate-50"}`}>
                      <td className="py-2.5 pr-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-sky-400 text-sky-900" : i === 1 ? "bg-slate-300 text-slate-700" : i === 2 ? "bg-sky-300 text-sky-900" : dark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}>{i+1}</span>
                      </td>
                      <td className={`py-2.5 pr-4 font-semibold text-xs ${txt}`}>{d.date}</td>
                      <td className={`py-2.5 pr-4 text-xs ${sub}`}>{dayName}</td>
                      <td className="py-2.5 pr-4">
                        <span className="text-violet-600 font-black text-sm">₹{Math.round(d.projected * mult).toLocaleString()}</span>
                      </td>
                      <td className={`py-2.5 pr-4 text-xs ${sub}`}>
                        ₹{Math.round(d.lower * mult / 1000)}k – ₹{Math.round(d.upper * mult / 1000)}k
                      </td>
                      <td className="py-2.5">
                        {d.isWeekend
                          ? <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">Weekend</span>
                          : <span className={`text-xs ${sub}`}>Weekday</span>
                        }
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default function AdminDashboard({ adminUser, onLogout }) {
  return <AdminApp adminUser={adminUser} onLogout={onLogout} />;
}
  

function AdminApp({ adminUser, onLogout }) {
  // ── CSV data ──────────────────────────────────────────────────────────────
  const [csvData, setCsvData] = useState({
    vehicles: [], users: [], owners: [], bookings: [], transactions: [],
    bookingTrend: [], cityRevenue: [], vehicleTypeRevenue: [],
    verifications: [], reports: [], promotions: [], auditLog: [],
  });
  const [csvLoading, setCsvLoading] = useState(true);

  useEffect(() => {
    loadAllData()
      .then(data => { setCsvData(data); setCsvLoading(false); })
      .catch(err => { console.error("CSV load error:", err); setCsvLoading(false); });
  }, []);

  // Destructure for convenience (shadows old consts / mock arrays)
  const vehicles     = csvData.vehicles;
  const users        = csvData.users;
  const owners       = csvData.owners;
  const mockBookings = csvData.bookings;
  const mockTransactions  = csvData.transactions;
  const mockVerifications = csvData.verifications;
  const mockReports       = csvData.reports;
  const mockPromotions    = csvData.promotions;
  const mockAuditLog      = csvData.auditLog;
  const bookingTrend      = csvData.bookingTrend.length  ? csvData.bookingTrend  : bookingTrendStatic;
  const cityRevenue       = csvData.cityRevenue.length   ? csvData.cityRevenue   : cityRevenueStatic;
  const vehicleTypeRevenue= csvData.vehicleTypeRevenue.length ? csvData.vehicleTypeRevenue : vehicleTypeRevenueStatic;

  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [widgets, setWidgets] = useState(defaultWidgets);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const [localAdmin, setLocalAdmin] = useState(adminUser);
  const adminInitial = localAdmin.name ? localAdmin.name.charAt(0).toUpperCase() : "A";
  const adminDisplayName = localAdmin.name;

  const navItems = [
    { id: "dashboard",     label: "Dashboard",    icon: <DashIcon /> },
    { id: "users",         label: "Users",        icon: <UsersIcon /> },
    { id: "vehicles",      label: "Vehicles",     icon: <CarIcon />,    badge: vehicles.filter(v=>v.status==="pending").length },
    { id: "bookings",      label: "Bookings",     icon: <BookIcon /> },
    { id: "transactions",  label: "Transactions", icon: <CashIcon /> },
    { id: "verifications", label: "Verifications",icon: <ShieldIcon />, badge: mockVerifications.filter(v=>v.status==="pending").length },
    { id: "reports",       label: "Reports",      icon: <FlagIcon />,   badge: mockReports.filter(r=>r.status==="open").length },
    { id: "analytics",     label: "Analytics",    icon: <TrendIcon /> },
    { id: "promotions",    label: "Promotions",   icon: <TagIcon /> },
    { id: "calendar",      label: "Booking Calendar", icon: <CalIcon /> },
    { id: "forecast",      label: "Revenue Forecast",  icon: <TrendIcon /> },
    { id: "payouts",  label: "Owner Payouts", icon: <PayIcon />   },
    { id: "auditlog", label: "Activity Log",  icon: <ClockIcon /> },
    { id: "ai",            label: "AI Assistant", icon: <BotIcon /> },
    { id: "notifications", label: "Notifications",icon: <BellIcon />,   badge: unreadNotifs },
    { id: "profile",       label: "Profile",      icon: <UserIcon /> },
    { id: "map",     label: "Vehicle Map",        icon: <MapIcon />    },
    { id: "intel",   label: "Intelligence",        icon: <BotIcon />    },
    { id: "health",  label: "Platform Health",     icon: <ShieldIcon /> },
    { id: "emails",  label: "Email Templates",     icon: <BellIcon />   },
    { id: "widgets", label: "Customize Dashboard", icon: <GearIcon />   },
    { id: "settings",      label: "Settings",     icon: <GearIcon /> },
  ];

  const titles = {
    map:"Vehicle Map", intel:"Intelligence", health:"Platform Health",
    emails:"Email Templates", widgets:"Customize Dashboard",
    dashboard:"Dashboard", users:"Users Management", vehicles:"Vehicle Management", bookings:"Bookings Management",
    transactions:"Transactions", verifications:"Verifications", reports:"Reports & Issues",
    analytics:"Analytics", promotions:"Promotions", ai:"AI Assistant", notifications:"Notifications",
    payouts:"Owner Payouts", auditlog:"Activity Log",
    profile:"Profile", settings:"Settings",
    calendar:"Booking Calendar", forecast:"Revenue Forecast",
  };

  const renderPage = () => {
    switch (page) {
case "dashboard": return <DashboardPage setPage={setPage} widgets={widgets} vehicles={vehicles} bookings={mockBookings} vehicleTypeRevenue={vehicleTypeRevenue} bookingTrend={bookingTrend} cityRevenue={cityRevenue} />;
case "users": return <UsersPage users={users} owners={owners} />;
case "vehicles": return <VehiclesPage vehicles={vehicles} />;
case "bookings": return <BookingsPage bookings={mockBookings} />;
case "transactions": return <TransactionsPage transactions={mockTransactions} cityRevenue={cityRevenue} vehicleTypeRevenue={vehicleTypeRevenue} />;
case "verifications": return <VerificationsPage verifications={mockVerifications} />;
case "reports": return <ReportsPage reports={mockReports} />;
case "analytics": return <AnalyticsPage bookingTrend={bookingTrend} cityRevenue={cityRevenue} vehicleTypeRevenue={vehicleTypeRevenue} />;
case "promotions": return <PromotionsPage promotions={mockPromotions} />;
case "calendar": return <BookingCalendarPage bookings={mockBookings} />;
case "forecast": return <RevenueForecastPage transactions={mockTransactions} />;

case "payouts": return <OwnerPayoutPage owners={owners} />;
case "auditlog": return <ActivityAuditPage auditLog={mockAuditLog} />;

case "ai": return <AIAssistant fullPage />;
case "map": return <VehicleMapPage />;
case "intel": return <IntelligencePage bookings={mockBookings} />;
case "health": return <PlatformHealthPage />;
case "emails": return <EmailTemplatesPage />;
case "widgets": return <CustomWidgetsPage widgets={widgets} setWidgets={setWidgets} />;

case "notifications": return <NotificationsPage notes={notifications} setNotes={setNotifications} />;
case "profile": return <ProfilePage adminUser={localAdmin} onUpdateAdmin={u => setLocalAdmin(prev => ({...prev, ...u}))} />;
case "settings": return <SettingsPage />;

default: return null;
    }
  };

  const navigate = p => { setPage(p); setSidebarOpen(false); };

  if (csvLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 text-sm">Loading platform data…</p>
    </div>
  );

  return (
    <DarkContext.Provider value={{ dark, toggleDark: () => setDark(d => !d) }}>
    <DateRangeContext.Provider value={{ from: dateFrom, to: dateTo, setFrom: setDateFrom, setTo: setDateTo }}>
    <div className={`min-h-screen transition-colors duration-300 bg-slate-50`} style={{ fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
        .sidebar-t{transition:transform .3s cubic-bezier(.4,0,.2,1)}
      `}</style>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-full w-60 z-40 flex flex-col sidebar-t shadow-lg border-r transition-colors duration-300
        bg-[#0f172a] border-[#0f172a]
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-md shadow-sky-900/50">
              <span className="text-white font-black text-xs">RH</span>
            </div>
            <div>
              <p className="font-black text-sm leading-none text-white">RideHive</p>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
          {navItems.map(item => (
            <button key={item.id} onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group border-l-4
                ${page === item.id
                  ? "bg-slate-800/40 text-white border-l-4 border-l-sky-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/20 border-l-4 border-l-transparent"}`}>
              <span className="text-slate-400 flex-shrink-0" style={{width:'20px', height:'20px'}}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge > 0 && <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{item.badge}</span>}
            </button>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div className="p-3 border-t border-slate-700 space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-md shadow-sky-900/50">{adminInitial}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{adminDisplayName}</p>
              <p className="text-xs truncate text-slate-400">{adminUser.role || "Super Admin"}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogoutIcon size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="lg:pl-60 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 backdrop-blur-md border-b px-5 py-3 flex items-center gap-4 shadow-sm transition-colors duration-300 bg-white/95 border-slate-200">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600"><MenuIcon size={20} /></button>
          <h1 className="font-black text-lg flex-1 text-slate-800">{titles[page]}</h1>
          <GlobalSearch navigate={navigate} searchData={{ users, owners, vehicles, bookings: mockBookings, transactions: mockTransactions, verifications: mockVerifications, reports: mockReports }} />

          {/* Dark mode toggle */}
          <button onClick={() => setDark(d => !d)}
            className="p-2 rounded-lg transition-all border bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}>
            {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>

          <button onClick={() => navigate("notifications")} className="relative p-2 transition-colors text-slate-400 hover:text-slate-600">
            <BellIcon size={20} />
            {unreadNotifs > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
          </button>
          <button onClick={() => navigate("profile")} className="flex items-center gap-2 px-2 py-1 rounded-lg transition-colors hover:bg-slate-50">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-md shadow-sky-900/50">{adminInitial}</div>
            <span className="text-sm font-semibold hidden sm:block text-slate-700">{adminDisplayName.split(" ")[0]}</span>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 max-w-6xl mx-auto w-full pb-10 bg-gradient-to-br from-slate-50 to-white">
          {renderPage()}
        </main>
      </div>

      {/* Floating AI */}
      <AIAssistant />
    </div>
    </DateRangeContext.Provider>
    </DarkContext.Provider>
  );
}