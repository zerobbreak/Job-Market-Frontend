import React, { useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

export const inputClassName =
  "block w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-neutral-900 placeholder-neutral-400 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-4 focus:ring-neutral-900/5";

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  id,
  label,
  hint,
  action,
  children,
}) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-900">
        {label}
      </label>
      {action}
    </div>
    {children}
    {hint && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
  </div>
);

export const PasswordInput: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">
> = (props) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`${inputClassName} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-400 hover:text-neutral-700 transition-colors"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

export const FormError: React.FC<{ message: string }> = ({ message }) =>
  message ? (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 mb-6 text-sm text-red-700 animate-in fade-in duration-300"
    >
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  ) : null;

interface SubmitButtonProps {
  isSubmitting: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  disabled,
  children,
}) => (
  <button
    type="submit"
    disabled={isSubmitting || disabled}
    className="flex w-full items-center justify-center rounded-full bg-neutral-900 px-6 py-3 font-medium text-white transition-all hover:bg-neutral-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
  >
    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : children}
  </button>
);
