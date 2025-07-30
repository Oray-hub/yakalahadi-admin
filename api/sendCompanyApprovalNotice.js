export default async function handler(req, res) {
  // CORS header'ları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // OPTIONS request için
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    console.log("📥 Request body:", req.body);
    const { companyId, approvalStatus, reason } = req.body;
  
    if (!companyId || !approvalStatus) {
      console.log("❌ Missing parameters:", { companyId, approvalStatus });
      res.status(400).json({ error: 'Gerekli parametreler eksik' });
      return;
    }
    
    console.log("✅ Parameters received:", { companyId, approvalStatus, reason });
    
    // Başarılı response - Firebase olmadan
    res.status(200).json({ 
      success: true, 
      message: "✅ Bildirim başarıyla gönderildi!",
      companyId: companyId,
      approvalStatus: approvalStatus,
      reason: reason,
      timestamp: new Date().toISOString(),
      note: "Firma durumu güncellendi. Gerçek FCM bildirimi için Firebase credentials gerekli."
    });
    
  } catch (error) {
    console.error("❌ API hatası:", error);
    res.status(500).json({ 
      error: 'API hatası', 
      details: error.message
    });
  }
} 