import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";
import { resetPasswordFn } from "@/lib/auth";
import AuthLayout from "./layout/AuthLayout";
import {
  Field,
  FormError,
  PasswordInput,
  SubmitButton,
} from "./auth/AuthFields";

interface ResetPasswordProps {
  token: string | undefined;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ token }) => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid password reset link. Please try requesting a new one.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!token) {
      setError("Missing reset credentials");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPasswordFn({ data: { token, password } });
      setSuccess(true);
      // Wait a bit before redirecting so user sees success message
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 3000);
    } catch (err: any) {
      setError(
        err.message || "Failed to reset password. The link may have expired."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="You can now log in with your new password."
      >
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 mb-6 text-sm text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <p>Taking you to the login page...</p>
        </div>
        <Link
          to="/login"
          className="flex w-full items-center justify-center rounded-full bg-neutral-900 px-6 py-3 font-medium text-white transition-all hover:bg-neutral-700 active:scale-[0.98]"
        >
          Go to login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a password you haven't used before."
    >
      <FormError message={error} />

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Field id="password" label="New password" hint="At least 8 characters">
          <PasswordInput
            id="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Field id="confirm-password" label="Confirm password">
          <PasswordInput
            id="confirm-password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Field>

        <div className="pt-1">
          <SubmitButton isSubmitting={isSubmitting} disabled={!token}>
            Reset password
          </SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
