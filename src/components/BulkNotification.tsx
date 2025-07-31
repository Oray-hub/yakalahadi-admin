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
    <div style={{
      minHeight: '100vh',
      padding: '16px',
      backgroundColor: '#f5f5f5',
      overflowY: 'auto',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start'
    }}>
      {/* Ana Container */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Ana Başlık */}
        <div style={{ 
          marginBottom: '24px',
          textAlign: 'center',
          flexShrink: 0
        }}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            color: '#333', 
            fontSize: 'clamp(20px, 4vw, 28px)',
            fontWeight: '600',
            lineHeight: '1.2'
          }}>
            📢 Toplu Bildirim Merkezi
          </h2>
          <p style={{ 
            color: '#666', 
            fontSize: 'clamp(12px, 2.5vw, 16px)', 
            margin: 0,
            lineHeight: '1.4'
          }}>
            Tüm kullanıcılara toplu bildirim gönderin.
          </p>
        </div>

        {/* Ana Kart */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          padding: 'clamp(16px, 3vw, 24px)',
          border: '1px solid #dee2e6',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
          }}>
            {/* Scrollable Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingRight: '8px'
            }}>
              {/* Kullanıcı Sayısı Kartı */}
              <div style={{
                backgroundColor: '#e3f2fd',
                borderRadius: '8px',
                padding: 'clamp(12px, 2.5vw, 16px)',
                marginBottom: 'clamp(16px, 3vw, 20px)',
                border: '1px solid #bbdefb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ 
                    fontSize: 'clamp(18px, 4vw, 24px)', 
                    marginRight: '12px',
                    flexShrink: 0
                  }}>👥</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      color: '#1565c0', 
                      fontWeight: '600', 
                      fontSize: 'clamp(14px, 3vw, 18px)',
                      lineHeight: '1.3'
                    }}>
                      Toplam {userCount} kullanıcıya bildirim gönderilecek
                    </div>
                    <div style={{ 
                      color: '#1976d2', 
                      fontSize: 'clamp(12px, 2.5vw, 16px)', 
                      marginTop: '4px',
                      lineHeight: '1.4'
                    }}>
                      Bu bildirim tüm kayıtlı kullanıcılara ulaşacak
                    </div>
                  </div>
                </div>
              </div>

              {/* Başlık Kartı */}
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: 'clamp(12px, 2.5vw, 16px)',
                marginBottom: 'clamp(12px, 2.5vw, 16px)',
                border: '1px solid #e0e0e0'
              }}>
                <label htmlFor="title" style={{
                  display: 'block',
                  fontSize: 'clamp(13px, 2.5vw, 16px)',
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
                    padding: 'clamp(10px, 2vw, 14px)',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: 'clamp(14px, 2.5vw, 16px)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
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
                  fontSize: 'clamp(11px, 2vw, 13px)',
                  color: '#666',
                  marginTop: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <span>Kısa ve dikkat çekici olmalı</span>
                  <span>{title.length}/100 karakter</span>
                </div>
              </div>

              {/* Mesaj Kartı */}
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: 'clamp(12px, 2.5vw, 16px)',
                marginBottom: 'clamp(12px, 2.5vw, 16px)',
                border: '1px solid #e0e0e0'
              }}>
                <label htmlFor="message" style={{
                  display: 'block',
                  fontSize: 'clamp(13px, 2.5vw, 16px)',
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
                    padding: 'clamp(10px, 2vw, 14px)',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: 'clamp(14px, 2.5vw, 16px)',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    minHeight: '120px'
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
                  fontSize: 'clamp(11px, 2vw, 13px)',
                  color: '#666',
                  marginTop: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <span>Net ve anlaşılır olmalı</span>
                  <span>{message.length}/500 karakter</span>
                </div>
              </div>

              {/* Örnek Mesajlar Kartı */}
              <div style={{
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                padding: 'clamp(12px, 2.5vw, 16px)',
                marginBottom: 'clamp(12px, 2.5vw, 16px)',
                border: '1px solid #e0e0e0'
              }}>
                <h4 style={{
                  fontSize: 'clamp(13px, 2.5vw, 16px)',
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
                      padding: 'clamp(8px, 2vw, 12px)',
                      borderRadius: '6px',
                      fontSize: 'clamp(12px, 2.5vw, 15px)',
                      color: '#666',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent',
                      lineHeight: '1.4'
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
                      padding: 'clamp(8px, 2vw, 12px)',
                      borderRadius: '6px',
                      fontSize: 'clamp(12px, 2.5vw, 15px)',
                      color: '#666',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent',
                      lineHeight: '1.4'
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
                      padding: 'clamp(8px, 2vw, 12px)',
                      borderRadius: '6px',
                      fontSize: 'clamp(12px, 2.5vw, 15px)',
                      color: '#666',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent',
                      lineHeight: '1.4'
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
                padding: 'clamp(12px, 2.5vw, 16px)',
                marginBottom: 'clamp(16px, 3vw, 20px)',
                border: '1px solid #bbdefb'
              }}>
                <h4 style={{
                  fontSize: 'clamp(13px, 2.5vw, 16px)',
                  fontWeight: '500',
                  color: '#1565c0',
                  margin: '0 0 8px 0'
                }}>
                  📋 İpuçları:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: 'clamp(12px, 2.5vw, 15px)', color: '#1976d2', lineHeight: '1.4' }}>• Başlık kısa ve dikkat çekici olmalı</div>
                  <div style={{ fontSize: 'clamp(12px, 2.5vw, 15px)', color: '#1976d2', lineHeight: '1.4' }}>• Mesaj net ve anlaşılır olmalı</div>
                  <div style={{ fontSize: 'clamp(12px, 2.5vw, 15px)', color: '#1976d2', lineHeight: '1.4' }}>• Emoji kullanarak dikkat çekebilirsiniz</div>
                  <div style={{ fontSize: 'clamp(12px, 2.5vw, 15px)', color: '#1976d2', lineHeight: '1.4' }}>• Gereksiz bildirimlerden kaçının</div>
                </div>
              </div>
            </div>

            {/* Butonlar - Fixed at bottom */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(8px, 2vw, 12px)',
              paddingTop: 'clamp(12px, 2.5vw, 16px)',
              borderTop: '1px solid #e0e0e0',
              marginTop: 'auto',
              flexShrink: 0,
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: 'clamp(10px, 2.5vw, 14px) clamp(16px, 3vw, 24px)',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  color: '#666',
                  fontSize: 'clamp(13px, 2.5vw, 16px)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '80px',
                  whiteSpace: 'nowrap'
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
                  padding: 'clamp(10px, 2.5vw, 14px) clamp(16px, 3vw, 24px)',
                  backgroundColor: isLoading || !title.trim() || !message.trim() ? '#ccc' : '#9c27b0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: 'clamp(13px, 2.5vw, 16px)',
                  cursor: isLoading || !title.trim() || !message.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(6px, 1.5vw, 8px)',
                  minWidth: '120px',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap'
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
                      width: 'clamp(14px, 3vw, 18px)',
                      height: 'clamp(14px, 3vw, 18px)',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <span>📢</span>
                    <span>Toplu Bildirim Gönder</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Smooth scrolling */
        * {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}

export default BulkNotification; 