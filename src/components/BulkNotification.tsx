import { useState, useEffect, useCallback } from "react";
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
  const [error, setError] = useState<string | null>(null);

  // Kullanıcı sayısını al - useCallback ile optimize edildi
  const fetchUserCount = useCallback(async () => {
    try {
      setError(null);
      const db = getFirestore();
      const usersSnapshot = await getDocs(collection(db, 'users'));
      setUserCount(usersSnapshot.size);
    } catch (error) {
      console.error("Kullanıcı sayısı alınırken hata:", error);
      setError("Kullanıcı sayısı alınamadı. Lütfen sayfayı yenileyin.");
    }
  }, []);

  // Component mount olduğunda kullanıcı sayısını al
  useEffect(() => {
    fetchUserCount();
  }, [fetchUserCount]);

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
    setError(null);

    try {
      const result = await NotificationService.sendBulkNotification(title, message);
      
      if (result.success) {
        alert(`✅ Toplu bildirim başarıyla gönderildi!\n\n📱 ${userCount} kullanıcıya bildirim gönderildi.`);
        setTitle("");
        setMessage("");
        onClose();
      } else {
        setError(result.message || "Bilinmeyen bir hata oluştu");
        alert(`❌ Toplu bildirim gönderilemedi:\n${result.message}`);
      }
    } catch (error: any) {
      console.error("Toplu bildirim gönderilirken hata:", error);
      const errorMessage = error.message || "Bilinmeyen bir hata oluştu";
      setError(errorMessage);
      alert(`❌ Toplu bildirim gönderilirken hata oluştu:\n${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Hata durumunda yeniden deneme fonksiyonu
  const handleRetry = () => {
    fetchUserCount();
  };

  return (
    <div style={{
      padding: '16px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflowY: 'auto',
      height: '100vh'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingBottom: '100px' // Buton için alt boşluk
      }}>
        {/* Ana Kart - Responsive */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '20px',
          border: '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              padding: '12px',
              borderRadius: '12px',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '24px' }}>📢</span>
            </div>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>Toplu Bildirim</h2>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                margin: '0'
              }}>Tüm kullanıcılara bildirim gönderin</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Kullanıcı Sayısı */}
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '12px',
                  borderRadius: '12px',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '20px' }}>👥</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    marginBottom: '4px'
                  }}>
                    Toplam {userCount} kullanıcıya bildirim gönderilecek
                  </div>
                  <div style={{
                    color: '#bfdbfe',
                    fontSize: '14px'
                  }}>
                    Bu bildirim tüm kayıtlı kullanıcılara ulaşacak
                  </div>
                </div>
                {error && (
                  <button
                    onClick={handleRetry}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    🔄 Yenile
                  </button>
                )}
              </div>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div style={{
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  <div>
                    <div style={{
                      color: '#dc2626',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      marginBottom: '4px'
                    }}>
                      Hata Oluştu
                    </div>
                    <div style={{
                      color: '#991b1b',
                      fontSize: '13px'
                    }}>
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Alanları */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '24px'
            }}>
              {/* Sol Kolon */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Başlık */}
                <div>
                  <label htmlFor="title" style={{
                    display: 'block',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Bildirim Başlığı *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8b5cf6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Örnek: Yeni Kampanya Başladı!"
                    maxLength={100}
                    required
                  />
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '8px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Kısa ve dikkat çekici olmalı</span>
                    <span style={{ color: title.length > 80 ? '#f59e0b' : '#6b7280', fontWeight: title.length > 80 ? 'bold' : 'normal' }}>
                      {title.length}/100 karakter
                    </span>
                  </div>
                </div>

                {/* Mesaj */}
                <div>
                  <label htmlFor="message" style={{
                    display: 'block',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Bildirim Mesajı *
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      resize: 'none',
                      transition: 'all 0.3s ease',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8b5cf6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Bildirim mesajınızı buraya yazın..."
                    maxLength={500}
                    required
                  />
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '8px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Net ve anlaşılır olmalı</span>
                    <span style={{ color: message.length > 400 ? '#f59e0b' : '#6b7280', fontWeight: message.length > 400 ? 'bold' : 'normal' }}>
                      {message.length}/500 karakter
                    </span>
                  </div>
                </div>
              </div>

              {/* Sağ Kolon */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Örnek Mesajlar */}
                <div style={{
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#374151',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{ marginRight: '8px', fontSize: '20px' }}>💡</span>
                    Örnek Mesajlar:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div 
                      style={{
                        cursor: 'pointer',
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#8b5cf6';
                        e.currentTarget.style.backgroundColor = '#faf5ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                      onClick={() => { setTitle("Yeni Kampanya Başladı!"); setMessage("Yeni kampanyalarımızı kaçırmayın! Hemen kontrol edin."); }}
                    >
                      <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '14px', marginBottom: '4px' }}>Yeni Kampanya</div>
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>"Yeni kampanyalarımızı kaçırmayın! Hemen kontrol edin."</div>
                    </div>
                    <div 
                      style={{
                        cursor: 'pointer',
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#8b5cf6';
                        e.currentTarget.style.backgroundColor = '#faf5ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                      onClick={() => { setTitle("Sistem Bakımı"); setMessage("Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz."); }}
                    >
                      <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '14px', marginBottom: '4px' }}>Sistem Bakımı</div>
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>"Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz."</div>
                    </div>
                    <div 
                      style={{
                        cursor: 'pointer',
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#8b5cf6';
                        e.currentTarget.style.backgroundColor = '#faf5ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                      onClick={() => { setTitle("Yeni Özellikler"); setMessage("Yeni özellikler eklendi! Uygulamayı güncelleyin."); }}
                    >
                      <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '14px', marginBottom: '4px' }}>Yeni Özellikler</div>
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>"Yeni özellikler eklendi! Uygulamayı güncelleyin."</div>
                    </div>
                  </div>
                </div>

                {/* İpuçları */}
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{ marginRight: '8px', fontSize: '20px' }}>📋</span>
                    İpuçları:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%', marginRight: '12px', flexShrink: 0 }}></span>
                      Başlık kısa ve dikkat çekici olmalı
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%', marginRight: '12px', flexShrink: 0 }}></span>
                      Mesaj net ve anlaşılır olmalı
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%', marginRight: '12px', flexShrink: 0 }}></span>
                      Emoji kullanarak dikkat çekebilirsiniz
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%', marginRight: '12px', flexShrink: 0 }}></span>
                      Gereksiz bildirimlerden kaçının
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Sabit Alt Butonlar */}
      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '16px',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '12px 24px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              color: '#374151',
              backgroundColor: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              minWidth: '100px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
            disabled={isLoading}
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isLoading || !title.trim() || !message.trim() || userCount === 0}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading || !title.trim() || !message.trim() || userCount === 0 ? 'not-allowed' : 'pointer',
              opacity: isLoading || !title.trim() || !message.trim() || userCount === 0 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)',
              minWidth: '180px',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && title.trim() && message.trim() && userCount > 0) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(139, 92, 246, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(139, 92, 246, 0.2)';
            }}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></div>
                Gönderiliyor...
              </>
            ) : (
              <>
                <span style={{ marginRight: '8px', fontSize: '18px' }}>
                  📢
                </span>
                Toplu Bildirim Gönder
              </>
            )}
          </button>
        </div>
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