import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordResetOtpFlow } from "@/components/auth/PasswordResetOtpFlow";
import { site } from "@/config/site";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: `Reset password — ${site.siteName}` },
      { name: "description", content: `Reset your ${site.siteName} password with a mobile OTP.` },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const nav = useNavigate();

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your registered email or mobile. We’ll text an OTP to your mobile on file."
      footer={
        <>
          Remember it?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      <PasswordResetOtpFlow
        submitLabel="Set new password"
        onSuccess={() => {
          nav({ to: "/login" });
        }}
      />
    </AuthShell>
  );
}
