import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface BulkNotificationProps {
  onClose: () => void;
}

const BulkNotification: React.FC<BulkNotificationProps> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [notificationType, setNotificationType] = useState<'bulk' | 'user' | 'company'>('bulk');
  const [targetEmail, setTargetEmail] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        setUserCount(usersSnapshot.size);
      } catch (error) {
        console.error('Kullanıcı sayısı alınamadı:', error);
      }
    };

    fetchUserCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let endpoint = '';
      let payload: any = {
        title: title.trim(),
        message: message.trim()
      };

      switch (notificationType) {
        case 'bulk':
          endpoint = '/api/bulk-notification';
          break;
        case 'user':
          endpoint = '/api/user-notification';
          payload.email = targetEmail.trim();
          break;
        case 'company':
          endpoint = '/api/company-notification';
          payload.email = companyEmail.trim();
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Bildirim başarıyla gönderildi!');
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.error || 'Bildirim gönderilemedi'}`);
      }
    } catch (error) {
      console.error('Bildirim gönderme hatası:', error);
      alert('Bildirim gönderilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationTypeInfo = () => {
    switch (notificationType) {
      case 'bulk':
        return {
          title: 'Toplu Bildirim',
          description: 'Tüm kullanıcılara bildirim gönderin',
          icon: '📢',
          color: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
        };
      case 'user':
        return {
          title: 'Kullanıcı Bildirimi',
          description: 'Belirli bir kullanıcıya bildirim gönderin',
          icon: '👤',
          color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        };
      case 'company':
        return {
          title: 'Firma Bildirimi',
          description: 'Belirli bir firmaya bildirim gönderin',
          icon: '🏢',
          color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        };
    }
  };

  const typeInfo = getNotificationTypeInfo();

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
        paddingBottom: '100px'
      }}>
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
              background: typeInfo.color,
              padding: '12px',
              borderRadius: '12px',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '24px' }}>{typeInfo.icon}</span>
            </div>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>{typeInfo.title}</h2>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                margin: '0'
              }}>{typeInfo.description}</p>
            </div>
          </div>

          {/* Bildirim Türü Seçimi */}
          <div style={{
            marginBottom: '24px',
            padding: '20px',
            background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '16px'
            }}>Bildirim Türü Seçin:</h3>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={() => setNotificationType('bulk')}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: '2px solid',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: notificationType === 'bulk' ? '#8b5cf6' : 'white',
                  color: notificationType === 'bulk' ? 'white' : '#8b5cf6',
                  borderColor: notificationType === 'bulk' ? '#8b5cf6' : '#d1d5db'
                }}
              >
                <span>📢</span>
                Toplu
              </button>
              <button
                type="button"
                onClick={() => setNotificationType('user')}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: '2px solid',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: notificationType === 'user' ? '#10b981' : 'white',
                  color: notificationType === 'user' ? 'white' : '#10b981',
                  borderColor: notificationType === 'user' ? '#10b981' : '#d1d5db'
                }}
              >
                <span>👤</span>
                Kullanıcı
              </button>
              <button
                type="button"
                onClick={() => setNotificationType('company')}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: '2px solid',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: notificationType === 'company' ? '#f59e0b' : 'white',
                  color: notificationType === 'company' ? 'white' : '#f59e0b',
                  borderColor: notificationType === 'company' ? '#f59e0b' : '#d1d5db'
                }}
              >
                <span>🏢</span>
                Firma
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Kullanıcı Sayısı - Sadece toplu bildirim için */}
            {notificationType === 'bulk' && (
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
                  <div>
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
                </div>
              </div>
            )}

            {/* Hedef Email - Kullanıcı ve Firma için */}
            {(notificationType === 'user' || notificationType === 'company') && (
              <div style={{
                background: notificationType === 'user' 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '12px',
                    borderRadius: '12px',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '20px' }}>
                      {notificationType === 'user' ? '👤' : '🏢'}
                    </span>
                  </div>
                  <div>
                    <div style={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      marginBottom: '4px'
                    }}>
                      {notificationType === 'user' ? 'Kullanıcı Email Adresi' : 'Firma Email Adresi'}
                    </div>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '14px'
                    }}>
                      {notificationType === 'user' 
                        ? 'Bildirim bu email adresine kayıtlı kullanıcıya gönderilecek'
                        : 'Bildirim bu email adresine kayıtlı firmaya gönderilecek'
                      }
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Email Alanı - Kullanıcı ve Firma için */}
                {(notificationType === 'user' || notificationType === 'company') && (
                  <div>
                    <label htmlFor="email" style={{
                      display: 'block',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      {notificationType === 'user' ? 'Kullanıcı Email' : 'Firma Email'} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={notificationType === 'user' ? targetEmail : companyEmail}
                      onChange={(e) => {
                        if (notificationType === 'user') {
                          setTargetEmail(e.target.value);
                        } else {
                          setCompanyEmail(e.target.value);
                        }
                      }}
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
                      placeholder={notificationType === 'user' ? 'kullanici@email.com' : 'firma@email.com'}
                      required
                    />
                  </div>
                )}

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
                    placeholder="Örnek: Yeni Kampanya Başladı!"
                    maxLength={100}
                    required
                  />
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
                    placeholder="Bildirim mesajınızı buraya yazın..."
                    maxLength={500}
                    required
                  />
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
            disabled={isLoading}
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isLoading || !title.trim() || !message.trim() || 
              (notificationType === 'user' && !targetEmail.trim()) ||
              (notificationType === 'company' && !companyEmail.trim())}
            style={{
              padding: '12px 24px',
              background: typeInfo.color,
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading || !title.trim() || !message.trim() || 
                (notificationType === 'user' && !targetEmail.trim()) ||
                (notificationType === 'company' && !companyEmail.trim()) ? 'not-allowed' : 'pointer',
              opacity: isLoading || !title.trim() || !message.trim() || 
                (notificationType === 'user' && !targetEmail.trim()) ||
                (notificationType === 'company' && !companyEmail.trim()) ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              minWidth: '180px',
              justifyContent: 'center'
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
                  {typeInfo.icon}
                </span>
                {notificationType === 'bulk' ? 'Toplu Bildirim Gönder' : 
                 notificationType === 'user' ? 'Kullanıcıya Gönder' : 'Firmaya Gönder'}
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