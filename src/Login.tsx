import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";



interface LoginProps {
  onLogin: (role: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const auth = getAuth();
    try {
      // Önce email/şifre ile giriş yap
      await signInWithEmailAndPassword(auth, email, password);
      
      // Sadece admin@yakalahadi.com e-posta adresine sahip kullanıcı admin olabilir
      if (email === "admin@yakalahadi.com") {
        // 2FA geçici olarak devre dışı - sadece email/şifre ile giriş
        onLogin("admin");
      } else {
        setError("Bu panele sadece admin erişebilir.");
        await auth.signOut();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{ 
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <div style={{ 
        maxWidth: 400, 
        width: "100%",
        margin: "0 auto", 
        padding: "32px 24px", 
        border: "1px solid #eee", 
        borderRadius: 12, 
        backgroundColor: "#fff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        textAlign: "center"
      }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ 
            fontSize: "28px", 
            marginBottom: 8, 
            color: "#333",
            fontWeight: "bold"
          }}>
            🎯 YakalaHadi
          </h1>
          <h2 style={{ 
            fontSize: "20px", 
            marginBottom: 8, 
            color: "#667eea",
            fontWeight: "600"
          }}>
            Admin Panel
          </h2>
          <p style={{ 
            color: "#666", 
            fontSize: "14px",
            margin: 0
          }}>
            Yönetim paneline giriş yapın
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: "block", 
              marginBottom: 6, 
              fontSize: "14px", 
              fontWeight: "500",
              color: "#333"
            }}>
              E-posta
            </label>
            <input
              type="email"
              placeholder="admin@yakalahadi.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ 
                width: "100%", 
                padding: "14px 16px", 
                border: "2px solid #e1e5e9", 
                borderRadius: 8, 
                fontSize: "16px",
                boxSizing: "border-box",
                transition: "border-color 0.3s ease",
                outline: "none"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e1e5e9";
              }}
            />
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: "block", 
              marginBottom: 6, 
              fontSize: "14px", 
              fontWeight: "500",
              color: "#333"
            }}>
              Şifre
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Şifrenizi girin"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ 
                  width: "100%", 
                  padding: "14px 40px 14px 16px", 
                  border: "2px solid #e1e5e9", 
                  borderRadius: 8, 
                  fontSize: "16px",
                  boxSizing: "border-box",
                  transition: "border-color 0.3s ease",
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e1e5e9";
                }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontSize: 20,
                  color: showPassword ? "#667eea" : "#aaa"
                }}
                title={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>


          
          <button 
            type="submit" 
            style={{ 
              width: "100%", 
              padding: "16px", 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
              color: "white", 
              border: "none", 
              borderRadius: 8, 
              fontSize: "16px", 
              fontWeight: "600",
              cursor: "pointer",
              boxSizing: "border-box",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
            }} 
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
          
          {error && (
            <div style={{ 
              color: "#dc3545", 
              marginTop: 16, 
              padding: "12px 16px",
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: 8,
              fontSize: "14px",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}
        </form>


      </div>
    </div>
  );
}

export default Login; 