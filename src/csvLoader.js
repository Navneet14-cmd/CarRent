// ─── CSV Loader ───────────────────────────────────────────────────────────────
// Fetches and parses all CSV files from public/data/core and public/data/analytics
// Returns parsed arrays ready to use across all dashboards.

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/\r/g, ""));
  return lines.slice(1).map(line => {
    // Handle quoted fields with commas inside
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { values.push(current.trim().replace(/\r/g, "")); current = ""; }
      else { current += ch; }
    }
    values.push(current.trim().replace(/\r/g, ""));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ""; });
    return obj;
  }).filter(row => Object.values(row).some(v => v !== ""));
}

async function fetchCSV(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return parseCSV(await res.text());
}

// ─── Field normalizers ────────────────────────────────────────────────────────

function normalizeVehicle(v) {
  const typeEmoji = { Car: "🚗", Bike: "🏍️", Scooty: "🛵" };
  return {
    ...v,
    id: Number(v.id) || v.id,
    price:       Number(v.price)       || 0,
    priceHourly: Number(v.priceHourly) || 0,
    // aliases used by VehicleBookingDashboard
    daily:       Number(v.price)       || 0,
    hourly:      Number(v.priceHourly) || 0,
    bookings:    Number(v.bookings)    || 0,
    aiScore:     Number(v.aiScore)     || 0,
    rating:      Number(v.rating)      || 0,
    reviews:     Number(v.bookings)    || 0,   // proxy
    ownerName:   v.ownerName || v.owner || "",
    img:         typeEmoji[v.type] || "🚗",
    // extra fields expected by detail page (graceful fallback)
    seats:  v.type === "Car" ? 5 : v.type === "Bike" ? 2 : 2,
    cc:     v.fuel === "Electric" ? "Electric" : (v.type === "Car" ? "1200cc" : "350cc"),
    brand:  v.name ? v.name.split(" ")[0] : "",
  };
}

function normalizeUser(u) {
  return {
    ...u,
    bookings:      Number(u.bookings)      || 0,
    cancellations: Number(u.cancellations) || 0,
    trustScore:    Number(u.trustScore)    || 0,
    avatar:        u.avatar || u.name?.[0] || "U",
  };
}

function normalizeOwner(o) {
  return {
    ...o,
    vehicles:   Number(o.vehicles)   || 0,
    totalTrips: Number(o.totalTrips) || 0,
    earned:     Number(o.earned)     || 0,
    platform:   Number(o.platform)   || 0,
    tax:        Number(o.tax)        || 0,
    net:        Number(o.net)        || 0,
    lastPayoutAmt: Number(o.lastPayoutAmt) || 0,
    avatar:     o.avatar || o.name?.[0] || "O",
    // alias used in AdminDashboard owners tab
    earnings:   `₹${(Number(o.net) || 0).toLocaleString("en-IN")}`,
  };
}

function normalizeBooking(b) {
  return {
    ...b,
    days:       Number(b.days)   || 0,
    amount:     Number(b.amount) || 0,
    doubleBook: b.doubleBook === "True" || b.doubleBook === true,
    avatar:     b.avatar || b.user?.[0] || "U",
    vehicleName: b.vehicleName || b.vehicle || "",
    userName:    b.userName    || b.user    || "",
    ownerName:   b.ownerName   || "",
  };
}

function normalizeTransaction(t) {
  return {
    ...t,
    amount:      Number(t.amount)      || 0,
    tax:         Number(t.tax)         || 0,
    platformFee: Number(t.platformFee) || 0,
    net:         Number(t.net)         || 0,
    fraud:       t.fraud === "True"    || t.fraud === true,
    avatar:      t.avatar || t.user?.[0] || "U",
    vehicleName: t.vehicleName || "",
    userName:    t.userName    || t.user || "",
  };
}

function normalizeVerification(v) {
  return {
    ...v,
    avatar: v.avatar || v.name?.[0] || "U",
  };
}

function normalizeReport(r) {
  return {
    ...r,
    avatar: r.avatar || r.reporter?.[0] || "U",
  };
}

function normalizePromotion(p) {
  return {
    ...p,
    discount: Number(p.discount) || 0,
    uses:     Number(p.uses)     || 0,
    maxUses:  Number(p.maxUses)  || 0,
    active:   p.active === "True" || p.active === true,
  };
}

function normalizeAuditLog(a) {
  return { ...a };
}

// ─── Main loader (call once, cache result) ────────────────────────────────────

let _cache = null;

export async function loadAllData() {
  if (_cache) return _cache;

  const [
    rawVehicles,
    rawUsers,
    rawOwners,
    rawBookings,
    rawTransactions,
    rawBookingTrend,
    rawCityRevenue,
    rawVehicleTypeRevenue,
    rawVerifications,
    rawReports,
    rawPromotions,
    rawAuditLog,
  ] = await Promise.all([
    fetchCSV("/data/analytics/mockVehicles_fixed_enriched.csv"),
    fetchCSV("/data/core/mockUsers_fixed.csv"),
    fetchCSV("/data/core/mockOwners_fixed.csv"),
    fetchCSV("/data/analytics/mockBookings_fixed_enriched.csv"),
    fetchCSV("/data/analytics/mockTransactions_fixed_enriched.csv"),
    fetchCSV("/data/analytics/bookingTrend.csv"),
    fetchCSV("/data/analytics/cityRevenue.csv"),
    fetchCSV("/data/analytics/vehicleTypeRevenue.csv"),
    fetchCSV("/data/analytics/mockVerifications_fixed.csv"),
    fetchCSV("/data/analytics/mockReports_fixed.csv"),
    fetchCSV("/data/analytics/mockPromotions_fixed.csv"),
    fetchCSV("/data/analytics/mockAuditLog_fixed.csv"),
  ]);

  _cache = {
    vehicles:           rawVehicles.map(normalizeVehicle),
    users:              rawUsers.map(normalizeUser),
    owners:             rawOwners.map(normalizeOwner),
    bookings:           rawBookings.map(normalizeBooking),
    transactions:       rawTransactions.map(normalizeTransaction),
    bookingTrend:       rawBookingTrend.map(r => ({ d: r.d, bookings: Number(r.bookings) || 0, cancellations: Number(r.cancellations) || 0 })),
    cityRevenue:        rawCityRevenue.map(r => ({ city: r.city, revenue: Number(r.revenue) || 0 })),
    vehicleTypeRevenue: rawVehicleTypeRevenue.map(r => ({ name: r.name, value: Number(r.value) || 0, color: r.color })),
    verifications:      rawVerifications.map(normalizeVerification),
    reports:            rawReports.map(normalizeReport),
    promotions:         rawPromotions.map(normalizePromotion),
    auditLog:           rawAuditLog.map(normalizeAuditLog),
  };

  return _cache;
}
