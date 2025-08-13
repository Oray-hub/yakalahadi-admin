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
      padding: '32px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Ana Kart - Deploy için güncellendi */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '40px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              padding: '16px',
              borderRadius: '16px',
              marginRight: '24px'
            }}>
              <span style={{ fontSize: '32px' }}>📢</span>
            </div>
            <div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>Toplu Bildirim</h2>
              <p style={{
                color: '#6b7280',
                fontSize: '18px',
                margin: '0'
              }}>Tüm kullanıcılara bildirim gönderin</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Kullanıcı Sayısı */}
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '16px',
                  borderRadius: '16px',
                  marginRight: '24px'
                }}>
                  <span style={{ fontSize: '24px' }}>👥</span>
                </div>
                <div>
                  <div style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '24px',
                    marginBottom: '8px'
                  }}>
                    Toplam {userCount} kullanıcıya bildirim gönderilecek
                  </div>
                  <div style={{
                    color: '#bfdbfe',
                    fontSize: '18px'
                  }}>
                    Bu bildirim tüm kayıtlı kullanıcılara ulaşacak
                  </div>
                </div>
              </div>
            </div>

            {/* Form Alanları */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px'
            }}>
              {/* Sol Kolon */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Başlık */}
                <div>
                  <label htmlFor="title" style={{
                    display: 'block',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#374151',
                    marginBottom: '16px'
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
                      padding: '16px 24px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '18px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8b5cf6';
                      e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)';
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
                    fontSize: '14px',
                    color: '#6b7280',
                    marginTop: '12px',
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
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#374151',
                    marginBottom: '16px'
                  }}>
                    Bildirim Mesajı *
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={10}
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '18px',
                      outline: 'none',
                      resize: 'none',
                      transition: 'all 0.3s ease',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8b5cf6';
                      e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)';
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
                    fontSize: '14px',
                    color: '#6b7280',
                    marginTop: '12px',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Örnek Mesajlar */}
                <div style={{
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '32px'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#374151',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{ marginRight: '12px', fontSize: '24px' }}>💡</span>
                    Örnek Mesajlar:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div 
                      style={{
                        cursor: 'pointer',
                        padding: '16px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
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
                      <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '18px', marginBottom: '8px' }}>Yeni Kampanya</div>
                      <div style={{ color: '#6b7280' }}>"Yeni kampanyalarımızı kaçırmayın! Hemen kontrol edin."</div>
                    </div>
                    <div 
                      style={{
                        cursor: 'pointer',
                        padding: '16px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
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
                      <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '18px', marginBottom: '8px' }}>Sistem Bakımı</div>
                      <div style={{ color: '#6b7280' }}>"Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz."</div>
                    </div>
                    <div 
                      style={{
                        cursor: 'pointer',
                        padding: '16px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
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
                      <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '18px', marginBottom: '8px' }}>Yeni Özellikler</div>
                      <div style={{ color: '#6b7280' }}>"Yeni özellikler eklendi! Uygulamayı güncelleyin."</div>
                    </div>
                  </div>
                </div>

                {/* İpuçları */}
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{ marginRight: '12px', fontSize: '24px' }}>📋</span>
                    İpuçları:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '12px', height: '12px', backgroundColor: 'white', borderRadius: '50%', marginRight: '16px' }}></span>
                      Başlık kısa ve dikkat çekici olmalı
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '12px', height: '12px', backgroundColor: 'white', borderRadius: '50%', marginRight: '16px' }}></span>
                      Mesaj net ve anlaşılır olmalı
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '12px', height: '12px', backgroundColor: 'white', borderRadius: '50%', marginRight: '16px' }}></span>
                      Emoji kullanarak dikkat çekebilirsiniz
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '12px', height: '12px', backgroundColor: 'white', borderRadius: '50%', marginRight: '16px' }}></span>
                      Gereksiz bildirimlerden kaçının
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Butonlar */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '24px',
              paddingTop: '32px',
              borderTop: '2px solid #e5e7eb'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '16px 40px',
                  border: '2px solid #d1d5db',
                  borderRadius: '12px',
                  color: '#374151',
                  backgroundColor: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
                }}
                disabled={isLoading}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading || !title.trim() || !message.trim()}
                style={{
                  padding: '16px 40px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: isLoading || !title.trim() || !message.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !title.trim() || !message.trim() ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && title.trim() && message.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(139, 92, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(139, 92, 246, 0.3)';
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '16px'
                    }}></div>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: '12px', fontSize: '24px' }}>📢</span>
                    Toplu Bildirim Gönder
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
      `}</style>
    </div>
  );
}

export default BulkNotification; 