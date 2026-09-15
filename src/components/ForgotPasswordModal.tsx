import React, { useState, useEffect } from "react";
import { X, CheckCircle } from "lucide-react";
import {
  Field,
  FormError,
  SubmitButton,
  inputClassName,
} from "./auth/AuthFields";
import { forgotPasswordFn } from "@/lib/auth";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    // Check for active cooldown on mount
    const cooldownEnd = localStorage.getItem("resetPasswordCooldown");
    if (cooldownEnd) {
      const remaining = Math.ceil((parseInt(cooldownEnd) - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
      } else {
        localStorage.removeItem("resetPasswordCooldown");
      }
    }
  }, []);

  useEffect(() => {
    // Timer interval
    if (cooldown > 0) {
      const interval = setInterval(() => {
        setCooldown((current) => {
          if (current <= 1) {
            clearInterval(interval);
            localStorage.removeItem("resetPasswordCooldown");
            return 0;
          }
          return current - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setError("");
    setIsSubmitting(true);

    try {
      await forgotPasswordFn({ data: { email } });

      setSuccess(true);
      setEmail("");

      // Set 60s cooldown
      const cooldownTime = 60;
      setCooldown(cooldownTime);
      localStorage.setItem(
        "resetPasswordCooldown",
        (Date.now() + cooldownTime * 1000).toString()
      );
    } catch (err: any) {
      setError(err.message || "Failed to send recovery email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Don't clear cooldown on close, only other states
    setEmail("");
    setError("");
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/30 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
        className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-12px_rgba(0,0,0,0.18)] animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 mb-5">
              <CheckCircle className="h-5 w-5 text-emerald-700" />
            </div>
            <h3
              id="forgot-password-title"
              className="text-xl font-semibold tracking-tight mb-2"
            >
              Check your email
            </h3>
            <p className="text-sm text-neutral-600 mb-6">
              If an account exists for that address, we've sent a link to reset
              your password.
            </p>
            <SubmitButtonLike onClick={handleClose}>Got it</SubmitButtonLike>
            {cooldown > 0 && (
              <p className="mt-3 text-center text-xs text-neutral-500">
                You can request another email in {cooldown}s
              </p>
            )}
          </div>
        ) : (
          <>
            <h3
              id="forgot-password-title"
              className="text-xl font-semibold tracking-tight mb-2"
            >
              Reset your password
            </h3>
            <p className="text-sm text-neutral-600 mb-6">
              Enter your email and we'll send you a link to set a new password.
            </p>

            <FormError message={error} />

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field id="reset-email" label="Email">
                <input
                  id="reset-email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  className={inputClassName}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-full border border-neutral-200 bg-white px-6 py-3 font-medium text-neutral-900 transition-all hover:bg-neutral-50 active:scale-[0.98]"
                >
                  Cancel
                </button>
                <div className="flex-1">
                  <SubmitButton
                    isSubmitting={isSubmitting}
                    disabled={cooldown > 0}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Send link"}
                  </SubmitButton>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const SubmitButtonLike: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-center rounded-full bg-neutral-900 px-6 py-3 font-medium text-white transition-all hover:bg-neutral-700 active:scale-[0.98]"
  >
    {children}
  </button>
);

export default ForgotPasswordModal;
