import { useState } from "react";
import { functions } from "../firebase";

function NotificationTest() {
  const [fcmToken, setFcmToken] = useState("");
  const [testMessage, setTestMessage] = useState("Bu bir test bildirimidir.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sendTestNotification = async () => {
    if (!fcmToken.trim()) {
      alert("❌ Lütfen FCM token girin!");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { httpsCallable } = await import('firebase/functions');
      const sendTestNotification = httpsCallable(functions, 'sendTestNotification');
      
      console.log("🧪 Test bildirimi gönderiliyor...", { fcmToken, message: testMessage });
      
      const response = await sendTestNotification({
        fcmToken: fcmToken,
        message: testMessage
      });
      
      console.log("🧪 Test bildirimi sonucu:", response);
      setResult(response.data);
      
      alert("✅ Test bildirimi başarıyla gönderildi!");
      
    } catch (error: any) {
      console.error("❌ Test bildirimi hatası:", error);
      
      let errorMessage = "Bilinmeyen hata";
      if (error.code === 'functions/unauthenticated') {
        errorMessage = "Oturum süresi dolmuş. Lütfen tekrar giriş yapın.";
      } else if (error.code === 'functions/invalid-argument') {
        errorMessage = "Geçersiz FCM token.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ Test bildirimi gönderilemedi:\n${errorMessage}`);
      setResult({ success: false, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const getNotificationStats = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { httpsCallable } = await import('firebase/functions');
      const getNotificationStats = httpsCallable(functions, 'getNotificationStats');
      
      console.log("📊 Bildirim istatistikleri alınıyor...");
      
      const response = await getNotificationStats({
        days: 7
      });
      
      console.log("📊 Bildirim istatistikleri:", response);
      setResult(response.data);
      
    } catch (error: any) {
      console.error("❌ Bildirim istatistikleri hatası:", error);
      
      let errorMessage = "Bilinmeyen hata";
      if (error.code === 'functions/unauthenticated') {
        errorMessage = "Oturum süresi dolmuş. Lütfen tekrar giriş yapın.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ Bildirim istatistikleri alınamadı:\n${errorMessage}`);
      setResult({ success: false, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const clearNotificationLogs = async () => {
    if (!confirm("⚠️ Bildirim log'larını temizlemek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!")) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { httpsCallable } = await import('firebase/functions');
      const clearNotificationLogs = httpsCallable(functions, 'clearNotificationLogs');
      
      console.log("🗑️ Bildirim log'ları temizleniyor...");
      
      const response = await clearNotificationLogs({});
      
      console.log("🗑️ Bildirim log'ları temizlendi:", response);
      setResult(response.data);
      
      alert("✅ Bildirim log'ları başarıyla temizlendi!");
      
    } catch (error: any) {
      console.error("❌ Bildirim log'ları temizlenirken hata:", error);
      
      let errorMessage = "Bilinmeyen hata";
      if (error.code === 'functions/unauthenticated') {
        errorMessage = "Oturum süresi dolmuş. Lütfen tekrar giriş yapın.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ Bildirim log'ları temizlenemedi:\n${errorMessage}`);
      setResult({ success: false, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: "20px",
      maxWidth: "800px",
      margin: "0 auto"
    }}>
      <h1 style={{ color: "#333", marginBottom: "20px" }}>🧪 Bildirim Test Paneli</h1>
      
      <div style={{
        backgroundColor: "#f8f9fa",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "20px",
        border: "1px solid #dee2e6"
      }}>
        <h3 style={{ marginTop: 0, color: "#495057" }}>Test Bildirimi Gönder</h3>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            📱 FCM Token:
          </label>
          <input
            type="text"
            value={fcmToken}
            onChange={(e) => setFcmToken(e.target.value)}
            placeholder="FCM token'ı buraya yapıştırın..."
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
        </div>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            💬 Test Mesajı:
          </label>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Test mesajını buraya yazın..."
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
        </div>
        
        <button
          onClick={sendTestNotification}
          disabled={loading || !fcmToken.trim()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "📤 Gönderiliyor..." : "📤 Test Bildirimi Gönder"}
        </button>
      </div>
      
      <div style={{
        backgroundColor: "#f8f9fa",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "20px",
        border: "1px solid #dee2e6"
      }}>
        <h3 style={{ marginTop: 0, color: "#495057" }}>📊 Bildirim İstatistikleri</h3>
        
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={getNotificationStats}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "📊 Yükleniyor..." : "📊 Son 7 Günün İstatistikleri"}
          </button>
          
          <button
            onClick={clearNotificationLogs}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "🗑️ Temizleniyor..." : "🗑️ Eski Log'ları Temizle"}
          </button>
        </div>
      </div>
      
      {result && (
        <div style={{
          backgroundColor: result.success ? "#d4edda" : "#f8d7da",
          padding: "20px",
          borderRadius: "8px",
          border: `1px solid ${result.success ? "#c3e6cb" : "#f5c6cb"}`,
          color: result.success ? "#155724" : "#721c24"
        }}>
          <h3 style={{ marginTop: 0 }}>
            {result.success ? "✅ Başarılı" : "❌ Hata"}
          </h3>
          
          <pre style={{
            backgroundColor: "rgba(0,0,0,0.1)",
            padding: "10px",
            borderRadius: "4px",
            overflow: "auto",
            fontSize: "12px",
            whiteSpace: "pre-wrap"
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{
        backgroundColor: "#fff3cd",
        padding: "15px",
        borderRadius: "8px",
        border: "1px solid #ffeaa7",
        marginTop: "20px"
      }}>
        <h4 style={{ marginTop: 0, color: "#856404" }}>💡 Kullanım Talimatları</h4>
        <ul style={{ color: "#856404", margin: 0, paddingLeft: "20px" }}>
          <li>FCM token'ı Flutter uygulamasından alabilirsiniz</li>
          <li>Test bildirimi göndermek için geçerli bir FCM token gerekli</li>
          <li>Bildirim istatistikleri son 7 günün verilerini gösterir</li>
          <li>Hata durumunda console'u kontrol edin</li>
        </ul>
      </div>
    </div>
  );
}

export default NotificationTest; 