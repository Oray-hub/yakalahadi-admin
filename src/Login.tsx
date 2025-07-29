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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Sadece admin@yakalahadi.com e-posta adresine sahip kullanıcı admin olabilir
      if (email === "admin@yakalahadi.com") {
        onLogin("admin");
      } else {
        setError("Bu panele sadece admin erişebilir.");
        await auth.signOut(); // Kullanıcıyı çıkış yaptır
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: "100px auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>YakalaHadi Admin Giriş</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ 
            width: "100%", 
            marginBottom: 12, 
            padding: 12, 
            border: "1px solid #ddd", 
            borderRadius: 4, 
            fontSize: 14,
            boxSizing: "border-box"
          }}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ 
            width: "100%", 
            marginBottom: 12, 
            padding: 12, 
            border: "1px solid #ddd", 
            borderRadius: 4, 
            fontSize: 14,
            boxSizing: "border-box"
          }}
        />
        <button 
          type="submit" 
          style={{ 
            width: "100%", 
            padding: 12, 
            backgroundColor: "#667eea", 
            color: "white", 
            border: "none", 
            borderRadius: 4, 
            fontSize: 14, 
            cursor: "pointer",
            boxSizing: "border-box"
          }} 
          disabled={loading}
        >
          {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </button>
        {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
      </form>
    </div>
  );
}

export default Login; 