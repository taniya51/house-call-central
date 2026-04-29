import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { mockDb, UserRecord } from "@/lib/mockDb";
import { api, safeRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BackendUser { id: number; name: string; email: string; phone: string; role: string; created_at: string }

export default function ManageUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);

  const load = async () => {
    const data = await safeRequest<BackendUser[]>(
      () => api.get("/admin/users"),
      () => mockDb.listUsers()
    );
    const mapped: UserRecord[] = data.map((u: any) => ({
      id: String(u.id),
      name: u.name,
      email: u.email,
      phone: u.phone,
      password: "",
      role: u.role as any,
      createdAt: u.created_at || new Date().toISOString(),
    }));
    setUsers(mapped);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    await safeRequest(() => api.delete(`/admin/users/${id}`), () => { mockDb.removeUser(id); return null; });
    toast.success("User removed");
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-10 max-w-7xl">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold">Manage users</h1>
        <p className="text-muted-foreground mt-1">{users.length} registered customers.</p>

        <div className="mt-8 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="grid grid-cols-12 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
            <div className="col-span-4">Name</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-3">Phone</div>
            <div className="col-span-1 text-right">Action</div>
          </div>
          <div className="divide-y divide-border">
            {users.map(u => (
              <div key={u.id} className="grid grid-cols-12 items-center px-6 py-4 text-sm">
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-cta text-primary-foreground font-bold text-xs">{u.name.charAt(0)}</span>
                  <span className="font-semibold truncate">{u.name}</span>
                </div>
                <div className="col-span-4 text-muted-foreground truncate">{u.email}</div>
                <div className="col-span-3 text-muted-foreground">{u.phone ?? "—"}</div>
                <div className="col-span-1 text-right">
                  <Button onClick={() => remove(u.id)} variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {users.length === 0 && <div className="p-10 text-center text-muted-foreground">No users yet.</div>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
