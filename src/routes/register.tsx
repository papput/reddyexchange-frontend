import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiRegister, getApiErrorMessage } from "@/lib/api";
import { normalizeApiUser, setAuth } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { site } from "@/config/site";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: `Create account — ${site.siteName}` }, { name: "description", content: `Create your free ${site.siteName} account.` }] }),
  component: RegisterPage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Invalid email").max(120),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile"),
  password: z.string().min(6, "Min 6 characters").max(72),
});

function RegisterPage() {
  const nav = useNavigate();
  const [data, setData] = useState({ fullName: "", email: "", mobile: "", password: "" });
  const [loading, setLoading] = useState(false);
  const set = <K extends keyof typeof data>(k: K, v: string) => setData((d) => ({ ...d, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(data);
    if (!r.success) {
      toast.error(r.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const { data: body } = await apiRegister({
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        mobile: data.mobile.replace(/\D/g, "").slice(-10),
        password: data.password,
      });
      if (!body?.token || !body?.data?.user) throw new Error("Invalid server response");
      setAuth(body.token, normalizeApiUser(body.data.user));
      toast.success("Account created");
      nav({ to: "/app" });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle={`Join thousands of users on ${site.siteName} — no OTP required.`}
      footer={
        <>
          Already a member? <Link to="/login" className="text-accent hover:underline">Login</Link>
          <span className="mx-2 text-muted-foreground">·</span>
          <Link to="/forgot-password" className="text-accent hover:underline">
            Forgot password
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name">
          <Input value={data.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Aarav Sharma" />
        </Field>
        <Field label="Email">
          <Input type="email" value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
        </Field>
        <Field label="Mobile">
          <div className="flex items-center">
            <span className="pl-3 text-secondary text-sm">+91</span>
            <Input value={data.mobile} onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="98xxxxxxxx" inputMode="numeric" />
          </div>
        </Field>
        <Field label="Password">
          <Input type="password" value={data.password} onChange={(e) => set("password", e.target.value)} placeholder="At least 6 characters" />
        </Field>
        <Button type="submit" disabled={loading} className="w-full h-11 gradient-primary border-0 hover-glow">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-secondary uppercase tracking-wide">{label}</Label>
      <div className="rounded-xl bg-surface border border-border ring-focus">{children}</div>
    </div>
  );
}
