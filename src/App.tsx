import { useState } from "react";
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
        
        <nav style={{ flex: 1, overflow: "hidden" }}>
          {menu.map(item => (
            <div key={item.path}>
              <Link 
                to={item.path} 
                onClick={() => {
                  setActiveMenu(item.path);
                  closeSidebar(); // Mobile'da menüyü kapat
                }}
                style={{ 
                  color: "#fff", 
                  textDecoration: "none", 
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  margin: "4px 0",
                  borderRadius: 8,
                  backgroundColor: activeMenu === item.path ? "rgba(255,255,255,0.2)" : "transparent",
                  transition: "all 0.3s ease",
                  fontSize: 16
                }}
              >
                <span style={{ marginRight: 12, fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </Link>
            </div>
                    ))}
        </nav>

        {/* Çıkış Yap Butonu */}
        <div style={{
          marginTop: "auto",
          padding: "16px 0",
          borderTop: "1px solid rgba(255,255,255,0.1)"
        }}>
          <button
            onClick={() => {
              onLogout();
              closeSidebar(); // Mobile'da menüyü kapat
            }}
            style={{
              width: "100%",
              color: "#fff",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              margin: "4px 0",
              borderRadius: 8,
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
      <Panel onLogout={() => setRole(null)} />
    </Router>
  );
}

export default App; 