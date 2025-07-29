import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

function AdminClaimManager() {
  const [targetUID, setTargetUID] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const functions = getFunctions();

  const setAdminClaim = async () => {
    if (!targetUID.trim()) {
      setMessage('UID gerekli!');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const setAdminClaimFunction = httpsCallable(functions, 'setAdminClaim');
      await setAdminClaimFunction({ uid: targetUID });
      
      setMessage('✅ Admin yetkisi başarıyla verildi!');
      setMessageType('success');
      setTargetUID('');
    } catch (error: any) {
      setMessage(`❌ Hata: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const removeAdminClaim = async () => {
    if (!targetUID.trim()) {
      setMessage('UID gerekli!');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const removeAdminClaimFunction = httpsCallable(functions, 'removeAdminClaim');
      await removeAdminClaimFunction({ uid: targetUID });
      
      setMessage('✅ Admin yetkisi kaldırıldı!');
      setMessageType('success');
      setTargetUID('');
    } catch (error: any) {
      setMessage(`❌ Hata: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h2>🔐 Admin Yetki Yöneticisi</h2>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: 20, 
        borderRadius: 8, 
        marginBottom: 20 
      }}>
        <h3>Admin Claim Verme</h3>
        <p>Bir kullanıcıya admin yetkisi vermek için UID'sini girin:</p>
        
        <div style={{ marginBottom: 15 }}>
          <input
            type="text"
            value={targetUID}
            onChange={(e) => setTargetUID(e.target.value)}
            placeholder="Kullanıcı UID'sini girin..."
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={setAdminClaim}
            disabled={loading || !targetUID.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? 'İşleniyor...' : 'Admin Yetkisi Ver'}
          </button>
          
          <button
            onClick={removeAdminClaim}
            disabled={loading || !targetUID.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? 'İşleniyor...' : 'Admin Yetkisini Kaldır'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          padding: 15,
          borderRadius: 8,
          backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
          border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          color: messageType === 'success' ? '#155724' : '#721c24',
          marginBottom: 20
        }}>
          {message}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#e7f3ff', 
        padding: 15, 
        borderRadius: 8 
      }}>
        <h4>📋 Nasıl Kullanılır?</h4>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Firebase Console {'>'} Authentication {'>'} Users bölümüne gidin</li>
          <li>Admin olacak kullanıcının UID'sini kopyalayın</li>
          <li>Yukarıdaki alana UID'yi yapıştırın</li>
          <li>"Admin Yetkisi Ver" butonuna tıklayın</li>
          <li>Kullanıcı artık admin panelinde tam yetkiye sahip olacak</li>
        </ol>
      </div>
    </div>
  );
}

export default AdminClaimManager; 