// Local mock store — backs the UI when the backend at localhost:5000 isn't reachable.
// Persisted in localStorage so the demo feels real across reloads.

export type Role = "user" | "provider" | "admin";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  approved?: boolean; // for providers
  service?: string;   // for providers
  createdAt: string;
}

export type BookingStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled" | "rejected";

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  providerId?: string;
  providerName?: string;
  service: string;
  date: string;
  time: string;
  address: string;
  notes?: string;
  status: BookingStatus;
  price: number;
  createdAt: string;
}

interface DB {
  users: UserRecord[];
  bookings: Booking[];
}

const KEY = "hs_mock_db_v1";

function seed(): DB {
  const now = new Date().toISOString();
  return {
    users: [
      { id: "admin-1", name: "Admin", email: "admin@homeserve.com", password: "admin123", role: "admin", createdAt: now },
      { id: "u-1", name: "Aarav Sharma", email: "user@demo.com", password: "demo1234", role: "user", phone: "+91 98765 43210", createdAt: now },
      { id: "p-1", name: "Ravi Kumar", email: "ravi@pro.com", password: "demo1234", role: "provider", service: "Electrician", approved: true, phone: "+91 90000 11111", createdAt: now },
      { id: "p-2", name: "Sunita Verma", email: "sunita@pro.com", password: "demo1234", role: "provider", service: "Cleaner", approved: true, phone: "+91 90000 22222", createdAt: now },
      { id: "p-3", name: "Manoj Singh", email: "manoj@pro.com", password: "demo1234", role: "provider", service: "Plumber", approved: false, phone: "+91 90000 33333", createdAt: now },
    ],
    bookings: [
      { id: "b-1", userId: "u-1", userName: "Aarav Sharma", providerId: "p-1", providerName: "Ravi Kumar", service: "Electrician", date: "2026-04-28", time: "10:00", address: "12 MG Road, Bengaluru", status: "accepted", price: 799, createdAt: now },
      { id: "b-2", userId: "u-1", userName: "Aarav Sharma", providerId: "p-2", providerName: "Sunita Verma", service: "Cleaner", date: "2026-04-22", time: "14:00", address: "12 MG Road, Bengaluru", status: "completed", price: 1299, createdAt: now },
      { id: "b-3", userId: "u-1", userName: "Aarav Sharma", service: "Plumber", date: "2026-04-30", time: "09:00", address: "12 MG Road, Bengaluru", status: "pending", price: 599, createdAt: now },
    ],
  };
}

function read(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as DB;
  } catch {
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
}
function write(db: DB) { localStorage.setItem(KEY, JSON.stringify(db)); }
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

export const mockDb = {
  // users
  listUsers: () => read().users.filter(u => u.role === "user"),
  listProviders: () => read().users.filter(u => u.role === "provider"),
  allUsers: () => read().users,
  findByEmail: (email: string) => read().users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  register: (input: Omit<UserRecord, "id" | "createdAt">) => {
    const db = read();
    if (db.users.some(u => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("An account with this email already exists.");
    }
    const user: UserRecord = { ...input, id: uid(input.role), createdAt: new Date().toISOString(), approved: input.role === "provider" ? false : true };
    db.users.push(user);
    write(db);
    return user;
  },
  setProviderApproval: (id: string, approved: boolean) => {
    const db = read();
    const u = db.users.find(x => x.id === id);
    if (u) { u.approved = approved; write(db); }
  },
  removeUser: (id: string) => {
    const db = read();
    db.users = db.users.filter(u => u.id !== id);
    write(db);
  },

  // bookings
  listBookings: () => read().bookings,
  bookingsForUser: (userId: string) => read().bookings.filter(b => b.userId === userId),
  bookingsForProvider: (providerId: string, service?: string) => {
    const all = read().bookings;
    return all.filter(b => b.providerId === providerId || (!b.providerId && b.service === service && b.status === "pending"));
  },
  createBooking: (b: Omit<Booking, "id" | "createdAt" | "status"> & { status?: BookingStatus }) => {
    const db = read();
    const booking: Booking = { ...b, id: uid("b"), createdAt: new Date().toISOString(), status: b.status ?? "pending" };
    db.bookings.unshift(booking);
    write(db);
    return booking;
  },
  updateBookingStatus: (id: string, status: BookingStatus, providerId?: string, providerName?: string) => {
    const db = read();
    const b = db.bookings.find(x => x.id === id);
    if (b) {
      b.status = status;
      if (providerId) b.providerId = providerId;
      if (providerName) b.providerName = providerName;
      write(db);
    }
  },
  stats: () => {
    const db = read();
    return {
      totalUsers: db.users.filter(u => u.role === "user").length,
      totalProviders: db.users.filter(u => u.role === "provider").length,
      totalBookings: db.bookings.length,
      revenue: db.bookings.filter(b => b.status === "completed").reduce((s, b) => s + b.price, 0),
    };
  },
};

export const SERVICE_PRICES: Record<string, number> = {
  Electrician: 799,
  Plumber: 599,
  Carpenter: 899,
  Cleaner: 1299,
  Painter: 1499,
};
