import { Link } from "@tanstack/react-router";

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-neutral-200/70 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="font-semibold text-lg tracking-tight text-neutral-900"
          >
            JobAgent
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-neutral-900 hover:bg-neutral-700 active:scale-[0.97] text-white px-4 py-2 rounded-full transition-all"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
