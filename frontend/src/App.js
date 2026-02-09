import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./lib/auth-context";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { CookieBanner } from "./components/CookieBanner";

// Pages
import Home from "./pages/Home";
import RaceList from "./pages/RaceList";
import MapView from "./pages/MapView";
import RaceDetail from "./pages/RaceDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddRace from "./pages/AddRace";
import AdminPanel from "./pages/AdminPanel";
import ImportRaces from "./pages/ImportRaces";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MentionsLegales from "./pages/MentionsLegales";
import Confidentialite from "./pages/Confidentialite";
import CGU from "./pages/CGU";

// Pages that should not show footer
const noFooterPages = ['/map', '/login', '/register', '/forgot-password', '/reset-password'];

function AppContent() {
  const pathname = window.location.pathname;
  const showFooter = !noFooterPages.some(p => pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/races" element={<RaceList />} />
          <Route path="/races/:id" element={<RaceDetail />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-race" element={<AddRace />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/import" element={<ImportRaces />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/cgu" element={<CGU />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
      <CookieBanner />
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fafafa',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
