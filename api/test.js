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
  
  try {
    console.log("🔧 Test API çalışıyor!");
    console.log("📥 Request body:", req.body);
    console.log("🔑 Environment variables:", {
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    
    res.status(200).json({ 
      success: true, 
      message: "Test API çalışıyor!",
      timestamp: new Date().toISOString(),
      hasFirebaseCredentials: !!(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)
    });
    
  } catch (error) {
    console.error("❌ Test API hatası:", error);
    res.status(500).json({ 
      error: 'Test API hatası', 
      details: error.message 
    });
  }
} 