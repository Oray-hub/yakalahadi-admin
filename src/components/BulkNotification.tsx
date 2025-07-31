import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { NotificationService } from "../services/notificationService";

interface BulkNotificationProps {
  onClose: () => void;
}

function BulkNotification({ onClose }: BulkNotificationProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);

  // Kullanıcı sayısını al
  const fetchUserCount = async () => {
    try {
      const db = getFirestore();
      const usersSnapshot = await getDocs(collection(db, 'users'));
      setUserCount(usersSnapshot.size);
    } catch (error) {
      console.error("Kullanıcı sayısı alınırken hata:", error);
    }
  };

  // Component mount olduğunda kullanıcı sayısını al
  useEffect(() => {
    fetchUserCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      alert("Lütfen başlık ve mesaj alanlarını doldurun!");
      return;
    }

    if (userCount === 0) {
      alert("Gönderilecek kullanıcı bulunamadı!");
      return;
    }

    const confirmSend = window.confirm(
      `📢 Toplu Bildirim Gönderimi\n\n` +
      `Başlık: ${title}\n` +
      `Mesaj: ${message}\n\n` +
      `Bu bildirim ${userCount} kullanıcıya gönderilecek.\n` +
      `Devam etmek istediğinizden emin misiniz?`
    );

    if (!confirmSend) return;

    setIsLoading(true);

    try {
      const result = await NotificationService.sendBulkNotification(title, message);
      
      if (result.success) {
        alert(`✅ Toplu bildirim başarıyla gönderildi!\n\n📱 ${userCount} kullanıcıya bildirim gönderildi.`);
        setTitle("");
        setMessage("");
        onClose();
      } else {
        alert(`❌ Toplu bildirim gönderilemedi:\n${result.message}`);
      }
    } catch (error: any) {
      console.error("Toplu bildirim gönderilirken hata:", error);
      alert(`❌ Toplu bildirim gönderilirken hata oluştu:\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Ana Başlık */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '24px' }}>
          📢 Toplu Bildirim Merkezi
        </h2>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
          Tüm kullanıcılara toplu bildirim gönderin.
        </p>
      </div>

      {/* Ana Kart */}
      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #dee2e6',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Kullanıcı Sayısı Kartı */}
          <div style={{
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #bbdefb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', marginRight: '12px' }}>👥</span>
              <div>
                <div style={{ color: '#1565c0', fontWeight: '600', fontSize: '16px' }}>
                  Toplam {userCount} kullanıcıya bildirim gönderilecek
                </div>
                <div style={{ color: '#1976d2', fontSize: '14px', marginTop: '4px' }}>
                  Bu bildirim tüm kayıtlı kullanıcılara ulaşacak
                </div>
              </div>
            </div>
          </div>

          {/* Başlık Kartı */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            border: '1px solid #e0e0e0'
          }}>
            <label htmlFor="title" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              📝 Bildirim Başlığı *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#9c27b0';
                e.target.style.boxShadow = '0 0 0 2px rgba(156, 39, 176, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Örnek: Yeni Kampanya Başladı!"
              maxLength={100}
              required
            />
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '6px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Kısa ve dikkat çekici olmalı</span>
              <span>{title.length}/100 karakter</span>
            </div>
          </div>

          {/* Mesaj Kartı */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            border: '1px solid #e0e0e0'
          }}>
            <label htmlFor="message" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              💬 Bildirim Mesajı *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#9c27b0';
                e.target.style.boxShadow = '0 0 0 2px rgba(156, 39, 176, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Bildirim mesajınızı buraya yazın..."
              maxLength={500}
              required
            />
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '6px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Net ve anlaşılır olmalı</span>
              <span>{message.length}/500 karakter</span>
            </div>
          </div>

          {/* Örnek Mesajlar Kartı */}
          <div style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            border: '1px solid #e0e0e0'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              margin: '0 0 12px 0'
            }}>
              💡 Örnek Mesajlar:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div 
                style={{
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#666',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8f5e8';
                  e.currentTarget.style.color = '#2e7d32';
                  e.currentTarget.style.borderColor = '#c8e6c9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#666';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onClick={() => { setTitle("Yeni Kampanya Başladı!"); setMessage("Yeni kampanyalarımızı kaçırmayın! Hemen kontrol edin."); }}
              >
                • "Yeni kampanyalarımızı kaçırmayın! Hemen kontrol edin."
              </div>
              <div 
                style={{
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#666',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8f5e8';
                  e.currentTarget.style.color = '#2e7d32';
                  e.currentTarget.style.borderColor = '#c8e6c9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#666';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onClick={() => { setTitle("Sistem Bakımı"); setMessage("Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz."); }}
              >
                • "Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz."
              </div>
              <div 
                style={{
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#666',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8f5e8';
                  e.currentTarget.style.color = '#2e7d32';
                  e.currentTarget.style.borderColor = '#c8e6c9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#666';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onClick={() => { setTitle("Yeni Özellikler"); setMessage("Yeni özellikler eklendi! Uygulamayı güncelleyin."); }}
              >
                • "Yeni özellikler eklendi! Uygulamayı güncelleyin."
              </div>
            </div>
          </div>

          {/* İpuçları Kartı */}
          <div style={{
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #bbdefb'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#1565c0',
              margin: '0 0 8px 0'
            }}>
              📋 İpuçları:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '13px', color: '#1976d2' }}>• Başlık kısa ve dikkat çekici olmalı</div>
              <div style={{ fontSize: '13px', color: '#1976d2' }}>• Mesaj net ve anlaşılır olmalı</div>
              <div style={{ fontSize: '13px', color: '#1976d2' }}>• Emoji kullanarak dikkat çekebilirsiniz</div>
              <div style={{ fontSize: '13px', color: '#1976d2' }}>• Gereksiz bildirimlerden kaçının</div>
            </div>
          </div>

          {/* Butonlar */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid #e0e0e0'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: '#fff',
                color: '#666',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.borderColor = '#ccc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.borderColor = '#ddd';
              }}
              disabled={isLoading}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !message.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: isLoading || !title.trim() || !message.trim() ? '#ccc' : '#9c27b0',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: isLoading || !title.trim() || !message.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && title.trim() && message.trim()) {
                  e.currentTarget.style.backgroundColor = '#7b1fa2';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && title.trim() && message.trim()) {
                  e.currentTarget.style.backgroundColor = '#9c27b0';
                }
              }}
                         >
               {isLoading ? (
                 <>
                   <div style={{
                     width: '16px',
                     height: '16px',
                     border: '2px solid transparent',
                     borderTop: '2px solid white',
                     borderRadius: '50%',
                     animation: 'spin 1s linear infinite'
                   }}></div>
                   Gönderiliyor...
                 </>
               ) : (
                 <>
                   📢 Toplu Bildirim Gönder
                 </>
               )}
             </button>
           </div>
         </form>
       </div>

       <style>{`
         @keyframes spin {
           0% { transform: rotate(0deg); }
           100% { transform: rotate(360deg); }
         }
       `}</style>
     </div>
   );
 }
 
 export default BulkNotification; 