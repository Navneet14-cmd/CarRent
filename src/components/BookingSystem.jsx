import React, { useState, useEffect } from 'react';

const BookingSystem = ({ selectedVehicle, onSuccess }) => {
  const [booking, setBooking] = useState({
    type: 'daily',
    duration: 1,
    totalPrice: 0
  });

  useEffect(() => {
    if (selectedVehicle) {
      const rate = booking.type === 'daily' ? selectedVehicle.daily : selectedVehicle.hourly;
      setBooking(prev => ({ ...prev, totalPrice: rate * Number(prev.duration) }));
    }
  }, [booking.type, booking.duration, selectedVehicle]);

  const confirmBooking = () => {
    const finalBooking = {
      ...booking,
      vehicleName: selectedVehicle.name,
      timestamp: new Date().toLocaleString()
    };
    
    const existing = JSON.parse(localStorage.getItem('ridehive_bookings')) || [];
    localStorage.setItem('ridehive_bookings', JSON.stringify([...existing, finalBooking]));
    
    // Triggers the history list to update instantly in Dashboard.jsx
    if (onSuccess) onSuccess(); 
    
    alert(`Booking Confirmed for ${selectedVehicle.name}! Total: ₹${booking.totalPrice}`);
  };

  return (
    <div className="bg-[#1a1c2c] p-6 rounded-2xl border border-slate-800 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4 italic">Book {selectedVehicle?.name}</h3>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setBooking({...booking, type: 'daily'})}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition ${booking.type === 'daily' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'}`}
        >Daily</button>
        <button 
          onClick={() => setBooking({...booking, type: 'hourly'})}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition ${booking.type === 'hourly' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'}`}
        >Hourly</button>
      </div>

      <div className="mb-4">
        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Duration ({booking.type})</label>
        <input 
          type="number" 
          value={booking.duration} 
          onChange={(e) => setBooking({...booking, duration: e.target.value})}
          className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500"
          min="1"
        />
      </div>

      <div className="pt-4 border-t border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <span className="text-slate-400 text-sm italic">Estimated Total</span>
          <span className="text-2xl font-black text-white">₹{booking.totalPrice}</span>
        </div>
        <button 
          onClick={confirmBooking} 
          className="w-full bg-sky-600 hover:bg-sky-500 text-white py-3 rounded-xl font-bold uppercase tracking-tighter transition shadow-lg shadow-sky-900/20"
        >
          Confirm Reservation →
        </button>
      </div>
    </div>
  );
};

export default BookingSystem;