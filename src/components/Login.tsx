import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./layout/AuthLayout";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue your journey and let AI optimize your job search."
    >
      <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-xl animate-fade-in">
        <div className="text-center mb-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
          <p className="text-gray-400 text-sm">
            Enter your credentials to access your account
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-center mb-6 animate-shake">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-white/20"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <a
                href="#"
                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-white/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-500 font-semibold shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
            style={{ animationDelay: "300ms" }}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div
          className="mt-6 text-center animate-slide-up"
          style={{ animationDelay: "400ms" }}
        >
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
