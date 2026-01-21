import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "./components/ui/error-boundary";
import { useAuth } from "./context/AuthContext";
import GuestRoute from "./components/layout/GuestRoute";
import Login from "./components/Login";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword";
import RootLayout from "./components/layout/RootLayout";
import Dashboard from "./pages/Dashboard";
import JobSearch from "./pages/JobSearch";
import Applications from "./pages/Applications";
import Profile from "./pages/Profile";
import LandingPage from "./pages/LandingPage";
import CVUpload from "./pages/CVUpload";
import MatchedJobs from "./pages/MatchedJobs";
import CVEditor from "./pages/CVEditor";
import AdminDashboard from "./pages/AdminDashboard";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C]">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
      <Route
        path="/"
        element={
          <GuestRoute>
            <LandingPage />
          </GuestRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <GuestRoute>
            <ResetPassword />
          </GuestRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        element={
          <RequireAuth>
            <RootLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cv-upload" element={<CVUpload />} />
        <Route path="/job-matches" element={<MatchedJobs />} />
        <Route path="/search" element={<JobSearch />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cv-editor" element={<CVEditor />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ErrorBoundary>
  );
}

export default App;
