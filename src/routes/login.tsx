import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthFooterLink, AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { Input } from "@/components/ui/input";
import { apiLogin, getApiErrorMessage } from "@/lib/api";
import { SESSION_EXPIRED_FLASH_KEY } from "@/lib/constants";
import { normalizeApiUser, setAuth } from "@/lib/store";
import { Lock, Shield, UserRound } from "lucide-react";
import { site } from "@/config/site";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: `Login — ${site.siteName}` },
      { name: "description", content: `Login to your ${site.siteName} account.` },
    ],
  }),
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

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_EXPIRED_FLASH_KEY) !== "1") return;
      sessionStorage.removeItem(SESSION_EXPIRED_FLASH_KEY);
      toast.info("You've been signed out", {
        description: "Your session expired. Please sign in again to continue.",
        duration: 6500,
      });
    } catch {
      /* ignore */
    }
  }, []);

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
      variant="login"
      title="Welcome back"
      subtitle={`Access your ${site.siteName} dashboard — buy, sell, withdraw, and track every order in one place.`}
      footer={
        <>
          New here? <AuthFooterLink to="/register">Create a free account</AuthFooterLink>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-6">
        <AuthField label="Email or mobile" icon={UserRound} size="lg">
          <Input
            value={identifier}
            onChange={(e) => setId(e.target.value)}
            placeholder="you@email.com or 98xxxxxxxx"
            autoComplete="username"
          />
        </AuthField>
        <AuthField label="Password" icon={Lock} size="lg">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </AuthField>
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-success shrink-0" />
            Secure sign-in
          </p>
          <Link
            to="/forgot-password"
            className="text-sm sm:text-base font-medium text-accent hover:text-accent/90 underline-offset-4 hover:underline shrink-0"
          >
            Forgot password?
          </Link>
        </div>
        <AuthSubmitButton loading={loading} className="h-[3.25rem] sm:h-14 text-base sm:text-lg">
          Sign in
        </AuthSubmitButton>
      </form>
    </AuthShell>
  );
}
