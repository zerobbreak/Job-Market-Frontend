import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "@tanstack/react-router";
import AuthLayout from "./layout/AuthLayout";
import {
  Field,
  FormError,
  PasswordInput,
  SubmitButton,
  inputClassName,
} from "./auth/AuthFields";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password, name);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Failed to create your account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Upload your CV next and see which jobs fit you in minutes."
    >
      <FormError message={error} />

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Field id="name" label="Full name">
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            className={inputClassName}
            placeholder="Thandi Mokoena"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

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

        <Field id="password" label="Password" hint="At least 8 characters">
          <PasswordInput
            id="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Choose a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <div className="pt-1">
          <SubmitButton isSubmitting={isSubmitting}>Create account</SubmitButton>
        </div>
        <p className="text-center text-sm text-neutral-500">
          Free to start, no card needed
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-neutral-900 underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
