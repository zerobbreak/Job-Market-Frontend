import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "@tanstack/react-router";
import AuthLayout from "./layout/AuthLayout";
import ForgotPasswordModal from "./ForgotPasswordModal";
import {
  Field,
  FormError,
  PasswordInput,
  SubmitButton,
  inputClassName,
} from "./auth/AuthFields";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your latest job matches."
    >
      <FormError message={error} />

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Field id="email" label="Email">
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className={inputClassName}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field
          id="password"
          label="Password"
          action={
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Forgot password?
            </button>
          }
        >
          <PasswordInput
            id="password"
            required
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <div className="pt-1">
          <SubmitButton isSubmitting={isSubmitting}>Log in</SubmitButton>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-500">
        New to JobAgent?{" "}
        <Link
          to="/register"
          className="font-medium text-neutral-900 underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </AuthLayout>
  );
};

export default Login;
