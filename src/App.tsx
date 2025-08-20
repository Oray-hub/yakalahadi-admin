import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import Login from "./Login";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Companies from "./components/Companies";
import Users from "./components/Users";
import Campaigns from "./components/Campaigns";
import Reviews from "./components/Reviews";
import Accounting from "./components/Accounting";
import Export from "./components/Export";
import BulkNotification from "./components/BulkNotification";

import "./firebase"; // Firebase'i başlat

const menu = [
  { path: "/users", label: "Kullanıcılar", icon: "👥" },
  { path: "/companies", label: "Firmalar", icon: "🏢" },
  { path: "/campaigns", label: "Kampanyalar", icon: "🎯" },
  { path: "/reviews", label: "Yorumlar ve Puanlar", icon: "⭐" },
  { path: "/accounting", label: "Muhasebe Verileri", icon: "💰" },
  { path: "/export", label: "Dışa Aktar", icon: "📊" },
  { path: "/bulk-notification", label: "Toplu Bildirim", icon: "📢" },
];

function Panel({ onLogout }: { onLogout: () => void }) {
  const [activeMenu, setActiveMenu] = useState("/users");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      width: "100%", 
      overflow: "hidden",
      backgroundColor: "#f5f5f5",
      position: "fixed",
      top: 0,
      left: 0
    }}>
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={toggleSidebar}
        style={{ display: "none" }}
      >
        ☰
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
        style={{ display: "none" }}
      />

      {/* Sidebar */}
      <aside 
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{ 
          width: 180, 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
          color: "#fff", 
          padding: 16,
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          height: "100vh",
          flexShrink: 0,
          overflow: "hidden"
        }}
      >
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
            <img 
              src="/logo.gif" 
              alt="YakalaHadi Logo" 
              style={{ 
                width: 32, 
                height: 32, 
                marginRight: 8,
                borderRadius: 4
              }} 
            />
            <h2 style={{ color: "#fff", fontSize: 20, margin: 0, fontWeight: "bold" }}>
              YakalaHadi
            </h2>
          </div>
          <p style={{ color: "#e0e0e0", fontSize: 12, margin: "6px 0 0 0", textAlign: "center" }}>
            Admin
          </p>
          <p style={{ color: "#e0e0e0", fontSize: 10, margin: "4px 0 0 0", textAlign: "center" }}>
            Yönetim Paneli
          </p>
        </div>
        
        {/* Navigation Menu */}
        <nav style={{ marginBottom: 32 }}>
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                setActiveMenu(item.path);
                closeSidebar();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                color: "#fff",
                textDecoration: "none",
                borderRadius: 8,
                marginBottom: 4,
                transition: "all 0.3s ease",
                backgroundColor: activeMenu === item.path ? "rgba(255,255,255,0.2)" : "transparent"
              }}
              onMouseEnter={(e) => {
                if (activeMenu !== item.path) {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== item.path) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span style={{ marginRight: 12, fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: activeMenu === item.path ? "600" : "400" }}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              padding: "12px 16px",
              color: "#fff",
              backgroundColor: "transparent",
              border: "none",
              transition: "all 0.3s ease",
              fontSize: 16,
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <span style={{ marginRight: 12, fontSize: 18 }}>🚪</span>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className="admin-main"
        style={{ 
          flex: 1, 
          background: "#fff", 
          height: "100vh",
          width: "calc(100vw - 180px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
          maxWidth: "calc(100vw - 180px)"
        }}
      >
        <div 
          className="admin-content"
          style={{ 
            background: "#fff", 
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
            maxWidth: "100%"
          }}
        >
          <Routes>
            <Route path="/users" element={<Users />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/export" element={<Export />} />
            <Route path="/bulk-notification" element={
              <BulkNotification onClose={() => setActiveMenu("/users")} />
            } />
            <Route path="/" element={<Navigate to="/users" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    
    // Firebase Auth durumunu dinle
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        // Kullanıcı oturum açmış
        if (user.email === "admin@yakalahadi.com") {
          setRole("admin");
        } else {
          setRole(null);
        }
      } else {
        // Kullanıcı oturum açmamış
        setRole(null);
      }
      setLoading(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);

  // Yükleme durumunda loading göster
  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div style={{ 
          textAlign: "center",
          color: "white"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
          <h2 style={{ margin: "0 0 8px 0" }}>YakalaHadi</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (role === null) {
    return <Login onLogin={setRole} />;
  }

  if (role !== "admin" && role !== "operator") {
    return (
      <div style={{ 
        textAlign: "center", 
        marginTop: 100,
        padding: 40,
        backgroundColor: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        maxWidth: 500,
        margin: "100px auto"
      }}>
        <h2 style={{ color: "#dc3545", marginBottom: 16 }}>🚫 Erişim Reddedildi</h2>
        <p style={{ color: "#666", fontSize: 16 }}>
          Bu panele sadece admin ve operatörler erişebilir.
        </p>
      </div>
    );
  }

  return (
    <Router>
      <Panel onLogout={() => {
        const auth = getAuth();
        auth.signOut();
        setRole(null);
      }} />
    </Router>
  );
}

export default App; 