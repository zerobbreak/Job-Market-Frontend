import Navbar from "../components/layout/Navbar";
import { HeroPreview } from "../components/landing/HeroPreview";
import { FloatingJobCards } from "../components/landing/FloatingJobCards";
import { HowItWorks } from "../components/landing/HowItWorks";
import { AfterYouApply } from "../components/landing/AfterYouApply";
import { contributors } from "../constants/constants";
import { Link } from "@tanstack/react-router";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-neutral-900 selection:bg-neutral-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-x-clip px-4 pt-36 pb-20 md:pt-44 md:pb-28">
        <FloatingJobCards />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-sm text-neutral-500 mb-5 animate-in fade-in duration-700">
            Built for job seekers in South Africa
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.08] text-balance mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Find jobs that fit you.
            <br className="hidden sm:block" />{" "}
            <span className="text-neutral-400">
              Apply with a CV that fits them.
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-lg text-neutral-600 leading-relaxed text-pretty mb-9 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
            Upload your CV once. We search LinkedIn, Indeed, and more, then
            tailor your CV and cover letter for each role worth applying to.
          </p>

          <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
            <Link
              to="/register"
              className="px-7 py-3.5 bg-neutral-900 hover:bg-neutral-700 active:scale-[0.98] text-white rounded-full font-medium transition-all"
            >
              Upload your CV
            </Link>
            <span className="text-sm text-neutral-500">
              Free to start, no card needed
            </span>
          </div>
        </div>

        <div className="mt-16 md:mt-20 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 fill-mode-both">
          <HeroPreview />
        </div>
      </section>

      <HowItWorks />

      <AfterYouApply />

      {/* Final call to action */}
      <section className="px-4 pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto rounded-3xl bg-neutral-900 px-6 py-16 md:py-24 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white text-balance mb-4">
            Your next job starts with your CV
          </h2>
          <p className="max-w-md mx-auto text-lg text-neutral-400 text-pretty mb-9">
            Upload it and see which jobs fit you in minutes.
          </p>
          <Link
            to="/register"
            className="inline-block px-7 py-3.5 bg-white hover:bg-neutral-200 active:scale-[0.98] text-neutral-900 rounded-full font-medium transition-all"
          >
            Upload your CV
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-neutral-200/70">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <p className="text-center sm:text-left">
            <span className="font-medium text-neutral-900">JobAgent</span>
            {" · "}Built by {contributors.map((c) => c.name).join(" and ")}
          </p>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-neutral-900 transition-colors">
              Log in
            </Link>
            <a href="#how-it-works" className="hover:text-neutral-900 transition-colors">
              How it works
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
