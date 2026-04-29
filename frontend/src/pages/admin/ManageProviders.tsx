import { useEffect, useState } from "react";
import { Check, X, Clock } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { mockDb, UserRecord } from "@/lib/mockDb";
import { api, safeRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BackendProvider { id: number; name: string; email: string; phone: string; specialization: string; is_approved: boolean; created_at: string }

export default function ManageProviders() {
  const [providers, setProviders] = useState<UserRecord[]>([]);

  const load = async () => {
    const data = await safeRequest<BackendProvider[]>(
      () => api.get("/admin/providers"),
      () => mockDb.listProviders()
    );
    const mapped: UserRecord[] = data.map((p: any) => ({
      id: String(p.id),
      name: p.name,
      email: p.email,
      phone: p.phone,
      password: "",
      role: "provider",
      approved: p.is_approved || false,
      service: p.specialization,
      createdAt: p.created_at || new Date().toISOString(),
    }));
    setProviders(mapped);
  };
  useEffect(() => { load(); }, []);

  const setApproval = async (id: string, approved: boolean) => {
    await safeRequest(
      () => approved ? api.put(`/admin/providers/${id}/approve`, {}) : api.patch(`/admin/providers/${id}`, { approved }),
      () => { mockDb.setProviderApproval(id, approved); return null; },
    );
    toast.success(approved ? "Provider approved" : "Provider rejected");
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-10 max-w-7xl">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold">Manage providers</h1>
        <p className="text-muted-foreground mt-1">Approve or reject service provider applications.</p>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {providers.map(p => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-cta text-primary-foreground font-bold">{p.name.charAt(0)}</span>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.email}</div>
                    <div className="text-xs text-muted-foreground">{p.phone}</div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  p.approved ? "bg-success/15 text-success border-success/30" : "bg-warning/15 text-warning border-warning/30"
                }`}>
                  {p.approved ? <><Check className="h-3 w-3" /> Approved</> : <><Clock className="h-3 w-3" /> Pending</>}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">Service:</span> <span className="font-semibold">{p.service ?? "—"}</span>
                </div>
                <div className="flex gap-2">
                  {!p.approved && (
                    <Button size="sm" onClick={() => setApproval(p.id, true)} className="bg-gradient-cta text-primary-foreground hover:opacity-95">
                      <Check className="mr-1 h-4 w-4" /> Approve
                    </Button>
                  )}
                  {p.approved && (
                    <Button size="sm" variant="outline" onClick={() => setApproval(p.id, false)}>
                      <X className="mr-1 h-4 w-4" /> Revoke
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {providers.length === 0 && <div className="md:col-span-2 p-10 text-center text-muted-foreground">No providers yet.</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
