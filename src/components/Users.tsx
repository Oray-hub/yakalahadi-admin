import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";

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
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("username"); // Default search field
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const db = getFirestore();
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      
      const usersData: User[] = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          email: data.email || "E-posta yok",
          name: data.name || "İsim yok",
          createdAt: data.createdAt,
          emailVerified: data.emailVerified || false,
          notificationsStatus: data.notificationsStatus || {},
          selectedCategories: data.selectedCategories || [],
          claimedCount: data.claimedCount || 0,
          privacyAccepted: data.privacyAccepted || false,
          termsAccepted: data.termsAccepted || false,
        });
      }
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
        return (user.claimedCount || 0).toString().includes(searchLower);
      case 'notificationsStatus':
        const notificationText = user.notificationsStatus?.enabled ? "evet" : "hayır";
        return notificationText.includes(searchLower);
      case 'selectedCategories':
        return user.selectedCategories.some(category => 
          category.toLowerCase().includes(searchLower)
        );
      case 'all':
      default:
        const verifiedTextAll = user.emailVerified ? "doğrulandı" : "doğrulanmadı";
        const privacyTextAll = user.privacyAccepted ? "kabul edildi" : "kabul edilmedi";
        const termsTextAll = user.termsAccepted ? "kabul edildi" : "kabul edilmedi";
        const notificationTextAll = user.notificationsStatus?.enabled ? "evet" : "hayır";
        
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          verifiedTextAll.includes(searchLower) ||
          privacyTextAll.includes(searchLower) ||
          termsTextAll.includes(searchLower) ||
          (user.claimedCount || 0).toString().includes(searchLower) ||
          notificationTextAll.includes(searchLower) ||
          user.selectedCategories.some(category => 
            category.toLowerCase().includes(searchLower)
          )
        );
    }
  });

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`${userName} adlı kullanıcıyı silmek istediğinizden emin misiniz?`)) {
      setDeletingUser(userId);
      try {
        const db = getFirestore();
        await deleteDoc(doc(db, "users", userId));
        setUsers(users.filter(user => user.id !== userId));
        alert("Kullanıcı başarıyla silindi.");
      } catch (error) {
        console.error("Kullanıcı silinirken hata:", error);
        alert("Kullanıcı silinirken bir hata oluştu.");
      } finally {
        setDeletingUser(null);
      }
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Kullanıcılar yükleniyor...</div>;
  }

  return (
    <div style={{
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
        <table style={{ 
          width: "100%", 
          borderCollapse: "collapse", 
          backgroundColor: "white"
        }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Kullanıcı</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>E-posta</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Kayıt Tarihi</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>E-posta Durumu</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Gizlilik Kabul</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Şartlar Kabul</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Yakalanan Kampanya</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>QR Kod Okutuldu mu</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Kategoriler</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "12px" }}>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #f1f3f4" }}>
                <td style={{ padding: 12 }}>
                  <div>
                    <strong>{user.name}</strong>
                  </div>
                </td>
                <td style={{ padding: 12 }}>{user.email}</td>
                <td style={{ padding: 12 }}>
                  {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString('tr-TR') : "Bilinmiyor"}
                </td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: 12,
                    fontSize: "0.8em",
                    backgroundColor: user.emailVerified ? "#d4edda" : "#f8d7da",
                    color: user.emailVerified ? "#155724" : "#721c24"
                  }}>
                    {user.emailVerified ? "Doğrulandı" : "Doğrulanmadı"}
                  </span>
                </td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: 12,
                    fontSize: "0.8em",
                    backgroundColor: user.privacyAccepted ? "#d4edda" : "#f8d7da",
                    color: user.privacyAccepted ? "#155724" : "#721c24",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    minWidth: "80px"
                  }}>
                    {user.privacyAccepted ? "Kabul Edildi" : "Kabul Edilmedi"}
                  </span>
                </td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: 12,
                    fontSize: "0.8em",
                    backgroundColor: user.termsAccepted ? "#d4edda" : "#f8d7da",
                    color: user.termsAccepted ? "#155724" : "#721c24",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    minWidth: "80px"
                  }}>
                    {user.termsAccepted ? "Kabul Edildi" : "Kabul Edilmedi"}
                  </span>
                </td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: 12,
                    fontSize: "0.8em",
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2"
                  }}>
                    {user.claimedCount || 0}
                  </span>
                </td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: 12,
                    fontSize: "0.8em",
                    backgroundColor: user.notificationsStatus?.enabled ? "#d4edda" : "#f8d7da",
                    color: user.notificationsStatus?.enabled ? "#155724" : "#721c24"
                  }}>
                    {user.notificationsStatus?.enabled ? "Evet" : "Hayır"}
                  </span>
                </td>
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
                <td style={{ padding: 12 }}>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    disabled={deletingUser === user.id}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: deletingUser === user.id ? "not-allowed" : "pointer",
                      fontSize: "0.8em",
                      opacity: deletingUser === user.id ? 0.6 : 1
                    }}
                  >
                    {deletingUser === user.id ? "Siliniyor..." : "Sil"}
                  </button>
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
    </div>
  );
}

export default Users; 