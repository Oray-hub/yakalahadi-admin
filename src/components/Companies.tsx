import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { NotificationService } from "../services/notificationService";

interface Company {
  id: string;
  company: string;
  companyTitle: string;
  companyOfficer: string;
  companyOfficerName?: string;
  companyOfficerSurname?: string;
  vkn: string;
  createdAt: any;
  firmType: string;
  category: string;
  approved: boolean;
  email: string;
  phone: string;
  averageRating: number;
  credits: number;
  totalPurchasedCredits?: number;
  creditPurchaseDate?: any;
}

function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingCompany, setDeletingCompany] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{x: number, y: number} | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchField, setSearchField] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetailCard, setShowDetailCard] = useState<boolean>(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  // Firma onay red sebebi modal state'leri
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    companyId: string | null;
    companyName: string;
    reason: string;
  }>({
    isOpen: false,
    companyId: null,
    companyName: '',
    reason: ''
  });

  


  // Kategori seçenekleri
  const categoryOptions = [
    "Market", "Zincir Market", "Bakkal", "Fırın", "Manav", "Kasap", "Kuruyemişçi", "Şarküteri", "Eczane",
    "Lokanta", "Restoran", "Fast Food", "Kafe", "Pastane", "Çiğköfteci", "Dönerci", "Kebapçı", "Tatlıcı", "Kokoreççi",
    "Kuaför", "Berber", "Güzellik Salonu", "Masaj Salonu",
    "AVM Mağazası", "Giyim Mağazası", "Ayakkabıcı", "Çanta Mağazası", "Bijuteri", "Mobilya Mağazası",
    "Elektronikçi", "Teknoloji Mağazası", "Telefoncu", "Bilgisayarcı", "Beyaz Eşya Bayisi", "Yapı Market",
    "Spor Salonu", "Fitness Salonu", "Yoga/Pilates Stüdyosu", "Spor Mağazası",
    "Diş Kliniği", "Özel Hastane", "Fizyoterapi Merkezi", "Diyetisyen", "Psikolog", "Estetik Merkezi", "Tıbbi Malzeme",
    "Hırdavatçı", "Elektrikçi", "İnşaat Malzemecisi", "Camcı", "Ev Tekstili", "Perdeci", "Halı Mağazası", "Züccaciye", "Dekorasyon Mağazası", "Avize Mağazası",
    "Pet Shop", "Veteriner",
    "Oto Yıkama", "Oto Kuaför", "Oto Servis", "Oto Yedek Parça", "Lastikçi", "Otopark", "Araç Kiralama",
    "Temizlik Firması", "Halı Yıkama", "Nakliye Firması", "Taşımacılık",
    "İnternet Kafe", "Playstation Cafe", "Oyun Salonu", "Bilardo Salonu",
    "Kütüphane", "Kitapçı", "Kırtasiye", "Oyuncakçı", "Sahaf",
    "Organizasyon Firması", "Fotoğraf Stüdyosu", "Anahtarcı", "Ütücü / Kuru Temizleme", "Matbaa", "Su Arıtma Sistemleri", "Güneş Enerji Sistemleri",
    "Otel", "Pansiyon", "Hostel", "Kamp Alanı", "Güneş Paneli Sistemleri",
    "Anaokulu", "Kreş", "Çocuk Gelişim Merkezi", "Etüt Merkezi", "Sürücü Kursu", "Yabancı Dil Kursu", "Dans Kursu", "Müzik Kursu", "Robotik Atölyesi", "Satranç Kulübü", "Dil Cafe",
    "Tiyatro", "Sinema", "Karaoke Bar", "Resim Atölyesi", "Kamp Malzemeleri"
  ];

  // Firma türü seçenekleri
  const firmTypeOptions = [
    "Yerel", "Türkiye Geneli"
  ];

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (openDropdown && !target.closest('[data-dropdown-container]')) {
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

  const fetchCompanies = async () => {
    try {
      const db = getFirestore();
      const companiesRef = collection(db, "companies");
      const snapshot = await getDocs(companiesRef);
      
      const companiesData: Company[] = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const company = {
          id: doc.id,
          company: data.company || "Firma Adı Yok",
          companyTitle: data.companyTitle || "Firma Başlığı Yok",
          companyOfficer: data.companyOfficer || "Yetkili Yok",
          companyOfficerName: data.companyOfficerName || "",
          companyOfficerSurname: data.companyOfficerSurname || "",
          vkn: data.vkn || "VKN Yok",
          createdAt: data.createdAt,
          firmType: data.firmType || "Firma Türü Yok",
          category: data.category || "Kategori Yok",
          approved: data.approved || false,
          email: data.email || "E-posta Yok",
          phone: data.phone || "Telefon Yok",
          averageRating: data.averageRating || 0,
          credits: data.credits || 0,
          totalPurchasedCredits: data.totalPurchasedCredits || 0,
          creditPurchaseDate: data.creditPurchaseDate,
        };
        
        companiesData.push(company);
      }
      
      setCompanies(companiesData);
      

    } catch (error) {
      console.error("Firmalar yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };



  const updateCompanyApproval = async (companyId: string, approved: boolean) => {
    try {
      const db = getFirestore();
      const companyRef = doc(db, "companies", companyId);
      await updateDoc(companyRef, { approved });
      
      // Firmaları güncelle - kart sayıları otomatik olarak güncellenecek
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, approved }
          : company
      ));
      
      // Eğer detay kartı açıksa, seçili firmayı da güncelle
      if (selectedCompany && selectedCompany.id === companyId) {
        setSelectedCompany(prev => prev ? { ...prev, approved } : null);
        setEditingCompany(prev => prev ? { ...prev, approved } : null);
      }
      
      console.log(`Firma ${companyId} onay durumu ${approved ? 'onaylandı' : 'onay bekliyor'} olarak güncellendi`);
    } catch (error) {
      console.error("Firma güncellenirken hata:", error);
      alert("Firma güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };



  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (window.confirm(`${companyName} adlı firmayı silmek istediğinizden emin misiniz?`)) {
      setDeletingCompany(companyId);
      try {
        const db = getFirestore();
        await deleteDoc(doc(db, "companies", companyId));
        
        setCompanies(companies.filter(company => company.id !== companyId));
        alert("Firma başarıyla silindi.");
      } catch (error) {
        console.error("Firma silinirken hata:", error);
        alert("Firma silinirken bir hata oluştu.");
      } finally {
        setDeletingCompany(null);
      }
    }
  };

  const toggleDropdown = (companyId: string, event: React.MouseEvent) => {
    console.log("Dropdown toggle clicked for company:", companyId);
    console.log("Current openDropdown:", openDropdown);
    
    if (openDropdown === companyId) {
      setOpenDropdown(null);
      setDropdownPosition(null);
    } else {
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        x: rect.left,
        y: rect.bottom + 4
      });
      setOpenDropdown(companyId);
    }
  };



  const handleApprovalChange = async (companyId: string, approved: boolean) => {
    console.log("handleApprovalChange called with:", { companyId, approved });
    
    // Eğer onaylanmıyorsa, red sebebi modal'ını aç
    if (!approved) {
      const company = companies.find(c => c.id === companyId);
      if (company) {
        setRejectionModal({
          isOpen: true,
          companyId: companyId,
          companyName: company.company || company.companyTitle || 'Firma',
          reason: ''
        });
        setOpenDropdown(null);
        setDropdownPosition(null);
        return;
      }
    }
    
    // Onaylanıyorsa direkt işlemi yap
    await processApprovalChange(companyId, approved, '');
  };

  const processApprovalChange = async (companyId: string, approved: boolean, reason: string) => {
    try {
      console.log("🚀 processApprovalChange başladı:", { companyId, approved, reason });
      
      // Önce firma onay durumunu güncelle
      await updateCompanyApproval(companyId, approved);
      console.log("✅ Firma onay durumu güncellendi");
      
      // Cloud Function ile mail gönder
      try {
        console.log("📨 Cloud Function ile mail gönderiliyor...", { 
          companyId, 
          approvalStatus: approved ? 'approved' : 'rejected', 
          reason 
        });
        
        console.log("🔗 NotificationService.sendCompanyApprovalNotice çağrılıyor...");
        const notificationResult = await NotificationService.sendCompanyApprovalNotice(
          companyId,
          approved ? 'approved' : 'rejected',
          reason
        );
        
        console.log("📋 NotificationService sonucu:", notificationResult);
        
        if (notificationResult.success) {
          console.log("✅ Mail başarıyla gönderildi:", notificationResult.message);
          if (approved) {
            const alertDiv = document.createElement('div');
            alertDiv.innerHTML = `✅ Firma onaylandı!<br><br>📧 Mail başarıyla gönderildi`;
            alertDiv.style.cssText = `
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.3);
              z-index: 99999999;
              font-size: 16px;
              text-align: center;
              max-width: 400px;
              border: 2px solid #28a745;
            `;
            document.body.appendChild(alertDiv);
            setTimeout(() => {
              document.body.removeChild(alertDiv);
            }, 3000);
          } else {
            const alertDiv = document.createElement('div');
            alertDiv.innerHTML = `❌ Firma onaylanmadı!<br><br>📧 Mail başarıyla gönderildi`;
            alertDiv.style.cssText = `
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.3);
              z-index: 99999999;
              font-size: 16px;
              text-align: center;
              max-width: 400px;
              border: 2px solid #dc3545;
            `;
            document.body.appendChild(alertDiv);
            setTimeout(() => {
              document.body.removeChild(alertDiv);
            }, 3000);
          }
        } else {
          console.error("❌ Mail gönderilemedi:", notificationResult.message);
          if (approved) {
            const alertDiv = document.createElement('div');
            alertDiv.innerHTML = `✅ Firma onaylandı!<br><br>⚠️ Mail gönderilemedi: ${notificationResult.message}`;
            alertDiv.style.cssText = `
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.3);
              z-index: 99999999;
              font-size: 16px;
              text-align: center;
              max-width: 400px;
              border: 2px solid #ffc107;
            `;
            document.body.appendChild(alertDiv);
            setTimeout(() => {
              document.body.removeChild(alertDiv);
            }, 3000);
          } else {
            const alertDiv = document.createElement('div');
            alertDiv.innerHTML = `❌ Firma onaylanmadı!<br><br>⚠️ Mail gönderilemedi: ${notificationResult.message}`;
            alertDiv.style.cssText = `
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.3);
              z-index: 99999999;
              font-size: 16px;
              text-align: center;
              max-width: 400px;
              border: 2px solid #ffc107;
            `;
            document.body.appendChild(alertDiv);
            setTimeout(() => {
              document.body.removeChild(alertDiv);
            }, 3000);
          }
        }
        
      } catch (notificationError: any) {
        console.error("❌ Mail gönderilirken hata:", notificationError);
        console.error("❌ Hata detayı:", notificationError.stack);
        
        // Mail hatası olsa bile onay durumu değişti
        if (approved) {
          const alertDiv = document.createElement('div');
          alertDiv.innerHTML = `✅ Firma onaylandı!<br><br>⚠️ Mail gönderilemedi: ${notificationError.message}`;
          alertDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 99999999;
            font-size: 16px;
            text-align: center;
            max-width: 400px;
            border: 2px solid #ffc107;
          `;
          document.body.appendChild(alertDiv);
          setTimeout(() => {
            document.body.removeChild(alertDiv);
          }, 3000);
        } else {
          const alertDiv = document.createElement('div');
          alertDiv.innerHTML = `❌ Firma onaylanmadı!<br><br>⚠️ Mail gönderilemedi: ${notificationError.message}`;
          alertDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 99999999;
            font-size: 16px;
            text-align: center;
            max-width: 400px;
            border: 2px solid #ffc107;
          `;
          document.body.appendChild(alertDiv);
          setTimeout(() => {
            document.body.removeChild(alertDiv);
          }, 3000);
        }
      }
      
      setOpenDropdown(null);
      setDropdownPosition(null);
    } catch (error) {
      console.error("❌ Onay durumu değiştirilirken hata:", error);
      alert("❌ Onay durumu değiştirilirken hata oluştu!\n\nLütfen sayfayı yenileyip tekrar deneyin.");
    }
  };







  const handleAverageRatingClick = (companyId: string, companyName: string) => {
    // URL parametresi olarak firma ID'sini ve adını gönder
    navigate(`/reviews?companyId=${companyId}&companyName=${encodeURIComponent(companyName)}`);
  };



  const handleRejectionSubmit = async () => {
    if (!rejectionModal.companyId) return;
    
    if (!rejectionModal.reason.trim()) {
      alert("❌ Lütfen red sebebini belirtin!");
      return;
    }
    
    await processApprovalChange(rejectionModal.companyId, false, rejectionModal.reason);
    setRejectionModal({ isOpen: false, companyId: null, companyName: '', reason: '' });
  };

  const handleRejectionCancel = () => {
    setRejectionModal({ isOpen: false, companyId: null, companyName: '', reason: '' });
  };



  const handleCloseDetailCard = () => {
    setSelectedCompany(null);
    setShowDetailCard(false);
    setEditingCompany(null);
  };

  const handleShowDetailCard = (company: Company) => {
    setSelectedCompany(company);
    setEditingCompany({ ...company }); // Düzenleme için kopya oluştur
    setShowDetailCard(true);
  };

  const handleUpdateCompany = async () => {
    if (!editingCompany) return;
    
    const confirmUpdate = window.confirm(
      `${editingCompany.company} firmasının bilgilerini güncellemek istediğinizden emin misiniz?`
    );
    
    if (!confirmUpdate) return;
    
    try {
      const db = getFirestore();
      const companyRef = doc(db, "companies", editingCompany.id);
      
      // Güncellenecek alanları hazırla
      const updateData: any = {
        company: editingCompany.company,
        companyTitle: editingCompany.companyTitle,
        companyOfficer: editingCompany.companyOfficer,
        companyOfficerName: editingCompany.companyOfficerName,
        companyOfficerSurname: editingCompany.companyOfficerSurname,
        vkn: editingCompany.vkn,
        firmType: editingCompany.firmType,
        category: editingCompany.category,
        email: editingCompany.email,
        phone: editingCompany.phone,
        averageRating: editingCompany.averageRating,
        credits: editingCompany.credits,
        totalPurchasedCredits: editingCompany.totalPurchasedCredits
      };
      
      await updateDoc(companyRef, updateData);
      
      // Local state'i güncelle
      setCompanies(prev => prev.map(company => 
        company.id === editingCompany.id ? editingCompany : company
      ));
      
      // Seçili firmayı da güncelle
      setSelectedCompany(editingCompany);
      
      const alertDiv = document.createElement('div');
      alertDiv.innerHTML = `✅ Firma bilgileri başarıyla güncellendi!`;
      alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 99999999;
        font-size: 16px;
        text-align: center;
        max-width: 400px;
        border: 2px solid #28a745;
      `;
      document.body.appendChild(alertDiv);
      setTimeout(() => {
        document.body.removeChild(alertDiv);
      }, 3000);
    } catch (error) {
      console.error("Firma güncellenirken hata:", error);
      const alertDiv = document.createElement('div');
      alertDiv.innerHTML = `❌ Firma güncellenirken bir hata oluştu. Lütfen tekrar deneyin.`;
      alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 99999999;
        font-size: 16px;
        text-align: center;
        max-width: 400px;
        border: 2px solid #dc3545;
      `;
      document.body.appendChild(alertDiv);
      setTimeout(() => {
        document.body.removeChild(alertDiv);
      }, 3000);
    }
  };

  const handleDeleteFromCard = async () => {
    if (!selectedCompany) return;
    
    const confirmDelete = window.confirm(
      `${selectedCompany.company} firmasını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`
    );
    
    if (!confirmDelete) return;
    
    await handleDeleteCompany(selectedCompany.id, selectedCompany.company);
    handleCloseDetailCard();
  };



  const filteredCompanies = companies.filter(company => {
    // Normal arama filtresi
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      
      // Seçili alana göre arama yap
      switch (searchField) {
        case 'company':
          return company.company.toLowerCase().includes(searchLower);
        case 'vkn':
          return company.vkn.toLowerCase().includes(searchLower);
        case 'approved':
          const approvalStatus = company.approved ? 'onaylandı' : 'onay bekliyor';
          return approvalStatus.includes(searchLower);
        case 'phone':
          return company.phone.toLowerCase().includes(searchLower);
        case 'email':
          return (company.email || '').toLowerCase().includes(searchLower);
        case 'all':
        default:
          const officerNameForAll = company.companyOfficerName && company.companyOfficerSurname 
            ? `${company.companyOfficerName} ${company.companyOfficerSurname}`.toLowerCase()
            : company.companyOfficer.toLowerCase();
          return (
            company.company.toLowerCase().includes(searchLower) ||
            company.companyTitle.toLowerCase().includes(searchLower) ||
            officerNameForAll.includes(searchLower) ||
            company.vkn.toLowerCase().includes(searchLower) ||
            company.firmType.toLowerCase().includes(searchLower) ||
            company.category.toLowerCase().includes(searchLower) ||
            company.phone.toLowerCase().includes(searchLower) ||
            (company.email || '').toLowerCase().includes(searchLower)
          );
      }
    }

    return true;
  });

  console.log("Current openDropdown state:", openDropdown);
  console.log("Filtered companies count:", filteredCompanies.length);

  if (loading) {
    return <div style={{ padding: 20 }}>Firmalar yükleniyor...</div>;
  }

  return (
    <div className="companies-container" style={{
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
          Firmalar
        </h1>
      </div>

      {/* Sabit İstatistik Kartları */}
      <div style={{
        flexShrink: 0,
        marginBottom: "16px",
        width: "100%"
      }}>
        <div className="companies-stats" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", 
          gap: "12px", 
          marginBottom: "6px",
          width: "100%"
        }}>
          {/* Toplam Firma Sayısı */}
          <div style={{
            backgroundColor: "#e3f2fd",
            borderRadius: "6px",
            padding: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #bbdefb"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", marginRight: "4px" }}>🏢</span>
              <h3 style={{ margin: 0, color: "#1976d2", fontSize: "13px" }}>Toplam Firma</h3>
            </div>
            <div style={{ fontSize: "25px", fontWeight: "bold", color: "#1976d2", marginBottom: "2px" }}>
              {companies.length}
            </div>
          </div>

          {/* Kayıtlı Firma Sayısı */}
          <div style={{
            backgroundColor: "#e8f5e8",
            borderRadius: "6px",
            padding: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #c8e6c9"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", marginRight: "4px" }}>✅</span>
              <h3 style={{ margin: 0, color: "#2e7d32", fontSize: "13px" }}>Kayıtlı Firma</h3>
            </div>
            <div style={{ fontSize: "25px", fontWeight: "bold", color: "#2e7d32", marginBottom: "2px" }}>
              {companies.filter(company => company.approved).length}
            </div>
          </div>

          {/* Bekleyen Firma Sayısı */}
          <div style={{
            backgroundColor: "#fff3cd",
            borderRadius: "6px",
            padding: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #ffeaa7"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", marginRight: "4px" }}>⏳</span>
              <h3 style={{ margin: 0, color: "#856404", fontSize: "13px" }}>Bekleyen Firma</h3>
            </div>
            <div style={{ fontSize: "25px", fontWeight: "bold", color: "#856404", marginBottom: "2px" }}>
              {companies.filter(company => !company.approved).length}
            </div>
          </div>
        </div>
      </div>

      {/* Sabit Filtre Kısmı */}
      <div className="companies-filters" style={{
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
            <option value="company">🏢 Firma Adı</option>
            <option value="vkn">🏛️ VKN</option>
            <option value="approved">✅ Onay Durumu</option>
            <option value="phone">📞 Telefon</option>
            <option value="email">📧 Kayıtlı Mail</option>
          </select>
          
          <input
            type="text"
            placeholder={`🔍 ${searchField === 'all' ? 'Tüm alanlarda ara...' : 
              searchField === 'company' ? 'Firma adı ara...' :
              searchField === 'vkn' ? 'VKN ara...' :
              searchField === 'approved' ? 'Onay durumu ara...' :
              searchField === 'phone' ? 'Telefon ara...' :
              searchField === 'email' ? 'Kayıtlı mail ara...' : 'Ara...'}`}
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
            {filteredCompanies.length}
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
        {/* Mobil için kart görünümü */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '12px'
        }} className="mobile-cards">
          {filteredCompanies.map((company) => (
            <div key={company.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#007bff',
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleShowDetailCard(company)}
                  >
                    {company.company}
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      padding: '2px 8px',
                      backgroundColor: '#f0f8ff',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#0066cc'
                    }}>
                      {company.firmType || "Bilinmiyor"}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#1976d2'
                    }}>
                      {company.vkn}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => toggleDropdown(company.id, e)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: company.approved ? '#d4edda' : '#fff3cd',
                    color: company.approved ? '#155724' : '#856404',
                    border: 'none',
                    cursor: 'pointer',
                    minWidth: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px'
                  }}
                >
                  {company.approved ? "✅ Onaylandı" : "⏳ Bekliyor"}
                  <span style={{ fontSize: '10px' }}>▼</span>
                </button>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '12px'
              }}>
                <div>
                  <strong>📧 E-posta:</strong>
                  <div style={{ color: '#666', wordBreak: 'break-all' }}>{company.email}</div>
                </div>
                <div>
                  <strong>📞 Telefon:</strong>
                  <div style={{ color: '#666' }}>{company.phone}</div>
                </div>
              </div>
              
              {openDropdown === company.id && dropdownPosition && (
                <div 
                  data-dropdown-container
                  style={{
                    position: "fixed",
                    top: dropdownPosition.y,
                    left: dropdownPosition.x,
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 999999,
                    minWidth: "150px",
                    padding: "6px 0"
                  }}
                >
                  <div
                    data-dropdown-container
                    style={{
                      padding: "8px 12px",
                      borderBottom: "1px solid #eee",
                      cursor: "pointer",
                      fontSize: "0.8em",
                      color: company.approved ? "#155724" : "#666",
                      backgroundColor: company.approved ? "#f8f9fa" : "transparent"
                    }}
                    onClick={() => handleApprovalChange(company.id, true)}
                  >
                    ✅ Onaylandı
                  </div>
                  <div
                    data-dropdown-container
                    style={{
                      padding: "8px 12px",
                      borderBottom: "1px solid #eee",
                      cursor: "pointer",
                      fontSize: "0.8em",
                      color: !company.approved ? "#856404" : "#666",
                      backgroundColor: !company.approved ? "#f8f9fa" : "transparent"
                    }}
                    onClick={() => handleApprovalChange(company.id, false)}
                  >
                    ⏳ Onay Bekliyor
                  </div>
                  <div
                    data-dropdown-container
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "0.8em",
                      color: "#dc3545",
                      backgroundColor: "transparent"
                    }}
                    onClick={() => handleApprovalChange(company.id, false)}
                  >
                    ❌ Onaylanmadı
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Desktop için tablo görünümü */}
        <table className="companies-table desktop-table" style={{ 
          width: "100%", 
          borderCollapse: "collapse", 
          backgroundColor: "white"
        }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>İl</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Firma Adı</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>VKN</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Onay Durumu</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Kayıtlı Mail</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Telefon</th>

            </tr>
          </thead>
          <tbody style={{ fontSize: "12px" }}>
            {filteredCompanies.map((company) => (
              <tr key={company.id} style={{ borderBottom: "1px solid #f1f3f4", overflow: "visible" }}>
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: "4px 8px",
                    backgroundColor: "#f0f8ff",
                    borderRadius: 12,
                    fontSize: "0.8em",
                    color: "#0066cc"
                  }}>
                    {company.firmType || "Bilinmiyor"}
                  </span>
                </td>
                <td style={{ padding: 12 }}>
                  <strong 
                    style={{
                      cursor: 'pointer',
                      color: '#007bff',
                      textDecoration: 'underline',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleShowDetailCard(company)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = '#0056b3';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = '#007bff';
                    }}
                  >
                    {company.company}
                  </strong>
                </td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: "4px 8px",
                    backgroundColor: "#e3f2fd",
                    borderRadius: 12,
                    fontSize: "0.8em",
                    color: "#1976d2"
                  }}>
                    {company.vkn}
                  </span>
                </td>
                <td style={{ padding: 12, position: "relative", overflow: "visible" }}>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={(e) => toggleDropdown(company.id, e)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 12,
                        fontSize: "0.8em",
                        backgroundColor: company.approved ? "#d4edda" : "#fff3cd",
                        color: company.approved ? "#155724" : "#856404",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        minWidth: "120px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "4px"
                      }}
                    >
                      {company.approved ? "✅ Onaylandı" : "⏳ Onay Bekliyor"}
                      <span style={{ fontSize: "10px" }}>▼</span>
                    </button>
                    
                    {openDropdown === company.id && dropdownPosition && (
                      <div 
                        data-dropdown-container
                        style={{
                          position: "fixed",
                          top: dropdownPosition.y,
                          left: dropdownPosition.x,
                          backgroundColor: "white",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          zIndex: 999999,
                          minWidth: "150px",
                          padding: "6px 0"
                        }}
                      >
                        <div
                          data-dropdown-container
                          style={{
                            padding: "8px 12px",
                            borderBottom: "1px solid #eee",
                            cursor: "pointer",
                            fontSize: "0.8em",
                            color: company.approved ? "#155724" : "#666",
                            backgroundColor: company.approved ? "#f8f9fa" : "transparent"
                          }}
                          onClick={() => handleApprovalChange(company.id, true)}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#f8f9fa";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = company.approved ? "#f8f9fa" : "transparent";
                          }}
                        >
                          ✅ Onaylandı
                        </div>
                        <div
                          data-dropdown-container
                          style={{
                            padding: "8px 12px",
                            borderBottom: "1px solid #eee",
                            cursor: "pointer",
                            fontSize: "0.8em",
                            color: !company.approved ? "#856404" : "#666",
                            backgroundColor: !company.approved ? "#f8f9fa" : "transparent"
                          }}
                          onClick={() => handleApprovalChange(company.id, false)}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#f8f9fa";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = !company.approved ? "#f8f9fa" : "transparent";
                          }}
                        >
                          ⏳ Onay Bekliyor
                        </div>
                        <div
                          data-dropdown-container
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontSize: "0.8em",
                            color: "#dc3545",
                            backgroundColor: "transparent"
                          }}
                          onClick={() => handleApprovalChange(company.id, false)}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#f8f9fa";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          ❌ Onaylanmadı
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: "4px 8px",
                    backgroundColor: "#e8f4fd",
                    borderRadius: 12,
                    fontSize: "0.8em",
                    color: "#0d6efd"
                  }}>
                    {company.email}
                  </span>
                </td>
                <td style={{ padding: 12 }}>{company.phone}</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCompanies.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
          {searchTerm ? `"${searchTerm}" ${searchField === 'all' ? 'tüm alanlarda' : 
            searchField === 'company' ? 'firma adında' :
            searchField === 'companyTitle' ? 'firma başlığında' :
            searchField === 'companyOfficer' ? 'firma yetkilisinde' :
            searchField === 'vkn' ? 'VKN\'de' :
            searchField === 'approved' ? 'onay durumunda' :
            searchField === 'firmType' ? 'firma türünde' :
            searchField === 'category' ? 'kategoride' :
            searchField === 'phone' ? 'telefonda' :
            searchField === 'email' ? 'kayıtlı mailde' :
            searchField === 'averageRating' ? 'ortalama puanda' :
            searchField === 'credits' ? 'kredilerde' : 'aranan alanda'} için sonuç bulunamadı.` :
           "Henüz firma bulunmuyor."}
        </div>
      )}

      {/* Firma Onay Red Sebebi Modal */}
      {rejectionModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              color: '#dc3545',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ❌ Firma Onayını Reddet
            </h3>
            
            <p style={{
              margin: '0 0 16px 0',
              color: '#666',
              fontSize: '14px'
            }}>
              <strong>{rejectionModal.companyName}</strong> firmasının onayını reddetmek üzeresiniz.
              Lütfen red sebebini belirtin:
            </p>
            
            <textarea
              value={rejectionModal.reason}
              onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Red sebebini buraya yazın... (Örn: Eksik belge, yanlış bilgi, vb.)"
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '16px'
              }}
              autoFocus
            />
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleRejectionCancel}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                İptal
              </button>
              <button
                onClick={handleRejectionSubmit}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Reddet ve Bildirim Gönder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Firma Detay Kartı Modal */}
      {showDetailCard && selectedCompany && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: window.innerWidth <= 768 ? '16px' : '32px',
            maxWidth: '800px',
            width: '95%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            {/* Kapatma Butonu */}
            <button
              onClick={handleCloseDetailCard}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
                e.currentTarget.style.color = '#333';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#666';
              }}
            >
              ✕
            </button>

            {/* Firma Logo */}
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #dee2e6'
              }}>
                <span style={{ fontSize: '48px', color: '#6c757d' }}>🏢</span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  value={editingCompany?.company || ''}
                  onChange={(e) => setEditingCompany(prev => prev ? { ...prev, company: e.target.value } : null)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    color: '#333'
                  }}
                  placeholder="Firma Adı"
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  value={editingCompany?.companyTitle || ''}
                  onChange={(e) => setEditingCompany(prev => prev ? { ...prev, companyTitle: e.target.value } : null)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    color: '#666'
                  }}
                  placeholder="Firma Başlığı"
                />
              </div>
            </div>

            {/* Firma Bilgileri Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: window.innerWidth <= 768 ? '16px' : '24px',
              marginBottom: '32px'
            }}>
              {/* Sol Kolon */}
              <div>
                <h3 style={{
                  margin: '0 0 16px 0',
                  color: '#333',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  borderBottom: '2px solid #007bff',
                  paddingBottom: '8px'
                }}>
                  📋 Temel Bilgiler
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#555' }}>VKN:</span>
                    <input
                      type="text"
                      value={editingCompany?.vkn || ''}
                      onChange={(e) => setEditingCompany(prev => prev ? { ...prev, vkn: e.target.value } : null)}
                      style={{
                        padding: '4px 12px',
                        border: '2px solid #e3f2fd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#1976d2',
                        backgroundColor: '#e3f2fd',
                        width: '200px',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#555' }}>Firma Türü:</span>
                    <select
                      value={editingCompany?.firmType || ''}
                      onChange={(e) => setEditingCompany(prev => prev ? { ...prev, firmType: e.target.value } : null)}
                      style={{
                        padding: '4px 12px',
                        border: '2px solid #f3e5f5',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#7b1fa2',
                        backgroundColor: '#f3e5f5',
                        width: '200px',
                        textAlign: 'center'
                      }}
                    >
                      {firmTypeOptions.map((firmType) => (
                        <option key={firmType} value={firmType}>{firmType}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#555' }}>Kategori:</span>
                    <select
                      value={editingCompany?.category || ''}
                      onChange={(e) => setEditingCompany(prev => prev ? { ...prev, category: e.target.value } : null)}
                      style={{
                        padding: '4px 12px',
                        border: '2px solid #e9ecef',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#495057',
                        backgroundColor: '#e9ecef',
                        width: '200px',
                        textAlign: 'center'
                      }}
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#555' }}>Onay Durumu:</span>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={(e) => toggleDropdown(selectedCompany.id, e)}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: selectedCompany.approved ? '#d4edda' : '#fff3cd',
                          color: selectedCompany.approved ? '#155724' : '#856404',
                          border: '2px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          minWidth: '150px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '4px'
                        }}
                      >
                        {selectedCompany.approved ? '✅ Onaylandı' : '⏳ Onay Bekliyor'}
                        <span style={{ fontSize: '10px' }}>▼</span>
                      </button>
                      
                      {openDropdown === selectedCompany.id && dropdownPosition && (
                        <div 
                          data-dropdown-container
                          style={{
                            position: "fixed",
                            top: dropdownPosition.y,
                            left: dropdownPosition.x,
                            backgroundColor: "white",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            zIndex: 999999,
                            minWidth: "150px",
                            padding: "6px 0"
                          }}
                        >
                          <div
                            data-dropdown-container
                            style={{
                              padding: "8px 12px",
                              borderBottom: "1px solid #eee",
                              cursor: "pointer",
                              fontSize: "0.8em",
                              color: selectedCompany.approved ? "#155724" : "#666",
                              backgroundColor: selectedCompany.approved ? "#f8f9fa" : "transparent"
                            }}
                            onClick={() => handleApprovalChange(selectedCompany.id, true)}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = "#f8f9fa";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = selectedCompany.approved ? "#f8f9fa" : "transparent";
                            }}
                          >
                            ✅ Onaylandı
                          </div>
                          <div
                            data-dropdown-container
                            style={{
                              padding: "8px 12px",
                              borderBottom: "1px solid #eee",
                              cursor: "pointer",
                              fontSize: "0.8em",
                              color: !selectedCompany.approved ? "#856404" : "#666",
                              backgroundColor: !selectedCompany.approved ? "#f8f9fa" : "transparent"
                            }}
                            onClick={() => handleApprovalChange(selectedCompany.id, false)}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = "#f8f9fa";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = !selectedCompany.approved ? "#f8f9fa" : "transparent";
                            }}
                          >
                            ⏳ Onay Bekliyor
                          </div>
                          <div
                            data-dropdown-container
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              fontSize: "0.8em",
                              color: "#dc3545",
                              backgroundColor: "transparent"
                            }}
                            onClick={() => handleApprovalChange(selectedCompany.id, false)}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = "#f8f9fa";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            ❌ Onaylanmadı
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#555' }}>Kayıt Tarihi:</span>
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      {selectedCompany.createdAt ? new Date(selectedCompany.createdAt.toDate()).toLocaleDateString('tr-TR') : "Bilinmiyor"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sağ Kolon */}
              <div>
                <h3 style={{
                  margin: '0 0 16px 0',
                  color: '#333',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  borderBottom: '2px solid #28a745',
                  paddingBottom: '8px'
                }}>
                  👤 İletişim Bilgileri
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#555' }}>Firma Yetkilisi:</span>
                    <input
                      type="text"
                      value={editingCompany?.companyOfficerName && editingCompany?.companyOfficerSurname 
                        ? `${editingCompany.companyOfficerName} ${editingCompany.companyOfficerSurname}`
                        : editingCompany?.companyOfficer || ''
                      }
                      onChange={(e) => {
                        const names = e.target.value.split(' ');
                        setEditingCompany(prev => prev ? { 
                          ...prev, 
                          companyOfficerName: names[0] || '',
                          companyOfficerSurname: names.slice(1).join(' ') || '',
                          companyOfficer: e.target.value
                        } : null);
                      }}
                      style={{
                        padding: '4px 12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#666',
                        backgroundColor: '#f8f9fa',
                        width: '200px',
                        textAlign: 'center'
                      }}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#555' }}>E-posta:</span>
                    <input
                      type="email"
                      value={editingCompany?.email || ''}
                      onChange={(e) => setEditingCompany(prev => prev ? { ...prev, email: e.target.value } : null)}
                      style={{
                        padding: '4px 12px',
                        border: '2px solid #e8f4fd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#0d6efd',
                        backgroundColor: '#e8f4fd',
                        width: '200px',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#555' }}>Telefon:</span>
                    <input
                      type="text"
                      value={editingCompany?.phone || ''}
                      onChange={(e) => setEditingCompany(prev => prev ? { ...prev, phone: e.target.value } : null)}
                      style={{
                        padding: '4px 12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#666',
                        backgroundColor: '#f8f9fa',
                        width: '200px',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* İstatistikler */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: window.innerWidth <= 768 ? '12px' : '16px',
              marginBottom: '32px'
            }}>
                             <div style={{
                 backgroundColor: '#fff3e0',
                 borderRadius: '12px',
                 padding: '20px',
                 textAlign: 'center',
                 border: '1px solid #ffe0b2'
               }}>
                 <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
                 <input
                   type="number"
                   step="0.1"
                   min="0"
                   max="5"
                   value={editingCompany?.averageRating || 0}
                   onChange={(e) => setEditingCompany(prev => prev ? { ...prev, averageRating: parseFloat(e.target.value) || 0 } : null)}
                   style={{
                     fontSize: '24px',
                     fontWeight: 'bold',
                     color: '#f57c00',
                     marginBottom: '4px',
                     border: 'none',
                     backgroundColor: 'transparent',
                     textAlign: 'center',
                     width: '100%'
                   }}
                 />
                 <div style={{ fontSize: '14px', color: '#666' }}>Ortalama Puan</div>
               </div>
               
               <div style={{
                 backgroundColor: '#e8f5e8',
                 borderRadius: '12px',
                 padding: '20px',
                 textAlign: 'center',
                 border: '1px solid #c8e6c9'
               }}>
                 <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
                 <input
                   type="number"
                   min="0"
                   value={editingCompany?.credits || 0}
                   onChange={(e) => setEditingCompany(prev => prev ? { ...prev, credits: parseInt(e.target.value) || 0 } : null)}
                   style={{
                     fontSize: '24px',
                     fontWeight: 'bold',
                     color: '#2e7d32',
                     marginBottom: '4px',
                     border: 'none',
                     backgroundColor: 'transparent',
                     textAlign: 'center',
                     width: '100%'
                   }}
                 />
                 <div style={{ fontSize: '14px', color: '#666' }}>Mevcut Kredi</div>
               </div>
               
               <div style={{
                 backgroundColor: '#f3e5f5',
                 borderRadius: '12px',
                 padding: '20px',
                 textAlign: 'center',
                 border: '1px solid #e1bee7'
               }}>
                 <div style={{ fontSize: '32px', marginBottom: '8px' }}>💳</div>
                 <div style={{
                   fontSize: '24px',
                   fontWeight: 'bold',
                   color: '#7b1fa2',
                   marginBottom: '4px'
                 }}>
                   {editingCompany?.totalPurchasedCredits || 0}
                 </div>
                 <div style={{ fontSize: '14px', color: '#666' }}>Toplam Alınan Kredi</div>
               </div>
            </div>

            {/* İşlem Butonları */}
            <div style={{
              display: 'flex',
              gap: window.innerWidth <= 768 ? '8px' : '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => handleAverageRatingClick(selectedCompany.id, selectedCompany.company)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f57c00';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff9800';
                }}
              >
                ⭐ Yorumları Görüntüle
              </button>
              
              <button
                onClick={handleUpdateCompany}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#218838';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#28a745';
                }}
              >
                ✅ Güncelle
              </button>
              
              <button
                onClick={handleDeleteFromCard}
                disabled={deletingCompany === selectedCompany.id}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: deletingCompany === selectedCompany.id ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: deletingCompany === selectedCompany.id ? 0.6 : 1
                }}
                onMouseOver={(e) => {
                  if (deletingCompany !== selectedCompany.id) {
                    e.currentTarget.style.backgroundColor = '#c82333';
                  }
                }}
                onMouseOut={(e) => {
                  if (deletingCompany !== selectedCompany.id) {
                    e.currentTarget.style.backgroundColor = '#dc3545';
                  }
                }}
              >
                {deletingCompany === selectedCompany.id ? '🗑️ Siliniyor...' : '🗑️ Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Companies; 