import React, { useState, useEffect } from 'react';
import { loadAllData } from '../csvLoader';
import BookingSystem from '../components/BookingSystem';
import { getAiResponse } from '../aiService';
import StaggeredMenu from './components/StaggeredMenu';
const Dashboard = ({ user, onLogout }) => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [pastBookings, setPastBookings] = useState([]);

  const refreshHistory = () => {
    const saved = JSON.parse(localStorage.getItem('ridehive_bookings')) || [];
    setPastBookings(saved);
  };

  useEffect(() => {
    refreshHistory();
    loadAllData().then(data => setVehicles(data.vehicles)).catch(console.error);
  }, []);

  const handleAiChat = async () => {
    if(!chatInput) return;
    setChatResponse("Syncing with RideHive AI...");
    const response = await getAiResponse(chatInput);
    setChatResponse(response);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col text-slate-800">
      {/* NAVBAR */}
      <nav className="p-6 border-b border-slate-200 flex justify-between items-center bg-white/70 backdrop-blur-md shadow-sm">
        <h2 className="text-slate-900 font-black italic tracking-tighter uppercase">RideHive</h2>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-900 uppercase">{user?.name || 'User'}</p>
            <p className="text-[10px] text-sky-600 font-bold uppercase tracking-widest">Premium Member</p>
          </div>
          <button onClick={onLogout} className="p-2 bg-slate-200 rounded-lg text-[10px] font-bold hover:bg-red-200 text-slate-900 transition-all italic">Logout</button>
        </div>
      </nav>

      <main className="flex-1 p-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: FLEET & AI */}
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white p-8 rounded-[40px] border border-sky-200 shadow-lg relative overflow-hidden">
            <h1 className="text-4xl font-black text-slate-900 italic mb-2">Find Your Perfect Ride</h1>
            <p className="text-slate-600 text-sm uppercase tracking-widest font-bold mb-6 italic">Explore Premium Access</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vehicles.map(v => (
                <button 
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className={`p-4 rounded-2xl border transition-all ${selectedVehicle?.id === v.id ? 'border-sky-500 bg-sky-500/10' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                >
                  <p className="text-[10px] font-black uppercase text-slate-600">{v.type}</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{v.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* AI ASSISTANT BOX */}
          <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-sky-500 text-white text-[10px] font-black px-2 py-1 rounded">AI</span>
              <h3 className="text-xs font-black uppercase tracking-widest">Smart Trip Planner</h3>
            </div>
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-black border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-sky-500"
                placeholder="Ask AI for recommendations..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button onClick={handleAiChat} className="bg-sky-600 px-6 rounded-xl font-bold text-xs uppercase italic">Ask</button>
            </div>
            {chatResponse && <p className="mt-4 p-4 bg-black rounded-xl text-xs text-slate-400 border-l-2 border-sky-500 italic">{chatResponse}</p>}
          </div>
        </div>

        {/* RIGHT: BOOKING & HISTORY */}
        <div className="lg:col-span-4 space-y-6">
          {selectedVehicle ? (
            <BookingSystem selectedVehicle={selectedVehicle} onSuccess={refreshHistory} />
          ) : (
            <div className="p-10 border-2 border-dashed border-slate-800 rounded-3xl text-center text-slate-600 italic text-sm">
              Select a vehicle to unlock booking
            </div>
          )}

          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-widest mb-4">My Bookings</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {pastBookings.length > 0 ? [...pastBookings].reverse().map((b, i) => (
                <div key={i} className="p-3 bg-black rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-white">{b.vehicleName}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{b.type} • {b.duration}</p>
                  </div>
                  <p className="text-sky-500 font-bold">₹{b.totalPrice}</p>
                </div>
              )) : <p className="text-center py-4 text-slate-700 text-[10px] uppercase font-bold italic tracking-tighter">No Bookings Yet</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;