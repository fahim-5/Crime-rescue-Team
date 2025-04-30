import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Public
import Home from "./pages/public/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginForm from "./pages/general/LoginForm";
import CrimeReportForm from "./pages/public/CrimeReportForm";
import Notifications from "./pages/public/Notifications";
import CrimeAlerts from "./pages/public/CrimeAlerts";
import MyReports from "./pages/public/MyReports";
import ReportDetail from "./pages/public/ReportDetail";
import About from "./components/About";
import Instructions from "./components/Instructions";
import TestAlert from "./components/TestAlert";

// Signup & Auth
import Start from "./pages/general/Start";
import PoliceSignup from "./pages/general/PoliceSignup";
import PublicSignup from "./pages/general/PublicSignup";
import AdminSignup from "./pages/general/AdminSignup";
import ForgotPassword from "./pages/general/ForgotPassword";
import ResetPasswordWithCode from "./pages/general/ResetPasswordWithCode";

// Admin
import AdminDashboard from "./pages/admin/AdminDeshboard";
import ReportedCrimes from "./pages/admin/ReportedCrimes";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import Validations from "./pages/admin/Validations";
import AdminReportDetail from "./pages/admin/AdminReportDetail";

// Police
import PoliceDashboard from "./pages/police/PoliceDashboard";
import PoliceReports from "./pages/police/PoliceReports";
import PoliceSettings from "./pages/police/PoliceSettings";
import ResolvedCases from "./pages/police/ResolvedCases";
import PendingCases from "./pages/police/PendingCases";

// Shared
import UserReports from "./components/UserReports";
import PrivateRoute from "./components/PrivateRoute";
import MessagesPanel from "./components/MessagesPanel";
import Management from "./components/Management";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Starting Routes */}
          <Route path="/start" element={<Start />} />
          <Route path="/instructions" element={<Instructions />} />

          {/* Auth Routes */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password-with-code" element={<ResetPasswordWithCode />} />

          {/* Signup Routes */}
          <Route path="/police-signup" element={<PoliceSignup />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route path="/public-signup" element={<PublicSignup />} />

          {/* Public User Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/report" element={<CrimeReportForm />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/alert" element={<CrimeAlerts />} />
          <Route path="/crime-alerts" element={<CrimeAlerts />} />
          <Route path="/test-alert" element={<TestAlert />} />
          <Route path="/about" element={<About />} />
          <Route path="/public/settings" element={<Settings />} />
          <Route path="/messages" element={<MessagesPanel />} />

          <Route
            path="/reports"
            element={
              <PrivateRoute allowedRole="public">
                <MyReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/report/:id"
            element={
              <PrivateRoute allowedRole="public">
                <ReportDetail />
              </PrivateRoute>
            }
          />

          {/* Police Routes */}
          <Route path="/police/dashboard" element={<PoliceDashboard />} />
          <Route path="/police/reports" element={<ReportedCrimes />} />
          <Route path="/police/analytics" element={<Analytics />} />
          <Route path="/police/settings" element={<PoliceSettings />} />
          <Route path="/police/pending" element={<PendingCases />} />
          <Route path="/police/resolved" element={<ResolvedCases />} />
          <Route path="/police/messages" element={<MessagesPanel />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <PrivateRoute allowedRole="admin">
                <ReportedCrimes />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <PrivateRoute allowedRole="admin">
                <Analytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <PrivateRoute allowedRole="admin">
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/management"
            element={
              <PrivateRoute allowedRole="admin">
                <Management />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/report/:id"
            element={
              <PrivateRoute allowedRole="admin">
                <AdminReportDetail />
              </PrivateRoute>
            }
          />
          <Route path="/admin/messages" element={<MessagesPanel />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
