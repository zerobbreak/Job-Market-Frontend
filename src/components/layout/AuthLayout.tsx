import React from "react";
import { Link } from "@tanstack/react-router";
import { HeroPreview } from "../landing/HeroPreview";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-neutral-900 selection:bg-neutral-200 flex">
      {/* Form column */}
      <div className="flex w-full lg:w-1/2 flex-col px-4 sm:px-8">
        <header className="flex h-16 items-center justify-between max-w-md w-full mx-auto lg:mx-0 lg:max-w-none">
          <Link
            to="/"
            className="font-semibold text-lg tracking-tight text-neutral-900"
          >
            JobAgent
          </Link>
          <Link
            to="/"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Back to home
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-3xl font-semibold tracking-tight text-balance mb-2">
              {title}
            </h1>
            <p className="text-neutral-600 text-pretty mb-8">{subtitle}</p>
            {children}
          </div>
        </main>
      </div>

      {/* Product preview column */}
      <aside className="hidden lg:flex w-1/2 p-3">
        <div className="flex w-full flex-col justify-center rounded-3xl border border-neutral-200 bg-white px-10 xl:px-16">
          <p className="text-sm text-neutral-500 mb-4">
            Built for job seekers in South Africa
          </p>
          <h2 className="text-3xl xl:text-4xl font-semibold tracking-tight leading-[1.1] text-balance mb-10">
            Find jobs that fit you.{" "}
            <span className="text-neutral-400">
              Apply with a CV that fits them.
            </span>
          </h2>
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 fill-mode-both">
            <HeroPreview />
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AuthLayout;
