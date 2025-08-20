import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { verifyTOTP, generateOTPAuthURL } from "./utils/totp";
import QRCode from "react-qr-code";

interface LoginProps {
  onLogin: (role: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [secret, setSecret] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  // Admin için sabit secret (gerçek uygulamada bu veritabanında saklanmalı)
  const ADMIN_SECRET = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP"; // YakalaHadi Admin için sabit secret

  useEffect(() => {
    // QR kod URL'ini oluştur
    if (secret) {
      const url = generateOTPAuthURL(secret, email || "admin@yakalahadi.com");
      setQrUrl(url);
    }
  }, [secret, email]);



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
        // 2FA doğrulaması yap
        const isValidToken = await verifyTOTP(ADMIN_SECRET, totpToken);
        
        if (isValidToken) {
          onLogin("admin");
        } else {
          setError("Google Authenticator kodunu yanlış girdiniz.");
          await auth.signOut();
        }
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

  const setup2FA = () => {
    setSecret(ADMIN_SECRET);
    setShowQR(true);
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

          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: "block", 
              marginBottom: 6, 
              fontSize: "14px", 
              fontWeight: "500",
              color: "#333"
            }}>
              🔐 Google Authenticator Kodu
            </label>
            <input
              type="text"
              placeholder="6 haneli kodu girin"
              value={totpToken}
              onChange={e => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              style={{ 
                width: "100%", 
                padding: "14px 16px", 
                border: "2px solid #e1e5e9", 
                borderRadius: 8, 
                fontSize: "16px",
                boxSizing: "border-box",
                transition: "border-color 0.3s ease",
                outline: "none",
                textAlign: "center",
                letterSpacing: "2px",
                fontFamily: "monospace"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e1e5e9";
              }}
            />
            <div style={{ 
              marginTop: 8, 
              fontSize: "12px", 
              color: "#666",
              textAlign: "center"
            }}>
              Google Authenticator uygulamasından 6 haneli kodu girin
            </div>
          </div>

          <div style={{ marginBottom: 16, textAlign: "center" }}>
            <button
              type="button"
              onClick={setup2FA}
              style={{
                padding: "8px 16px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
                marginBottom: "8px"
              }}
            >
              📱 Google Authenticator Kurulumu
            </button>
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

        {/* Google Authenticator Kurulum Modal */}
        {showQR && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999999
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
            }}>
              <h3 style={{ marginBottom: "16px", color: "#333" }}>
                📱 Google Authenticator Kurulumu
              </h3>
              
              <div style={{ marginBottom: "20px" }}>
                <QRCode 
                  value={qrUrl} 
                  size={200}
                  style={{ margin: "0 auto" }}
                />
              </div>
              
              <div style={{ marginBottom: "20px", textAlign: "left" }}>
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
                  <strong>Adımlar:</strong>
                </p>
                <ol style={{ fontSize: "14px", color: "#666", paddingLeft: "20px" }}>
                  <li>Google Authenticator uygulamasını indirin</li>
                  <li>QR kodu tarayın veya manuel olarak secret'ı girin</li>
                  <li>6 haneli kodu giriş sayfasına yazın</li>
                </ol>
              </div>
              
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>
                  Manuel giriş için secret:
                </p>
                <code style={{
                  backgroundColor: "#f8f9fa",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  color: "#333"
                }}>
                  {secret}
                </code>
              </div>
              
              <button
                onClick={() => setShowQR(false)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                Tamam
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login; 