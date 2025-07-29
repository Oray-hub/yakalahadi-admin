import { useState } from 'react';
import { UserService, CompanyService, CampaignService, ReviewService, AccountingService } from '../services/firestoreService';

function FirebaseTest() {
  const [testResults, setTestResults] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: {[key: string]: any} = {};

    try {
      // Users test
      try {
        const users = await UserService.getAllUsers();
        results.users = { success: true, count: users.length, data: users.slice(0, 3) };
      } catch (error: any) {
        results.users = { success: false, error: error.message || 'Bilinmeyen hata' };
      }

      // Companies test
      try {
        const companies = await CompanyService.getAllCompanies();
        results.companies = { success: true, count: companies.length, data: companies.slice(0, 3) };
      } catch (error: any) {
        results.companies = { success: false, error: error.message || 'Bilinmeyen hata' };
      }

      // Campaigns test
      try {
        const campaigns = await CampaignService.getAllCampaigns();
        results.campaigns = { success: true, count: campaigns.length, data: campaigns.slice(0, 3) };
      } catch (error: any) {
        results.campaigns = { success: false, error: error.message || 'Bilinmeyen hata' };
      }

      // Reviews test
      try {
        const reviews = await ReviewService.getAllReviews();
        results.reviews = { success: true, count: reviews.length, data: reviews.slice(0, 3) };
      } catch (error: any) {
        results.reviews = { success: false, error: error.message || 'Bilinmeyen hata' };
      }

      // Accounting test
      try {
        const accounting = await AccountingService.getAllAccountingData();
        results.accounting = { success: true, count: accounting.length, data: accounting.slice(0, 3) };
      } catch (error: any) {
        results.accounting = { success: false, error: error.message || 'Bilinmeyen hata' };
      }

    } catch (error: any) {
      results.general = { success: false, error: error.message || 'Bilinmeyen hata' };
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h2>🔥 Firebase Bağlantı Testi</h2>
      
      <button 
        onClick={runTests}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 16,
          marginBottom: 20
        }}
      >
        {loading ? 'Testler Çalışıyor...' : 'Firebase Testlerini Çalıştır'}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Test Sonuçları:</h3>
          
          {Object.entries(testResults).map(([collection, result]) => (
            <div 
              key={collection}
              style={{
                padding: 15,
                margin: '10px 0',
                borderRadius: 8,
                backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`
              }}
            >
              <h4 style={{ 
                color: result.success ? '#155724' : '#721c24',
                margin: '0 0 10px 0',
                textTransform: 'capitalize'
              }}>
                {collection} Koleksiyonu
              </h4>
              
              {result.success ? (
                <div>
                  <p style={{ color: '#155724', margin: '5px 0' }}>
                    ✅ Başarılı - {result.count} döküman bulundu
                  </p>
                  {result.data && result.data.length > 0 && (
                    <details style={{ marginTop: 10 }}>
                      <summary style={{ cursor: 'pointer', color: '#155724' }}>
                        İlk 3 dökümanı göster
                      </summary>
                      <pre style={{ 
                        backgroundColor: '#f8f9fa', 
                        padding: 10, 
                        borderRadius: 4,
                        fontSize: 12,
                        overflow: 'auto'
                      }}>
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ) : (
                <p style={{ color: '#721c24', margin: '5px 0' }}>
                  ❌ Hata: {result.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 30, padding: 15, backgroundColor: '#e7f3ff', borderRadius: 8 }}>
        <h4>🔧 Firebase Yapılandırması</h4>
        <p>Firebase bağlantısı başarılıysa, admin paneliniz artık Firestore veritabanına erişebilir ve verileri yönetebilir.</p>
        <p>Eğer hatalar görüyorsanız, Firebase Console'da güvenlik kurallarını kontrol edin.</p>
      </div>
    </div>
  );
}

export default FirebaseTest; 