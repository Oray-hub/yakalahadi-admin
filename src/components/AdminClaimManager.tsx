import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const AdminClaimManager = () => {
  const [targetUID, setTargetUID] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const functions = getFunctions();
  
  const setAdminClaimFunction = httpsCallable(functions, 'setAdminClaim');
  const removeAdminClaimFunction = httpsCallable(functions, 'removeAdminClaim');
  const listAdminUsersFunction = httpsCallable(functions, 'listAdminUsers');

  const setAdminClaim = async () => {
    if (!targetUID.trim()) {
      setMessage('Lütfen bir UID girin');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await setAdminClaimFunction({ uid: targetUID });
      setMessage(`✅ Admin yetkisi başarıyla verildi: ${targetUID}`);
      setMessageType('success');
      setTargetUID('');
    } catch (error: any) {
      setMessage(`❌ Hata: ${error.message || 'Bilinmeyen hata'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const removeAdminClaim = async () => {
    if (!targetUID.trim()) {
      setMessage('Lütfen bir UID girin');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await removeAdminClaimFunction({ uid: targetUID });
      setMessage(`✅ Admin yetkisi başarıyla kaldırıldı: ${targetUID}`);
      setMessageType('success');
      setTargetUID('');
    } catch (error: any) {
      setMessage(`❌ Hata: ${error.message || 'Bilinmeyen hata'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const listAdminUsers = async () => {
    setLoading(true);
    setMessage('');

    try {
      const result = await listAdminUsersFunction();
      const data = result.data as any;
      
      if (data.admins && data.admins.length > 0) {
        setMessage(`👑 Admin Kullanıcılar: ${data.admins.join(', ')}`);
        setMessageType('success');
      } else {
        setMessage('📝 Henüz admin kullanıcı yok');
        setMessageType('success');
      }
    } catch (error: any) {
      setMessage(`❌ Hata: ${error.message || 'Bilinmeyen hata'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24 
      }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>👑 Admin Yetki Yöneticisi</h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
          Firebase Functions ile admin yetkisi verin veya kaldırın
        </p>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>🔧 Admin Yetki İşlemleri</h3>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#495057' }}>
            Kullanıcı UID:
          </label>
          <input
            type="text"
            value={targetUID}
            onChange={(e) => setTargetUID(e.target.value)}
            placeholder="Kullanıcının UID'sini girin"
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #ced4da',
              borderRadius: 6,
              fontSize: 16,
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={setAdminClaim}
            disabled={loading}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 16,
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '⏳ İşleniyor...' : '✅ Admin Yetkisi Ver'}
          </button>

          <button
            onClick={removeAdminClaim}
            disabled={loading}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 16,
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '⏳ İşleniyor...' : '❌ Admin Yetkisi Kaldır'}
          </button>

          <button
            onClick={listAdminUsers}
            disabled={loading}
            style={{
              background: '#17a2b8',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 16,
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '⏳ İşleniyor...' : '📋 Admin Kullanıcıları Listele'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
          background: messageType === 'success' ? '#d4edda' : '#f8d7da',
          color: messageType === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      <div style={{ 
        background: '#fff3cd', 
        padding: 20, 
        borderRadius: 12, 
        border: '1px solid #ffeaa7',
        marginTop: 24
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#856404' }}>ℹ️ Nasıl Kullanılır?</h4>
        <ol style={{ margin: 0, paddingLeft: 20, color: '#856404' }}>
          <li>Kullanıcının UID'sini bulun (Firebase Console {' > '} Authentication {' > '} Users)</li>
          <li>UID'yi yukarıdaki alana yapıştırın</li>
          <li>"Admin Yetkisi Ver" butonuna tıklayın</li>
          <li>Kullanıcı artık admin yetkisine sahip olacak</li>
        </ol>
      </div>

      <div style={{ 
        background: '#e2e3e5', 
        padding: 20, 
        borderRadius: 12, 
        border: '1px solid #d6d8db',
        marginTop: 16
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#383d41' }}>⚠️ Önemli Notlar</h4>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#383d41' }}>
          <li>Bu işlem Firebase Functions kullanır</li>
          <li>Functions deploy edilmiş olmalı</li>
          <li>Admin yetkisi verilen kullanıcı tüm işlemleri yapabilir</li>
          <li>Güvenlik için sadece güvendiğiniz kullanıcılara admin yetkisi verin</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminClaimManager; 