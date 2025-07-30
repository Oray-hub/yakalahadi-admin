import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

interface Company {
  id: string;
  company: string;
  companyTitle: string;
  companyOfficer: string;
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
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState<string | null>(null);
  const [categoryDropdownPosition, setCategoryDropdownPosition] = useState<{x: number, y: number} | null>(null);
  const [openFirmTypeDropdown, setOpenFirmTypeDropdown] = useState<string | null>(null);
  const [firmTypeDropdownPosition, setFirmTypeDropdownPosition] = useState<{x: number, y: number} | null>(null);
  const [editingField, setEditingField] = useState<{companyId: string, field: 'averageRating' | 'credits'} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchField, setSearchField] = useState<string>('all');

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
      if (openCategoryDropdown && !target.closest('[data-category-dropdown-container]')) {
        setOpenCategoryDropdown(null);
        setCategoryDropdownPosition(null);
      }
      if (openFirmTypeDropdown && !target.closest('[data-firmtype-dropdown-container]')) {
        setOpenFirmTypeDropdown(null);
        setFirmTypeDropdownPosition(null);
      }
    };

    if (openDropdown || openCategoryDropdown || openFirmTypeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdown, openCategoryDropdown, openFirmTypeDropdown]);

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
      
      console.log(`Firma ${companyId} onay durumu ${approved ? 'onaylandı' : 'onay bekliyor'} olarak güncellendi`);
    } catch (error) {
      console.error("Firma güncellenirken hata:", error);
      alert("Firma güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const updateCompanyCategory = async (companyId: string, category: string) => {
    try {
      const db = getFirestore();
      const companyRef = doc(db, "companies", companyId);
      await updateDoc(companyRef, { category });
      
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, category }
          : company
      ));
      
      console.log(`Firma ${companyId} kategorisi ${category} olarak güncellendi`);
    } catch (error) {
      console.error("Firma kategorisi güncellenirken hata:", error);
      alert("Firma kategorisi güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const updateCompanyFirmType = async (companyId: string, firmType: string) => {
    try {
      const db = getFirestore();
      const companyRef = doc(db, "companies", companyId);
      await updateDoc(companyRef, { firmType });
      
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, firmType }
          : company
      ));
      
      console.log(`Firma ${companyId} firma türü ${firmType} olarak güncellendi`);
    } catch (error) {
      console.error("Firma türü güncellenirken hata:", error);
      alert("Firma türü güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
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

  const toggleCategoryDropdown = (companyId: string, event: React.MouseEvent) => {
    console.log("Category dropdown toggle clicked for company:", companyId);
    console.log("Current openCategoryDropdown:", openCategoryDropdown);
    
    if (openCategoryDropdown === companyId) {
      setOpenCategoryDropdown(null);
      setCategoryDropdownPosition(null);
    } else {
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      setCategoryDropdownPosition({
        x: rect.left,
        y: rect.bottom + 4
      });
      setOpenCategoryDropdown(companyId);
    }
  };

  const toggleFirmTypeDropdown = (companyId: string, event: React.MouseEvent) => {
    console.log("Firm type dropdown toggle clicked for company:", companyId);
    console.log("Current openFirmTypeDropdown:", openFirmTypeDropdown);
    
    if (openFirmTypeDropdown === companyId) {
      setOpenFirmTypeDropdown(null);
      setFirmTypeDropdownPosition(null);
    } else {
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      setFirmTypeDropdownPosition({
        x: rect.left,
        y: rect.bottom + 4
      });
      setOpenFirmTypeDropdown(companyId);
    }
  };

  const handleApprovalChange = async (companyId: string, approved: boolean) => {
    console.log("handleApprovalChange called with:", { companyId, approved });
    try {
      await updateCompanyApproval(companyId, approved);
      console.log("updateCompanyApproval completed successfully");
      setOpenDropdown(null);
      setDropdownPosition(null);
    } catch (error) {
      console.error("Onay durumu değiştirilirken hata:", error);
    }
  };

  const handleCategoryChange = async (companyId: string, category: string) => {
    console.log("handleCategoryChange called with:", { companyId, category });
    try {
      await updateCompanyCategory(companyId, category);
      console.log("updateCompanyCategory completed successfully");
      setOpenCategoryDropdown(null);
      setCategoryDropdownPosition(null);
    } catch (error) {
      console.error("Kategori değiştirilirken hata:", error);
    }
  };

  const handleFirmTypeChange = async (companyId: string, firmType: string) => {
    console.log("handleFirmTypeChange called with:", { companyId, firmType });
    try {
      await updateCompanyFirmType(companyId, firmType);
      console.log("updateCompanyFirmType completed successfully");
      setOpenFirmTypeDropdown(null);
      setFirmTypeDropdownPosition(null);
    } catch (error) {
      console.error("Firma türü değiştirilirken hata:", error);
    }
  };

  const handleEditField = (companyId: string, field: 'averageRating' | 'credits', currentValue: number) => {
    setEditingField({ companyId, field });
    setEditValue(currentValue.toString());
  };

  const handleSaveEdit = async () => {
    if (!editingField) return;
    
    const { companyId, field } = editingField;
    const numericValue = parseFloat(editValue);
    
    if (isNaN(numericValue)) {
      alert("Lütfen geçerli bir sayı girin!");
      return;
    }

    // Kredi miktarı için özel kontrol
    if (field === 'credits') {
      const currentCompany = companies.find(c => c.id === companyId);
      if (currentCompany) {
        // Kredi miktarı azaltılıyorsa uyarı ver
        if (numericValue < currentCompany.credits) {
          const confirmDecrease = window.confirm(
            `⚠️ DİKKAT: Mevcut kullanılabilir krediyi ${currentCompany.credits}'den ${numericValue}'ye düşürmek istediğinizden emin misiniz?\n\n` +
            `Bu işlem sadece mevcut kullanılabilir krediyi etkiler.\n` +
            `Toplam alınan kredi miktarı (muhasebe) değişmez.\n\n` +
            `Eğer bu Flutter uygulamasından gelen bir hata ise, lütfen Flutter kodunu kontrol edin.`
          );
          
          if (!confirmDecrease) {
            return;
          }
        }
        
        // Kredi miktarı artırılıyorsa totalPurchasedCredits'i de güncelle
        if (numericValue > currentCompany.credits) {
          const creditIncrease = numericValue - currentCompany.credits;
          const newTotalPurchasedCredits = (currentCompany.totalPurchasedCredits || 0) + creditIncrease;
          
          try {
            const db = getFirestore();
            const companyRef = doc(db, "companies", companyId);
            await updateDoc(companyRef, { 
              [field]: numericValue,
              totalPurchasedCredits: newTotalPurchasedCredits,
              creditPurchaseDate: new Date()
            });
            
            setCompanies(prev => prev.map(company => 
              company.id === companyId 
                ? { 
                    ...company, 
                    [field]: numericValue,
                    totalPurchasedCredits: newTotalPurchasedCredits,
                    creditPurchaseDate: new Date()
                  }
                : company
            ));
            
            console.log(`Firma ${companyId} mevcut kredi ${numericValue} ve toplam alınan kredi ${newTotalPurchasedCredits} olarak güncellendi`);
            setEditingField(null);
            setEditValue('');
            alert(`Krediler başarıyla güncellendi!\nMevcut kullanılabilir kredi: ${numericValue}\nToplam alınan kredi: ${newTotalPurchasedCredits}`);
            return;
          } catch (error) {
            console.error("Kredi güncellenirken hata:", error);
            alert("Kredi güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
            return;
          }
        }
      }
    }

    try {
      const db = getFirestore();
      const companyRef = doc(db, "companies", companyId);
      await updateDoc(companyRef, { [field]: numericValue });
      
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, [field]: numericValue }
          : company
      ));
      
      console.log(`Firma ${companyId} ${field} değeri ${numericValue} olarak güncellendi`);
      setEditingField(null);
      setEditValue('');
      alert(`${field === 'averageRating' ? 'Ortalama Puan' : 'Krediler'} başarıyla güncellendi!`);
    } catch (error) {
      console.error("Alan güncellenirken hata:", error);
      alert("Alan güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleAverageRatingClick = (companyId: string, companyName: string) => {
    // URL parametresi olarak firma ID'sini ve adını gönder
    navigate(`/reviews?companyId=${companyId}&companyName=${encodeURIComponent(companyName)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Firma yıldızlarını yeniden hesaplama fonksiyonu
  const recalculateCompanyRating = async (companyId: string) => {
    try {
      const db = getFirestore();
      
      // Firma için tüm yorumları getir
      const reviewsRef = collection(db, "companies", companyId, "reviews");
      const reviewsSnapshot = await getDocs(reviewsRef);
      
      let totalRating = 0;
      let reviewCount = 0;
      
      console.log(`Firma ${companyId} için yorum sayısı: ${reviewsSnapshot.size}`);
      
      // Tüm yorumların puanlarını topla
      reviewsSnapshot.forEach((doc) => {
        const reviewData = doc.data();
        console.log(`Yorum ${doc.id}:`, reviewData);
        if (reviewData.rating && typeof reviewData.rating === 'number') {
          totalRating += reviewData.rating;
          reviewCount++;
        }
      });
      
      // Ortalama puanı hesapla
      const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
      
      console.log(`Hesaplama: Toplam puan: ${totalRating}, Yorum sayısı: ${reviewCount}, Ortalama: ${averageRating}`);
      
      // Firma dokümanını güncelle
      const companyRef = doc(db, "companies", companyId);
      await updateDoc(companyRef, {
        averageRating: Math.round(averageRating * 10) / 10, // 1 ondalık basamak
        ratingCount: reviewCount,
        totalScore: totalRating
      });
      
      console.log(`✅ Firma ${companyId} puanı güncellendi: ${averageRating} (${reviewCount} yorum)`);
      
      // Firmaları yeniden yükle
      fetchCompanies();
      
      alert(`Firma puanı güncellendi: ${Math.round(averageRating * 10) / 10} (${reviewCount} yorum)`);
    } catch (error) {
      console.error("Firma puanı güncellenirken hata:", error);
      alert("Firma puanı güncellenirken bir hata oluştu.");
    }
  };

  const filteredCompanies = companies.filter(company => {
    // Normal arama filtresi
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      
      // Seçili alana göre arama yap
      switch (searchField) {
        case 'company':
          return company.company.toLowerCase().includes(searchLower);
        case 'companyTitle':
          return company.companyTitle.toLowerCase().includes(searchLower);
        case 'companyOfficer':
          return company.companyOfficer.toLowerCase().includes(searchLower);
        case 'vkn':
          return company.vkn.toLowerCase().includes(searchLower);
        case 'approved':
          const approvalStatus = company.approved ? 'onaylandı' : 'onay bekliyor';
          return approvalStatus.includes(searchLower);
        case 'firmType':
          return company.firmType.toLowerCase().includes(searchLower);
        case 'category':
          return company.category.toLowerCase().includes(searchLower);
        case 'phone':
          return company.phone.toLowerCase().includes(searchLower);
        case 'email':
          return (company.email || '').toLowerCase().includes(searchLower);
        case 'averageRating':
          return company.averageRating.toString().includes(searchLower);
        case 'credits':
          return company.credits.toString().includes(searchLower);
        case 'all':
        default:
          return (
            company.company.toLowerCase().includes(searchLower) ||
            company.companyTitle.toLowerCase().includes(searchLower) ||
            company.companyOfficer.toLowerCase().includes(searchLower) ||
            company.vkn.toLowerCase().includes(searchLower) ||
            company.firmType.toLowerCase().includes(searchLower) ||
            company.category.toLowerCase().includes(searchLower) ||
            company.phone.toLowerCase().includes(searchLower) ||
            (company.email || '').toLowerCase().includes(searchLower) ||
            company.averageRating.toString().includes(searchLower) ||
            company.credits.toString().includes(searchLower)
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
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
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
          <option value="company">🏢 Firma Adı</option>
          <option value="companyTitle">📋 Firma Başlığı</option>
          <option value="companyOfficer">👤 Firma Yetkilisi</option>
          <option value="vkn">🏛️ VKN</option>
          <option value="firmType">🏭 Firma Türü</option>
          <option value="category">📂 Kategori</option>
          <option value="approved">✅ Onay Durumu</option>
          <option value="phone">📞 Telefon</option>
          <option value="email">📧 Kayıtlı Mail</option>
          <option value="averageRating">⭐ Ortalama Puan</option>
          <option value="credits">💰 Krediler</option>
        </select>
        
        <input
          type="text"
          placeholder={`🔍 ${searchField === 'all' ? 'Tüm alanlarda ara...' : 
            searchField === 'company' ? 'Firma adı ara...' :
            searchField === 'companyTitle' ? 'Firma başlığı ara...' :
            searchField === 'companyOfficer' ? 'Firma yetkilisi ara...' :
            searchField === 'vkn' ? 'VKN ara...' :
            searchField === 'approved' ? 'Onay durumu ara...' :
            searchField === 'firmType' ? 'Firma türü ara...' :
            searchField === 'category' ? 'Kategori ara...' :
            searchField === 'phone' ? 'Telefon ara...' :
            searchField === 'email' ? 'Kayıtlı mail ara...' :
            searchField === 'averageRating' ? 'Ortalama puan ara...' :
            searchField === 'credits' ? 'Krediler ara...' : 'Ara...'}`}
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
        <table className="companies-table" style={{ 
          width: "100%", 
          borderCollapse: "collapse", 
          backgroundColor: "white"
        }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Firma Adı</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Firma Başlığı</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Firma Yetkilisi</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>VKN</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Kayıt Tarihi</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Firma Türü</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Kategori</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Onay Durumu</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Kayıtlı Mail</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Telefon</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Ortalama Puan</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Krediler</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "12px" }}>
            {filteredCompanies.map((company) => (
              <tr key={company.id} style={{ borderBottom: "1px solid #f1f3f4", overflow: "visible" }}>
                <td style={{ padding: 12 }}>
                  <strong>{company.company}</strong>
                </td>
                <td style={{ padding: 12 }}>{company.companyTitle}</td>
                <td style={{ padding: 12 }}>{company.companyOfficer}</td>
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
                <td style={{ padding: 12 }}>
                  {company.createdAt ? new Date(company.createdAt.toDate()).toLocaleDateString('tr-TR') : "Bilinmiyor"}
                </td>
                <td style={{ padding: 12, position: "relative", overflow: "visible" }}>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={(e) => toggleFirmTypeDropdown(company.id, e)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 12,
                        fontSize: "0.8em",
                        backgroundColor: "#f3e5f5",
                        color: "#7b1fa2",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        minWidth: "100px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "4px"
                      }}
                    >
                      {company.firmType}
                      <span style={{ fontSize: "10px" }}>▼</span>
                    </button>
                    
                    {openFirmTypeDropdown === company.id && firmTypeDropdownPosition && (
                      <div 
                        data-firmtype-dropdown-container
                        style={{
                          position: "fixed",
                          top: firmTypeDropdownPosition.y,
                          left: firmTypeDropdownPosition.x,
                          backgroundColor: "white",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          zIndex: 999999,
                          minWidth: "150px",
                          padding: "6px 0"
                        }}
                      >
                        {firmTypeOptions.map((firmType) => (
                          <div
                            key={firmType}
                            data-firmtype-dropdown-container
                            style={{
                              padding: "8px 12px",
                              borderBottom: "1px solid #eee",
                              cursor: "pointer",
                              fontSize: "0.8em",
                              color: company.firmType === firmType ? "#7b1fa2" : "#666",
                              backgroundColor: company.firmType === firmType ? "#f8f9fa" : "transparent"
                            }}
                            onClick={() => handleFirmTypeChange(company.id, firmType)}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = "#f8f9fa";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = company.firmType === firmType ? "#f8f9fa" : "transparent";
                            }}
                          >
                            {firmType}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ padding: 12, position: "relative", overflow: "visible" }}>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={(e) => toggleCategoryDropdown(company.id, e)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 12,
                        fontSize: "0.8em",
                        backgroundColor: "#e9ecef",
                        color: "#495057",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        minWidth: "100px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "4px"
                      }}
                    >
                      {company.category}
                      <span style={{ fontSize: "10px" }}>▼</span>
                    </button>
                    
                    {openCategoryDropdown === company.id && categoryDropdownPosition && (
                      <div 
                        data-category-dropdown-container
                        style={{
                          position: "fixed",
                          top: categoryDropdownPosition.y,
                          left: categoryDropdownPosition.x,
                          backgroundColor: "white",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          zIndex: 999999,
                          minWidth: "150px",
                          maxHeight: "300px",
                          overflowY: "auto",
                          padding: "6px 0"
                        }}
                      >
                        {categoryOptions.map((category) => (
                          <div
                            key={category}
                            data-category-dropdown-container
                            style={{
                              padding: "8px 12px",
                              borderBottom: "1px solid #eee",
                              cursor: "pointer",
                              fontSize: "0.8em",
                              color: company.category === category ? "#495057" : "#666",
                              backgroundColor: company.category === category ? "#f8f9fa" : "transparent"
                            }}
                            onClick={() => handleCategoryChange(company.id, category)}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = "#f8f9fa";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = company.category === category ? "#f8f9fa" : "transparent";
                            }}
                          >
                            {category}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                <td style={{ padding: 12 }}>
                  <span 
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#fff3e0",
                      borderRadius: 12,
                      fontSize: "0.8em",
                      color: "#f57c00",
                      cursor: "pointer",
                      display: "inline-block",
                      transition: "all 0.3s ease"
                    }}
                    onClick={() => handleAverageRatingClick(company.id, company.company)}
                    title="Bu firmanın yorumlarını görüntülemek için tıklayın"
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#ffe0b2";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#fff3e0";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    ⭐ {company.averageRating.toFixed(1)}
                  </span>
                </td>
                <td style={{ padding: 12 }}>
                  {editingField?.companyId === company.id && editingField?.field === 'credits' ? (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        style={{
                          width: '60px',
                          padding: '4px 6px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '0.8em'
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          padding: '2px 6px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.7em'
                        }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          padding: '2px 6px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.7em'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span 
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#e8f5e8",
                        borderRadius: 12,
                        fontSize: "0.8em",
                        color: "#2e7d32",
                        cursor: "pointer",
                        display: "inline-block"
                      }}
                      onClick={() => handleEditField(company.id, 'credits', company.credits)}
                      title="Düzenlemek için tıklayın"
                    >
                      💰 {company.credits}
                    </span>
                  )}
                </td>
                <td style={{ padding: 12 }}>
                  <button
                    onClick={() => handleDeleteCompany(company.id, company.company)}
                    disabled={deletingCompany === company.id}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: deletingCompany === company.id ? "not-allowed" : "pointer",
                      fontSize: "0.8em",
                      opacity: deletingCompany === company.id ? 0.6 : 1
                    }}
                  >
                    {deletingCompany === company.id ? "Siliniyor..." : "Sil"}
                  </button>
                </td>
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
    </div>
  );
}

export default Companies; 