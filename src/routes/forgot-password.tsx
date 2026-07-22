import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthFooterLink, AuthShell } from "@/components/auth/AuthShell";
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
      variant="reset"
      title="Reset password"
      subtitle="Enter your registered mobile number. We'll send a real OTP via SMS to reset your password."
      footer={
        <>
          Remember it? <AuthFooterLink to="/login">Back to sign in</AuthFooterLink>
        </>
      }
    >
      <PasswordResetOtpFlow
        mobileOnly
        submitLabel="Set new password"
        onSuccess={() => {
          nav({ to: "/login" });
        }}
      />
    </AuthShell>
  );
}
