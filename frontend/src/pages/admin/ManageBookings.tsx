import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Booking, BookingStatus, mockDb } from "@/lib/mockDb";
import { api, safeRequest } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

const STATUSES: BookingStatus[] = ["pending", "accepted", "in_progress", "completed", "cancelled", "rejected"];
interface BackendBooking { id: number; user_id: number; provider_id: number; service: string; booking_date: string; booking_time: string; address: string; description: string; status: string; user_name: string; provider_name: string }

export default function ManageBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const load = async () => {
    const data = await safeRequest<BackendBooking[]>(
      () => api.get("/admin/bookings"),
      () => mockDb.listBookings() as any
    );
    const mapped: Booking[] = data.map((b: any) => ({
      id: String(b.id),
      userId: String(b.user_id),
      userName: b.user_name || b.userName,
      providerId: String(b.provider_id),
      providerName: b.provider_name || b.providerName,
      service: b.service,
      date: b.booking_date || b.date,
      time: b.booking_time || b.time,
      address: b.address,
      notes: b.description || b.notes,
      status: b.status as any,
      price: 999,
      createdAt: new Date().toISOString(),
    }));
    setBookings(mapped);
  };
  useEffect(() => { load(); }, []);

  const change = async (id: string, status: BookingStatus) => {
    await safeRequest(
      () => api.put(`/bookings/${id}`, { status }),
      () => { mockDb.updateBookingStatus(id, status); return null; },
    );
    toast.success(`Status updated to ${status}`);
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-10 max-w-7xl">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold">Manage bookings</h1>
        <p className="text-muted-foreground mt-1">{bookings.length} bookings in the system.</p>

        <div className="mt-8 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="grid grid-cols-12 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Service</div>
            <div className="col-span-3">When</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Update</div>
          </div>
          <div className="divide-y divide-border">
            {bookings.map(b => (
              <div key={b.id} className="grid grid-cols-12 items-center px-6 py-4 text-sm gap-2">
                <div className="col-span-3 min-w-0">
                  <div className="font-semibold truncate">{b.userName}</div>
                  <div className="text-xs text-muted-foreground truncate">{b.address}</div>
                </div>
                <div className="col-span-2 font-medium">{b.service}</div>
                <div className="col-span-3 text-muted-foreground">{b.date} · {b.time}</div>
                <div className="col-span-2"><StatusBadge status={b.status} /></div>
                <div className="col-span-2 flex justify-end">
                  <Select value={b.status} onValueChange={(v) => change(b.id, v as BookingStatus)}>
                    <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            {bookings.length === 0 && <div className="p-10 text-center text-muted-foreground">No bookings yet.</div>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
