import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: any;
  emailVerified: boolean;
  notificationsStatus: any;
  selectedCategories: string[];
  claimedCount?: number;
  privacyAccepted?: boolean;
  termsAccepted?: boolean;
  // Yakalanan kampanya ve QR verileri
  claimedCampaigns?: number;
  qrScanned?: boolean;
  disabled?: boolean; // Added for disable user
  deleted?: boolean; // Added for soft delete
  qrScannedCount?: number; // Added for QR scanned count
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("username"); // Default search field
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{x: number, y: number, w?: number} | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (openDropdown && !target.closest('[data-user-dropdown-container]')) {
        setOpenDropdown(null);
        setDropdownPosition(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdown]);

  const fetchUsers = async () => {
    try {
      const db = getFirestore();
      
      // Kullanıcıları çek
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      
      // Yakalanan kampanyaları çek (yeni sistem)
      const claimedCampaignsRef = collection(db, "claimedCampaigns");
      const claimedCampaignsSnapshot = await getDocs(claimedCampaignsRef);
      
      // Eski sistem yakalanan kampanyaları da çek
      const caughtCampaignsRef = collection(db, "caught_campaigns");
      const caughtCampaignsSnapshot = await getDocs(caughtCampaignsRef);
      
      // Kullanıcı başına yakalanan kampanya sayısını hesapla
      const userClaimedCounts = new Map<string, number>();
      // Kullanıcı başına QR okutulan kampanya sayısını hesapla
      const userQrScannedCount = new Map<string, number>();
      
      // Yeni sistem claimedCampaigns
      console.log("=== CLAIMED CAMPAIGNS DATA ===");
      claimedCampaignsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;
        console.log(`Document ID: ${doc.id}`);
        console.log(`User ID: ${userId}`);
        console.log(`Full data:`, JSON.stringify(data, null, 2));
        
        if (userId) {
          // Yakalanan kampanya sayısını artır
          userClaimedCounts.set(userId, (userClaimedCounts.get(userId) || 0) + 1);
          
          // QR kod okutulmuş mu kontrol et - daha kapsamlı kontrol
          const hasScanned = data.qrScanned === true || 
              data.scanned === true || 
              data.isScanned === true ||
              data.qrCodeScanned === true ||
              data.qrScannedAt ||
              data.scannedAt ||
              data.qrCodeScannedAt ||
              data.status === 'scanned' ||
              data.status === 'completed' ||
              data.isCompleted === true ||
              data.qrCodeStatus === 'scanned' ||
              data.campaignStatus === 'completed' ||
              data.isUsed === true ||
              data.usedAt ||
              data.feedbackGiven === true;
              
          console.log(`Has scanned: ${hasScanned}`);
          
          if (hasScanned) {
            userQrScannedCount.set(userId, (userQrScannedCount.get(userId) || 0) + 1);
            console.log(`✅ User ${userId} has scanned QR code`);
          }
        }
        console.log("---");
      });
      
      // Eski sistem caught_campaigns
      console.log("=== CAUGHT CAMPAIGNS DATA ===");
      caughtCampaignsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;
        console.log(`Document ID: ${doc.id}`);
        console.log(`User ID: ${userId}`);
        console.log(`Full data:`, JSON.stringify(data, null, 2));
        
        if (userId) {
          // Yakalanan kampanya sayısını artır
          userClaimedCounts.set(userId, (userClaimedCounts.get(userId) || 0) + 1);
          
          // QR kod okutulmuş mu kontrol et
          const hasScanned = data.qrScanned === true || 
              data.scanned === true || 
              data.isScanned === true ||
              data.qrCodeScanned === true ||
              data.qrScannedAt ||
              data.scannedAt ||
              data.qrCodeScannedAt ||
              data.status === 'scanned' ||
              data.status === 'completed' ||
              data.isCompleted === true ||
              data.qrCodeStatus === 'scanned' ||
              data.campaignStatus === 'completed' ||
              data.isUsed === true ||
              data.usedAt ||
              data.feedbackGiven === true;
              
          console.log(`Has scanned: ${hasScanned}`);
          
          if (hasScanned) {
            userQrScannedCount.set(userId, (userQrScannedCount.get(userId) || 0) + 1);
            console.log(`✅ User ${userId} has scanned QR code (caught_campaigns)`);
          }
        }
        console.log("---");
      });
      
      const usersData: User[] = [];
      for (const doc of usersSnapshot.docs) {
        const data = doc.data();
        const userId = doc.id;
        
        usersData.push({
          id: userId,
          email: data.email || "E-posta yok",
          name: data.name || "İsim yok",
          createdAt: data.createdAt,
          emailVerified: data.emailVerified || false,
          notificationsStatus: data.notificationsStatus || {},
          selectedCategories: data.selectedCategories || [],
          claimedCount: data.claimedCount || 0,
          privacyAccepted: data.privacyAccepted || false,
          termsAccepted: data.termsAccepted || false,
          // Yakalanan kampanya ve QR verileri
          claimedCampaigns: userClaimedCounts.get(userId) || 0,
          qrScannedCount: userQrScannedCount.get(userId) || 0,
          disabled: data.disabled || false, // Add disabled status
          deleted: data.deleted || false, // Add deleted status
        });
      }
      
      console.log("=== FINAL RESULTS ===");
      console.log("User Claimed Counts:", Object.fromEntries(userClaimedCounts));
      console.log("User QR Scanned:", Object.fromEntries(userQrScannedCount));
      
      setUsers(usersData);
    } catch (error) {
      console.error("Kullanıcılar yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // İstatistik hesaplama fonksiyonu
  const calculateUserStats = () => {
    let totalUsers = users.length;
    let verifiedUsers = 0;
    let unverifiedUsers = 0;

    users.forEach(user => {
      if (user.emailVerified) {
        verifiedUsers++;
      } else {
        unverifiedUsers++;
      }
    });

    return {
      totalUsers,
      verifiedUsers,
      unverifiedUsers
    };
  };

  const stats = calculateUserStats();

  const filteredUsers = users.filter(user => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Seçili alana göre arama yap
    switch (searchField) {
      case 'name':
        return user.name.toLowerCase().includes(searchLower);
      case 'email':
        return user.email.toLowerCase().includes(searchLower);
      case 'emailVerified':
        const verifiedText = user.emailVerified ? "doğrulandı" : "doğrulanmadı";
        return verifiedText.includes(searchLower);
      case 'privacyAccepted':
        const privacyText = user.privacyAccepted ? "kabul edildi" : "kabul edilmedi";
        return privacyText.includes(searchLower);
      case 'termsAccepted':
        const termsText = user.termsAccepted ? "kabul edildi" : "kabul edilmedi";
        return termsText.includes(searchLower);
      case 'claimedCount':
        return (user.claimedCampaigns || 0).toString().includes(searchLower);
      case 'notificationsStatus':
        const qrText = user.qrScanned ? "evet" : "hayır";
        return qrText.includes(searchLower);
      case 'selectedCategories':
        return user.selectedCategories.some(category => 
          category.toLowerCase().includes(searchLower)
        );
      case 'all':
      default:
        const verifiedTextAll = user.emailVerified ? "doğrulandı" : "doğrulanmadı";
        const privacyTextAll = user.privacyAccepted ? "kabul edildi" : "kabul edilmedi";
        const termsTextAll = user.termsAccepted ? "kabul edildi" : "kabul edilmedi";
        const qrTextAll = user.qrScanned ? "evet" : "hayır";
        
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          verifiedTextAll.includes(searchLower) ||
          privacyTextAll.includes(searchLower) ||
          termsTextAll.includes(searchLower) ||
          (user.claimedCampaigns || 0).toString().includes(searchLower) ||
          qrTextAll.includes(searchLower) ||
          user.selectedCategories.some(category => 
            category.toLowerCase().includes(searchLower)
          )
        );
    }
  });

  const toggleDropdown = (userId: string, event: React.MouseEvent) => {
    if (openDropdown === userId) {
      setOpenDropdown(null);
      setDropdownPosition(null);
    } else {
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      let left = rect.left;
      let top = rect.bottom + 4;
      let dropdownWidth = 200;
      let dropdownHeight = 220;
      // Responsive genişlik
      if (window.innerWidth <= 600) {
        dropdownWidth = window.innerWidth * 0.9;
        left = (window.innerWidth - dropdownWidth) / 2;
        top = rect.bottom + 8;
      } else if (window.innerWidth <= 900) {
        dropdownWidth = window.innerWidth * 0.6;
        if (left + dropdownWidth > window.innerWidth) {
          left = window.innerWidth - dropdownWidth - 8;
        }
      } else {
        if (left + dropdownWidth > window.innerWidth) {
          left = window.innerWidth - dropdownWidth - 16;
        }
      }
      if (top + dropdownHeight > window.innerHeight) {
        top = rect.top - dropdownHeight - 4;
        if (top < 0) top = 8;
      }
      setDropdownPosition({ x: left, y: top, w: dropdownWidth });
      setOpenDropdown(userId);
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert('Şifre sıfırlama e-postası gönderildi.');
    } catch (error) {
      alert('Şifre sıfırlama sırasında hata oluştu.');
    }
  };

  const handleDisableUser = async (user: User) => {
    if (!window.confirm(`${user.name} adlı kullanıcının hesabını kapatmak istediğinize emin misiniz?`)) return;
    try {
      await httpsCallable(functions, 'setUserDisabledV2')({ uid: user.id, disabled: true });
      fetchUsers();
      alert('Hesap kapatıldı.');
    } catch (error) {
      alert('Hesap kapatılamadı.');
    }
  };
  const handleEnableUser = async (user: User) => {
    if (!window.confirm(`${user.name} adlı kullanıcının hesabını açmak istediğinize emin misiniz?`)) return;
    try {
      await httpsCallable(functions, 'setUserDisabledV2')({ uid: user.id, disabled: false });
      fetchUsers();
      alert('Hesap açıldı.');
    } catch (error) {
      alert('Hesap açılamadı.');
    }
  };
  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`${user.name} adlı kullanıcıyı silmek istediğinize emin misiniz?`)) return;
    try {
      await httpsCallable(functions, 'deleteUserCompletely')({ uid: user.id });
      fetchUsers();
      alert('Kullanıcı tamamen silindi.');
    } catch (error) {
      alert('Kullanıcı silinemedi.');
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Kullanıcılar yükleniyor...</div>;
  }

  return (
    <div className="users-container" style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      flexDirection: "column",
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
          Kullanıcılar
        </h1>
      </div>

      {/* Sabit İstatistik Kartı */}
      <div style={{
        flexShrink: 0,
        marginBottom: "16px",
        width: "100%"
      }}>
        <div style={{
          backgroundColor: "#e8f5e8",
          borderRadius: "6px",
          padding: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #c8e6c9"
        }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ fontSize: "13px", marginRight: "4px" }}>👥</span>
            <h3 style={{ margin: 0, color: "#2e7d32", fontSize: "13px" }}>Kullanıcı İstatistikleri</h3>
          </div>
          <div style={{ fontSize: "25px", fontWeight: "bold", color: "#2e7d32", marginBottom: "2px" }}>
            {stats.totalUsers}
          </div>
          <div style={{ display: "flex", gap: "8px", fontSize: "12px" }}>
            <span style={{ color: "#2e7d32" }}>
              ✅ {stats.verifiedUsers} Doğrulandı
            </span>
            <span style={{ color: "#d32f2f" }}>
              ❌ {stats.unverifiedUsers} Doğrulanmadı
            </span>
          </div>
        </div>
      </div>

      {/* Sabit Filtre Kısmı */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginBottom: "16px"
      }}>
        {/* Üst Kısım - Filtreler */}
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          alignItems: "center",
          flexWrap: "wrap"
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
            <option value="name">👤 Kullanıcı Adı</option>
            <option value="email">📧 E-posta</option>
            <option value="emailVerified">✅ E-posta Durumu</option>
            <option value="privacyAccepted">🔒 Gizlilik Kabul</option>
            <option value="termsAccepted">📋 Şartlar Kabul</option>
            <option value="claimedCount">🎯 Yakalanan Kampanya</option>
            <option value="notificationsStatus">🔔 QR Kod Durumu</option>
            <option value="selectedCategories">📂 Kategoriler</option>
          </select>
          
          <input
            type="text"
            placeholder={`🔍 ${searchField === 'all' ? 'Tüm alanlarda ara...' : 
              searchField === 'name' ? 'Kullanıcı adı ara...' :
              searchField === 'email' ? 'E-posta ara...' :
              searchField === 'emailVerified' ? 'E-posta durumu ara...' :
              searchField === 'privacyAccepted' ? 'Gizlilik kabul ara...' :
              searchField === 'termsAccepted' ? 'Şartlar kabul ara...' :
              searchField === 'claimedCount' ? 'Yakalanan kampanya ara...' :
              searchField === 'notificationsStatus' ? 'QR kod durumu ara...' :
              searchField === 'selectedCategories' ? 'Kategoriler ara...' : 'Ara...'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "4px 6px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "11px",
              minWidth: "120px",
              flex: 1
            }}
          />
        </div>
        
        {/* Alt Kısım - Numaratör */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end"
        }}>
          <div style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
            padding: "4px 8px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
            border: "1px solid #dee2e6"
          }}>
            {filteredUsers.length}
          </div>
        </div>
      </div>

      {/* Scroll Tablo Kısmı */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        overflowX: "auto",
        minHeight: "400px",
        minWidth: 0,
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        backgroundColor: "#f8f9fa",
        overscrollBehavior: "none"
      }}>
        <table style={{ 
          width: "100%", 
          borderCollapse: "collapse", 
          backgroundColor: "white"
        }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Durum</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Kullanıcı</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>E-posta</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Kayıt Tarihi</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Sözleşme</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Yakalanan</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>QR Kod</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Kategoriler</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "12px" }}>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #f1f3f4" }}>
                {/* Durum sütunu */}
                <td style={{ padding: 12 }}>
                  {user.deleted ? (
                    <span style={{
                      padding: "4px 10px",
                      backgroundColor: "#f8d7da",
                      color: "#721c24",
                      borderRadius: 8,
                      fontWeight: 600
                    }}>Silinmiş</span>
                  ) : user.disabled ? (
                    <span style={{
                      padding: "4px 10px",
                      backgroundColor: "#fff3cd",
                      color: "#856404",
                      borderRadius: 8,
                      fontWeight: 600
                    }}>Hesap Kapalı</span>
                  ) : (
                    <span style={{
                      padding: "4px 10px",
                      backgroundColor: "#d4edda",
                      color: "#155724",
                      borderRadius: 8,
                      fontWeight: 600
                    }}>Hesap Açık</span>
                  )}
                </td>
                {/* Kullanıcı ismi */}
                <td style={{ padding: 12 }}>
                  <div>
                    <strong>{user.name}</strong>
                  </div>
                </td>
                {/* E-posta */}
                <td style={{ padding: 12 }}>{user.email}</td>
                {/* Kayıt Tarihi */}
                <td style={{ padding: 12 }}>
                  {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString('tr-TR') : "Bilinmiyor"}
                </td>
                {/* Sözleşme sütunu */}
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: 12,
                    fontSize: "0.8em",
                    backgroundColor: user.privacyAccepted && user.termsAccepted ? "#d4edda" : "#f8d7da",
                    color: user.privacyAccepted && user.termsAccepted ? "#155724" : "#721c24",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    minWidth: "80px"
                  }}>
                    {user.privacyAccepted && user.termsAccepted ? "Kabul Edildi" : "Kabul Edilmedi"}
                  </span>
                </td>
                {/* Yakalanan */}
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: 12,
                    fontSize: "0.8em",
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2"
                  }}>
                    {user.claimedCampaigns || 0}
                  </span>
                </td>
                {/* QR Kod */}
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: 12,
                    fontSize: "0.8em",
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2"
                  }}>
                    {user.qrScannedCount || 0}
                  </span>
                </td>
                {/* Kategoriler */}
                <td style={{ padding: 12 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {user.selectedCategories.slice(0, 3).map((category, index) => (
                      <span key={index} style={{
                        padding: "2px 6px",
                        backgroundColor: "#e9ecef",
                        borderRadius: 12,
                        fontSize: "0.7em"
                      }}>
                        {category}
                      </span>
                    ))}
                    {user.selectedCategories.length > 3 && (
                      <span style={{ fontSize: "0.8em", color: "#666" }}>
                        +{user.selectedCategories.length - 3} daha
                      </span>
                    )}
                  </div>
                </td>
                {/* İşlemler sütunu */}
                <td style={{ padding: 12, position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => toggleDropdown(user.id, e)}
                      style={{
                        padding: '6px 16px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: '1.2em',
                        fontWeight: 600
                      }}
                    >
                      ⋮
                    </button>
                    {openDropdown === user.id && dropdownPosition && (
                      <div
                        data-user-dropdown-container
                        style={{
                          position: 'fixed',
                          top: dropdownPosition.y,
                          left: dropdownPosition.x,
                          width: dropdownPosition.w || 200,
                          backgroundColor: 'white',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          zIndex: 999999,
                          padding: '6px 0',
                          maxWidth: '98vw',
                          minWidth: 160,
                          // Mobilde tam genişlikte gibi görünmesi için
                          ...(window.innerWidth <= 600 ? { left: '5vw', width: '90vw', minWidth: 0 } : {})
                        }}
                      >
                        <div
                          style={{
                            padding: window.innerWidth <= 600 ? '18px 24px' : '10px 18px',
                            cursor: 'pointer',
                            color: '#1976d2',
                            fontWeight: 600,
                            fontSize: window.innerWidth <= 600 ? '1.1em' : '1em',
                            opacity: 1
                          }}
                          onClick={() => { setOpenDropdown(null); handleResetPassword(user); }}
                        >
                          🔑 Şifre Sıfırla
                        </div>
                        <div
                          style={{
                            padding: window.innerWidth <= 600 ? '18px 24px' : '10px 18px',
                            cursor: user.disabled || user.deleted ? 'not-allowed' : 'pointer',
                            color: user.disabled || user.deleted ? '#888' : '#856404',
                            backgroundColor: user.disabled || user.deleted ? '#f5f5f5' : 'transparent',
                            fontWeight: 600,
                            fontSize: window.innerWidth <= 600 ? '1.1em' : '1em',
                            opacity: user.disabled || user.deleted ? 0.6 : 1
                          }}
                          onClick={() => {
                            if (!(user.disabled || user.deleted)) { setOpenDropdown(null); handleDisableUser(user); }
                          }}
                        >
                          🚫 Hesabı Kapat
                        </div>
                        <div
                          style={{
                            padding: window.innerWidth <= 600 ? '18px 24px' : '10px 18px',
                            cursor: !user.disabled || user.deleted ? 'not-allowed' : 'pointer',
                            color: !user.disabled || user.deleted ? '#888' : '#28a745',
                            backgroundColor: !user.disabled || user.deleted ? '#f5f5f5' : 'transparent',
                            fontWeight: 600,
                            fontSize: window.innerWidth <= 600 ? '1.1em' : '1em',
                            opacity: !user.disabled || user.deleted ? 0.6 : 1
                          }}
                          onClick={() => {
                            if (user.disabled && !user.deleted) { setOpenDropdown(null); handleEnableUser(user); }
                          }}
                        >
                          🔓 Hesabı Aç
                        </div>
                        <div
                          style={{
                            padding: window.innerWidth <= 600 ? '18px 24px' : '10px 18px',
                            cursor: user.deleted ? 'not-allowed' : 'pointer',
                            color: user.deleted ? '#888' : '#dc3545',
                            backgroundColor: user.deleted ? '#f5f5f5' : 'transparent',
                            fontWeight: 600,
                            fontSize: window.innerWidth <= 600 ? '1.1em' : '1em',
                            opacity: user.deleted ? 0.6 : 1
                          }}
                          onClick={() => {
                            if (!user.deleted) { setOpenDropdown(null); handleDeleteUser(user); }
                          }}
                        >
                          🗑️ Hesabı Sil
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
          {searchTerm ? "Arama kriterlerine uygun kullanıcı bulunamadı." : "Henüz kullanıcı bulunmuyor."}
        </div>
      )}

      {/* Search kısmına da aynı menüyü ekle (örnek olarak sağ üst köşeye) */}
      <div style={{ position: "absolute", right: 0, top: 0 }}>
        <button
          onClick={(e) => toggleDropdown("search-menu", e)}
          style={{
            padding: "6px 12px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: "0.8em"
          }}
        >
          ⋮
        </button>
        {openDropdown === "search-menu" && dropdownPosition && (
          <div
            data-user-dropdown-container
            style={{
              position: "fixed",
              top: dropdownPosition.y,
              left: dropdownPosition.x,
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 999999,
              minWidth: "180px",
              padding: "6px 0"
            }}
          >
            <div style={{ padding: "8px 12px", borderBottom: "1px solid #eee", cursor: "pointer", fontSize: "0.9em" }}>🔑 Şifre Sıfırla</div>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid #eee", cursor: "pointer", fontSize: "0.9em" }}>🚫 Askıya Al</div>
            <div style={{ padding: "8px 12px", color: "#dc3545", cursor: "pointer", fontSize: "0.9em" }}>🗑️ Hesabı Sil</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users; 