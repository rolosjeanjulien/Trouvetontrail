import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./lib/auth-context";
import { Navbar } from "./components/layout/Navbar";

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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/races" element={<RaceList />} />
            <Route path="/races/:id" element={<RaceDetail />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-race" element={<AddRace />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
