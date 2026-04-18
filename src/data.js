// ─── Auth users (used ONLY for login validation) ──────────────────────────────
// All other data (vehicles, users, owners, bookings, transactions, …) is loaded
// from the CSV files in /public/data/ via src/csvLoader.js

const defaultUsers = [
  { id: "admin-1", name: "Admin",  email: "admin@test.com",     password: "123", role: "admin"  },
  { id: "owner-1", name: "Owner",  email: "owner@test.com",     password: "123", role: "owner"  },
  { id: "user-1",  name: "Aman",   email: "aman1@yahoo.com",    password: "123", role: "user"   },
  { id: "user-2",  name: "Rahul",  email: "rahul2@gmail.com",   password: "123", role: "user"   },
  { id: "user-3",  name: "Priya",  email: "priya3@yahoo.com",   password: "123", role: "user"   },
  { id: "user-4",  name: "Neha",   email: "neha4@gmail.com",    password: "123", role: "user"   },
  { id: "user-5",  name: "Aditi",  email: "aditi5@outlook.com", password: "123", role: "user"   },
];

// Returns default users merged with any registered via Sign Up
export const getUsers = () => {
  try {
    const saved = localStorage.getItem("vrentaluk_users");
    const registered = saved ? JSON.parse(saved) : [];
    return [...defaultUsers, ...registered];
  } catch {
    return defaultUsers;
  }
};

// Saves a new user to localStorage (called on Sign Up)
export const saveUser = (newUser) => {
  try {
    const saved = localStorage.getItem("vrentaluk_users");
    const existing = saved ? JSON.parse(saved) : [];
    localStorage.setItem("vrentaluk_users", JSON.stringify([...existing, newUser]));
  } catch (e) {
    console.error("Failed to save user:", e);
  }
};

// Keep for any legacy imports
export const users = defaultUsers;