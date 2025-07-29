import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";

interface Campaign {
  id: string;
  type: string;
  companyId: string;
  companyName: string;
  notificationBody: string;
  createdAt: any;
  durationMinutes: number;
  endsAt: any;
  isActive: boolean;
}

function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<string>('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const db = getFirestore();
      
      // Önce tüm firmaları çek
      const companiesRef = collection(db, "companies");
      const companiesSnapshot = await getDocs(companiesRef);
      const companiesMap = new Map();
      
      companiesSnapshot.docs.forEach(companyDoc => {
        const companyData = companyDoc.data();
        companiesMap.set(companyDoc.id, companyData.company || companyData.companyTitle || "Firma Adı Yok");
      });
      
      const campaignsData: Campaign[] = [];
      
      // Kampanyaları çek
      const campaignsRef = collection(db, "campaigns");
      const campaignsSnapshot = await getDocs(campaignsRef);
      
      for (const doc of campaignsSnapshot.docs) {
        const data = doc.data();
        const companyName = companiesMap.get(data.companyId) || data.companyName || "Firma Adı Yok";
        
        campaignsData.push({
          id: doc.id,
          type: data.type || "Kampanya",
          companyId: data.companyId || "",
          companyName: companyName,
          notificationBody: data.notificationBody || "Bildirim Yok",
          createdAt: data.createdAt,
          durationMinutes: data.durationMinutes || 0,
          endsAt: data.endsAt,
          isActive: data.isActive || false,
        });
      }
      
      // İndirim kampanyalarını çek
      const discountsRef = collection(db, "discounts");
      const discountsSnapshot = await getDocs(discountsRef);
      
      for (const doc of discountsSnapshot.docs) {
        const data = doc.data();
        const companyName = companiesMap.get(data.companyId) || "Firma Adı Yok";
        
        campaignsData.push({
          id: doc.id,
          type: data.type || "discount",
          companyId: data.companyId || "",
          companyName: companyName,
          notificationBody: data.notificationBody || "Bildirim Yok",
          createdAt: data.createdAt,
          durationMinutes: data.durationMinutes || 0,
          endsAt: data.endsAt,
          isActive: data.isActive || false,
        });
      }
      
      setCampaigns(campaignsData);
    } catch (error) {
      console.error("Kampanyalar yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // İstatistik hesaplama fonksiyonları
  const calculateCampaignStats = () => {
    let yakalaTotal = 0;
    let yakalaActive = 0;
    let yakalaInactive = 0;
    let discountTotal = 0;
    let discountActive = 0;
    let discountInactive = 0;

    campaigns.forEach(campaign => {
      const now = new Date();
      const createdAt = campaign.createdAt ? new Date(campaign.createdAt.toDate()) : new Date();
      const endsAt = campaign.endsAt ? new Date(campaign.endsAt.toDate()) : new Date(createdAt.getTime() + campaign.durationMinutes * 60000);
      const isActive = campaign.isActive && now < endsAt;

      if (campaign.type.toLowerCase().includes("discount") || campaign.type.toLowerCase().includes("indirim")) {
        discountTotal++;
        if (isActive) {
          discountActive++;
        } else {
          discountInactive++;
        }
      } else {
        yakalaTotal++;
        if (isActive) {
          yakalaActive++;
        } else {
          yakalaInactive++;
        }
      }
    });

    return {
      yakalaTotal,
      yakalaActive,
      yakalaInactive,
      discountTotal,
      discountActive,
      discountInactive
    };
  };

  const stats = calculateCampaignStats();

  const filteredCampaigns = campaigns.filter(campaign => {
    // Normal arama filtresi
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      
      // Seçili alana göre arama yap
      switch (searchField) {
        case 'type':
          return campaign.type.toLowerCase().includes(searchLower);
        case 'companyName':
          return campaign.companyName.toLowerCase().includes(searchLower);
        case 'notificationBody':
          return campaign.notificationBody.toLowerCase().includes(searchLower);
        case 'status':
          // Kampanya durumunu hesapla
          const now = new Date();
          const createdAt = campaign.createdAt ? new Date(campaign.createdAt.toDate()) : new Date();
          const endsAt = campaign.endsAt ? new Date(campaign.endsAt.toDate()) : new Date(createdAt.getTime() + campaign.durationMinutes * 60000);
          const isActive = campaign.isActive && now < endsAt;
          const statusText = isActive ? "aktif" : "bitti";
          return statusText.includes(searchLower);
        case 'all':
        default:
          // Kampanya durumunu hesapla
          const nowAll = new Date();
          const createdAtAll = campaign.createdAt ? new Date(campaign.createdAt.toDate()) : new Date();
          const endsAtAll = campaign.endsAt ? new Date(campaign.endsAt.toDate()) : new Date(createdAtAll.getTime() + campaign.durationMinutes * 60000);
          const isActiveAll = campaign.isActive && nowAll < endsAtAll;
          const statusTextAll = isActiveAll ? "aktif" : "bitti";
          
          return (
            campaign.type.toLowerCase().includes(searchLower) ||
            campaign.companyName.toLowerCase().includes(searchLower) ||
            campaign.notificationBody.toLowerCase().includes(searchLower) ||
            statusTextAll.includes(searchLower)
          );
      }
    }

    return true;
  });

  const handleDeleteCampaign = async (campaignId: string, companyName: string, campaignType: string) => {
    if (window.confirm(`${companyName} için kampanyayı silmek istediğinizden emin misiniz?`)) {
      try {
        const db = getFirestore();
        
        // Kampanya tipine göre hangi koleksiyondan silineceğini belirle
        const collectionName = campaignType.toLowerCase().includes("indirim") ? "discounts" : "campaigns";
        
        await deleteDoc(doc(db, collectionName, campaignId));
        setCampaigns(campaigns.filter(campaign => campaign.id !== campaignId));
        alert("Kampanya başarıyla silindi.");
      } catch (error) {
        console.error("Kampanya silinirken hata:", error);
        alert("Kampanya silinirken bir hata oluştu.");
      }
    }
  };

  const handleToggleCampaignStatus = async (campaignId: string, companyName: string, campaignType: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const statusText = newStatus ? "aktif" : "bitmiş";
    
    if (window.confirm(`${companyName} için kampanyayı ${statusText} olarak işaretlemek istediğinizden emin misiniz?`)) {
      try {
        const db = getFirestore();
        
        // Kampanya tipine göre hangi koleksiyondan güncelleneceğini belirle
        const collectionName = campaignType.toLowerCase().includes("indirim") ? "discounts" : "campaigns";
        
        await updateDoc(doc(db, collectionName, campaignId), { isActive: newStatus });
        
        // Local state'i güncelle
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, isActive: newStatus }
            : campaign
        ));
        
        alert(`Kampanya başarıyla ${statusText} olarak güncellendi.`);
      } catch (error) {
        console.error("Kampanya durumu güncellenirken hata:", error);
        alert("Kampanya durumu güncellenirken bir hata oluştu.");
      }
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Kampanyalar yükleniyor...</div>;
  }

  return (
    <div className="campaigns-container" style={{
      height: "100vh",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      padding: "16px",
      minWidth: 0,
      maxWidth: "none"
    }}>
      {/* Sabit Başlık */}
      <div style={{
        flexShrink: 0,
        marginBottom: "16px"
      }}>
        <h1 style={{ 
          margin: 0, 
          color: "#333", 
          fontSize: "19px", 
          fontWeight: "bold" 
        }}>
          Kampanyalar
        </h1>
      </div>

      {/* Sabit İstatistik Kartları */}
      <div style={{
        flexShrink: 0,
        marginBottom: "16px",
        width: "100%"
      }}>
        <div className="campaigns-stats" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "12px", 
          marginBottom: "6px",
          width: "100%"
        }}>
          {/* Toplam Kampanyalar Kartı */}
          <div style={{
            backgroundColor: "#f3e5f5",
            borderRadius: "6px",
            padding: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #e1bee7"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", marginRight: "4px" }}>📊</span>
              <h3 style={{ margin: 0, color: "#7b1fa2", fontSize: "13px" }}>Toplam Kampanyalar</h3>
            </div>
            <div style={{ fontSize: "25px", fontWeight: "bold", color: "#7b1fa2", marginBottom: "2px" }}>
              {campaigns.length}
            </div>
            <div style={{ display: "flex", gap: "8px", fontSize: "12px" }}>
              <span style={{ color: "#7b1fa2" }}>
                🟢 {campaigns.filter(campaign => {
                  const now = new Date();
                  const endsAt = campaign.endsAt ? new Date(campaign.endsAt.toDate()) : new Date();
                  return campaign.isActive && now < endsAt;
                }).length} Aktif
              </span>
              <span style={{ color: "#f57c00" }}>
                🟡 {campaigns.filter(campaign => {
                  const now = new Date();
                  const endsAt = campaign.endsAt ? new Date(campaign.endsAt.toDate()) : new Date();
                  return !campaign.isActive || now >= endsAt;
                }).length} Pasif
              </span>
            </div>
          </div>
          
          {/* YakalaHadi Fırsatları Kartı */}
          <div style={{
            backgroundColor: "#e3f2fd",
            borderRadius: "6px",
            padding: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #bbdefb"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", marginRight: "4px" }}>🎯</span>
              <h3 style={{ margin: 0, color: "#1976d2", fontSize: "13px" }}>YakalaHadi Fırsatları</h3>
            </div>
            <div style={{ fontSize: "25px", fontWeight: "bold", color: "#1976d2", marginBottom: "2px" }}>
              {stats.yakalaTotal}
            </div>
            <div style={{ display: "flex", gap: "8px", fontSize: "12px" }}>
              <span style={{ color: "#1976d2" }}>
                🟢 {stats.yakalaActive} Aktif
              </span>
              <span style={{ color: "#f57c00" }}>
                🟡 {stats.yakalaInactive} Pasif
              </span>
            </div>
          </div>

          {/* İndirim Fırsatları Kartı */}
          <div style={{
            backgroundColor: "#fff3cd",
            borderRadius: "6px",
            padding: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #ffeaa7"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", marginRight: "4px" }}>🏷️</span>
              <h3 style={{ margin: 0, color: "#856404", fontSize: "13px" }}>İndirim Fırsatları</h3>
            </div>
            <div style={{ fontSize: "25px", fontWeight: "bold", color: "#856404", marginBottom: "2px" }}>
              {stats.discountTotal}
            </div>
            <div style={{ display: "flex", gap: "8px", fontSize: "12px" }}>
              <span style={{ color: "#856404" }}>
                🟢 {stats.discountActive} Aktif
              </span>
              <span style={{ color: "#f57c00" }}>
                🟡 {stats.discountInactive} Pasif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sabit Filtre Kısmı */}
      <div className="campaigns-filters" style={{
        flexShrink: 0,
        display: "flex",
        gap: "12px",
        marginBottom: "16px",
        alignItems: "center"
      }}>
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          style={{
            padding: "4px 6px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "11px",
            minWidth: "120px"
          }}
        >
          <option value="all">🔍 Tüm Alanlarda Ara</option>
          <option value="type">🎯 Kampanya Türü</option>
          <option value="companyName">🏢 Firma Adı</option>
          <option value="notificationBody">📢 Bildirim Metni</option>
          <option value="status">📊 Durum</option>
        </select>
        
        <input
          type="text"
          placeholder={`🔍 ${searchField === 'all' ? 'Tüm alanlarda ara...' : 
            searchField === 'type' ? 'Kampanya türü ara...' :
            searchField === 'companyName' ? 'Firma adı ara...' :
            searchField === 'notificationBody' ? 'Bildirim metni ara...' :
            searchField === 'status' ? 'Durum ara...' : 'Ara...'}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "4px 6px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "11px",
            minWidth: "120px"
          }}
        />
      </div>

      {/* Scroll Tablo Kısmı */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        overflowX: "auto",
        minHeight: 0,
        minWidth: 0,
        border: "1px solid #e0e0e0",
        borderRadius: "8px"
      }}>
        <table className="campaigns-table" style={{ 
          width: "100%", 
          borderCollapse: "collapse", 
          backgroundColor: "white"
        }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Kampanya Tipi</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Firma Adı</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Bildirim</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Durum</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "12px" }}>
            {filteredCampaigns.map((campaign) => {
              // Kampanya durumunu hesapla
              const now = new Date();
              const createdAt = campaign.createdAt ? new Date(campaign.createdAt.toDate()) : new Date();
              const endsAt = campaign.endsAt ? new Date(campaign.endsAt.toDate()) : new Date(createdAt.getTime() + campaign.durationMinutes * 60000);
              const isActive = campaign.isActive && now < endsAt;
              
              return (
                <tr key={campaign.id} style={{ borderBottom: "1px solid #f1f3f4" }}>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      padding: "4px 8px",
                      backgroundColor: campaign.type.toLowerCase().includes("discount") || campaign.type.toLowerCase().includes("indirim") ? "#fff3cd" : "#e3f2fd",
                      borderRadius: 12,
                      fontSize: "0.8em",
                      color: campaign.type.toLowerCase().includes("discount") || campaign.type.toLowerCase().includes("indirim") ? "#856404" : "#1976d2"
                    }}>
                      {campaign.type.toLowerCase() === "discount" ? "İndirim" : campaign.type}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                    <strong>{campaign.companyName}</strong>
                  </td>
                  <td style={{ padding: 12, maxWidth: "300px" }}>
                    <div style={{
                      padding: "8px 12px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      fontSize: "0.9em",
                      lineHeight: "1.4",
                      maxHeight: "80px",
                      overflow: "auto"
                    }}>
                      {campaign.notificationBody}
                    </div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <button
                      onClick={() => handleToggleCampaignStatus(campaign.id, campaign.companyName, campaign.type, campaign.isActive)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 12,
                        fontSize: "0.8em",
                        backgroundColor: isActive ? "#d4edda" : "#f8d7da",
                        color: isActive ? "#155724" : "#721c24",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.8";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      {isActive ? "✅ Aktif" : "❌ Bitti"}
                    </button>
                  </td>
                  <td style={{ padding: 12 }}>
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id, campaign.companyName, campaign.type)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: "0.8em"
                      }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {searchTerm && (
        <div style={{ 
          marginBottom: "12px", 
          padding: "8px 12px", 
          backgroundColor: "#e3f2fd", 
          borderRadius: "4px",
          fontSize: "14px",
          color: "#1976d2"
        }}>
          🔍 "{searchTerm}" {searchField === 'all' ? 'tüm alanlarda' : 
            searchField === 'type' ? 'kampanya tipinde' :
            searchField === 'companyName' ? 'firma adında' :
            searchField === 'notificationBody' ? 'bildirimde' :
            searchField === 'status' ? 'durumda' : 'aranan alanda'} için {filteredCampaigns.length} sonuç bulundu
          <button
            onClick={() => setSearchTerm('')}
            style={{
              marginLeft: "8px",
              padding: "2px 6px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Temizle
          </button>
        </div>
      )}

      {filteredCampaigns.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
          {searchTerm ? `"${searchTerm}" için sonuç bulunamadı.` : "Henüz kampanya bulunmuyor."}
        </div>
      )}
    </div>
  );
}

export default Campaigns; 