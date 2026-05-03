import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiLogin, getApiErrorMessage } from "@/lib/api";
import { normalizeApiUser, setAuth } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { site } from "@/config/site";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: `Login — ${site.siteName}` }, { name: "description", content: `Login to your ${site.siteName} account.` }] }),
  component: LoginPage,
});

const schema = z.object({
  identifier: z.string().trim().min(3, "Enter email or mobile"),
  password: z.string().min(6, "Min 6 characters"),
});

function LoginPage() {
  const nav = useNavigate();
  const [identifier, setId] = useState("");
  const [password, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse({ identifier, password });
    if (!r.success) {
      toast.error(r.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiLogin(identifier, password);
      if (!data?.token || !data?.data?.user) throw new Error("Invalid server response");
      setAuth(data.token, normalizeApiUser(data.data.user));
      toast.success("Welcome back");
      nav({ to: "/app" });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle={`Login to access your ${site.siteName} dashboard`}
      footer={<>New here? <Link to="/register" className="text-accent hover:underline">Create account</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email or Mobile">
          <Input value={identifier} onChange={(e) => setId(e.target.value)} placeholder="you@email.com or 98xxxxxxxx" autoComplete="username" />
        </Field>
        <Field label="Password">
          <Input type="password" value={password} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        </Field>
        <div className="text-right text-sm">
          <Link to="/forgot-password" className="text-accent hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" disabled={loading} className="w-full h-11 gradient-primary border-0 hover-glow">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
        </Button>
      </form>
    </AuthShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-secondary uppercase tracking-wide">{label}</Label>
      <div className="rounded-xl bg-surface border border-border ring-focus">
        {children}
      </div>
    </div>
  );
}
