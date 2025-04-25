import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/public/Home";
import NavbarPublic from "./components/Navbar";
import Footer from "./components/Footer";
import LoginForm from "./pages/general/LoginForm";
import CrimeReportForm from "./pages/public/CrimeReportForm";
import Notifications from "./pages/public/Notifications";
import CrimeAlerts from "./pages/public/CrimeAlerts";
import MyReports from "./pages/public/MyReports";
import ReportDetail from "./pages/public/ReportDetail";
import About from "./components/About";
import PrivateRoute from "./components/PrivateRoute";

import Validations from "./pages/admin/Validations";
import Start from "./pages/general/Start";
import PoliceSignup from "./pages/general/PoliceSignup";
import PublicSignup from "./pages/general/PublicSignup";

import AdminDashboard from "./pages/admin/AdminDeshboard";
import ReportedCrimes from "./pages/admin/ReportedCrimes";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import AdminSignup from "./pages/general/AdminSignup";
import PoliceDashboard from "./pages/police/PoliceDashboard";
import PoliceReports from "./pages/police/PoliceReports";
import PoliceSettings from "./pages/police/PoliceSettings";
import ResolvedCases from "./pages/police/ResolvedCases";
import PendingCases from "./pages/police/PendingCases";
import UserReports from "./components/UserReports";
import Navbar from "./components/Navbar";
import Instructions from "./components/Instructions";
import ForgotPassword from "./pages/general/ForgotPassword";
import ResetPasswordWithCode from "./pages/general/ResetPasswordWithCode";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* starting routes  */}
          <Route path="/start" element={<Start />} />
          <Route path="/instructions" element={<Instructions />} />

          {/* signup routes  */}
          <Route path="/police-signup" element={<PoliceSignup />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route path="/public-signup" element={<PublicSignup />} />

          {/* login routes  */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Reset password routes */}
          <Route
            path="/reset-password-with-code"
            element={<ResetPasswordWithCode />}
          />

          {/* public routes  */}
          <Route path="/home" element={<Home />} />
          <Route path="/report" element={<CrimeReportForm />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/alert" element={<CrimeAlerts />} />
          <Route path="/about" element={<About />} />
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
          <Route path="/public/settings" element={<Settings />} />

          {/* police routes  */}
          <Route path="/police/dashboard" element={<PoliceDashboard />} />
          <Route path="/police/reports" element={<PoliceReports />} />
          <Route path="/police/analytics" element={<Analytics />} />
          <Route path="/police/settings" element={<Settings />} />
          <Route path="/police/pending" element={<PendingCases />} />
          <Route path="/police/resolved" element={<ResolvedCases />} />

          {/* admin routes  */}
          <Route
            path="/admin/validations"
            element={
              <PrivateRoute allowedRole="admin">
                <Validations />
              </PrivateRoute>
            }
          />
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
        </Routes>

        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
