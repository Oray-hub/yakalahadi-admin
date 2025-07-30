import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";

interface AccountingData {
  totalCredits: number;
  totalEarnings: number;
  totalPurchasedCreditsAmount: number;
  monthlyData: {
    month: string;
    purchasedCredits: number;
    credits: number;
    earnings: number;
    purchaseDate?: string;
  }[];
  companyData: {
    companyName: string;
    purchasedCredits: number;
    credits: number;
    earnings: number;
    purchaseDate?: string;
  }[];
}

function Accounting() {
  const [accountingData, setAccountingData] = useState<AccountingData>({
    totalCredits: 0,
    totalEarnings: 0,
    totalPurchasedCreditsAmount: 0,
    monthlyData: [],
    companyData: []
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [monthlyData, setMonthlyData] = useState<{ month: string; purchasedCredits: number; credits: number; earnings: number; purchaseDate?: string; }[]>([]);
  const [filteredMonthlyData, setFilteredMonthlyData] = useState<{ month: string; purchasedCredits: number; credits: number; earnings: number; purchaseDate?: string; }[]>([]);
  const [originalCompanyData, setOriginalCompanyData] = useState<{ companyName: string; purchasedCredits: number; credits: number; earnings: number; purchaseDate: string }[]>([]);
  const [filteredCompanyData, setFilteredCompanyData] = useState<{ companyName: string; purchasedCredits: number; credits: number; earnings: number; purchaseDate: string }[]>([]);
  const [dailyData, setDailyData] = useState<{ [key: string]: { purchasedCredits: number; credits: number; earnings: number; date: Date } }>({});

  // Kredi fiyatlandırma fonksiyonu
  const getCreditPrice = (creditAmount: number): number => {
    switch (creditAmount) {
      case 30: return 100;
      case 60: return 180;
      case 120: return 340;
      case 240: return 660;
      default: return 0;
    }
  };

  // Kredi miktarından toplam fiyat hesaplama
  const calculateTotalCreditPrice = (totalCredits: number): number => {
    let remainingCredits = totalCredits;
    let totalPrice = 0;

    // Büyük paketlerden başlayarak hesapla
    const creditPackages = [240, 120, 60, 30];
    
    for (const packageSize of creditPackages) {
      while (remainingCredits >= packageSize) {
        totalPrice += getCreditPrice(packageSize);
        remainingCredits -= packageSize;
      }
    }

    return totalPrice;
  };

  useEffect(() => {
    fetchAccountingData();
  }, []);

  const handleRefreshData = () => {
    fetchAccountingData();
  };

  const handleDateFilter = () => {
    console.log('handleDateFilter çağrıldı!');
    console.log('startDate:', startDate);
    console.log('endDate:', endDate);
    
    if (startDate && endDate) {
      console.log('Tarihler mevcut, filtreleme başlıyor...');
      
      // Tarihleri saat bilgisi olmadan karşılaştır
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59');
      
      console.log('Filtreleme tarihleri:', { startDate, endDate, start, end });
      console.log('Mevcut dailyData:', dailyData);
      console.log('Mevcut originalCompanyData:', originalCompanyData);
      
      // Günlük verilerden tarih aralığındaki verileri topla
      const filteredDailyData: { [key: string]: { purchasedCredits: number; credits: number; earnings: number; date: Date } } = {};
      
      if (Object.keys(dailyData).length > 0) {
        Object.entries(dailyData).forEach(([dayKey, data]) => {
          const dataDate = new Date(data.date);
          console.log('Kontrol edilen tarih:', dayKey, dataDate, 'Start:', start, 'End:', end);
          
          if (dataDate >= start && dataDate <= end) {
            filteredDailyData[dayKey] = data;
            console.log('Eşleşen tarih bulundu:', dayKey, data);
          }
        });
      }
      
      console.log('Filtrelenmiş günlük veriler:', filteredDailyData);
      
      // Filtrelenmiş günlük verileri aylık gruplara çevir
      const monthlyGrouped: { [key: string]: { purchasedCredits: number; credits: number; earnings: number } } = {};
      
      Object.entries(filteredDailyData).forEach(([dayKey, data]) => {
        const monthKey = dayKey.substring(0, 7); // "2025-07" formatında
        if (!monthlyGrouped[monthKey]) {
          monthlyGrouped[monthKey] = { purchasedCredits: 0, credits: 0, earnings: 0 };
        }
        monthlyGrouped[monthKey].purchasedCredits += data.purchasedCredits;
        monthlyGrouped[monthKey].credits += data.credits;
        monthlyGrouped[monthKey].earnings += data.earnings;
      });
      
      // Aylık gruplandırılmış veriyi array'e çevir
      const filteredMonthlyData = Object.entries(monthlyGrouped).map(([month, data]) => {
        // Bu ay için en son kredi alım tarihini bul
        let latestPurchaseDate = '';
        Object.entries(filteredDailyData).forEach(([dayKey, dayData]) => {
          if (dayKey.startsWith(month)) {
            const dateStr = dayData.date.toLocaleDateString('tr-TR');
            if (!latestPurchaseDate || dayData.date > new Date(latestPurchaseDate.split('.').reverse().join('-'))) {
              latestPurchaseDate = dateStr;
            }
          }
        });
        
        return {
          month,
          purchasedCredits: data.purchasedCredits,
          credits: data.credits,
          earnings: data.earnings,
          purchaseDate: latestPurchaseDate
        };
      }).sort((a, b) => b.month.localeCompare(a.month));
      
      // Firma verilerini de filtrele
      const filteredCompanyData = originalCompanyData.filter(company => {
        if (!company.purchaseDate) return false;
        
        // Tarih formatını düzelt: "28.07.2025" -> "2025-07-28"
        const dateParts = company.purchaseDate.split('.');
        if (dateParts.length !== 3) return false;
        
        const day = dateParts[0];
        const month = dateParts[1];
        const year = dateParts[2];
        const companyDate = new Date(`${year}-${month}-${day}T00:00:00`);
        
        const isInRange = companyDate >= start && companyDate <= end;
        console.log('Firma tarih kontrolü:', company.companyName, company.purchaseDate, companyDate, 'Range:', start, '-', end, 'Sonuç:', isInRange);
        return isInRange;
      });
      
      console.log('Filtrelenmiş aylık veriler:', filteredMonthlyData);
      console.log('Filtrelenmiş firma veriler:', filteredCompanyData);
      
      setFilteredMonthlyData(filteredMonthlyData);
      setFilteredCompanyData(filteredCompanyData);
    }
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilteredMonthlyData([]);
    setFilteredCompanyData([]);
  };

  const fetchAccountingData = async () => {
    try {
      const db = getFirestore();
      
      // Firmaları çek
      const companiesRef = collection(db, "companies");
      const companiesSnapshot = await getDocs(companiesRef);
      
      let totalCredits = 0;
      let totalEarnings = 0;
      let totalPurchasedCreditsAmount = 0;
      const companyDataArray: { companyName: string; purchasedCredits: number; credits: number; earnings: number; purchaseDate: string }[] = [];
      const monthlyData: { [key: string]: { purchasedCredits: number; credits: number; earnings: number } } = {};
      const newDailyData: { [key: string]: { purchasedCredits: number; credits: number; earnings: number; date: Date } } = {};

      for (const companyDoc of companiesSnapshot.docs) {
        const companyData = companyDoc.data();
        const companyName = companyData.company || "Firma Adı Yok";
        
        // Muhasebe için toplam alınan kredi miktarını al (kampanya oluşturma etkilemez)
        const totalPurchasedCredits = companyData.totalPurchasedCredits || 0;
        const currentCredits = companyData.credits || 0;
        
        // Eğer totalPurchasedCredits alanı yoksa, mevcut krediyi kullan (geriye dönük uyumluluk)
        let finalTotalCredits = totalPurchasedCredits;
        if (totalPurchasedCredits === 0 && currentCredits > 0) {
          finalTotalCredits = currentCredits;
        }
        
        if (finalTotalCredits > 0) {
          // Kredi alım tarihini al
          let purchaseDate = '';
          if (companyData.creditPurchaseDate) {
            const date = companyData.creditPurchaseDate.toDate ? companyData.creditPurchaseDate.toDate() : new Date(companyData.creditPurchaseDate);
            purchaseDate = date.toLocaleDateString('tr-TR');
          } else if (companyData.createdAt) {
            const date = companyData.createdAt.toDate ? companyData.createdAt.toDate() : new Date(companyData.createdAt);
            purchaseDate = date.toLocaleDateString('tr-TR');
          }
          
          // Toplam kredi miktarını paketlere bölerek her paketi ayrı satır olarak göster
          const creditPackages = [240, 120, 60, 30];
          let remainingCredits = finalTotalCredits;
          let processedCredits = 0;
          
          for (const packageSize of creditPackages) {
            while (remainingCredits >= packageSize) {
              const creditPrice = getCreditPrice(packageSize);
              
              totalCredits += creditPrice;
              totalEarnings += creditPrice;
              totalPurchasedCreditsAmount += packageSize;
              processedCredits += packageSize;
              
              // Her paket için ayrı satır
              companyDataArray.push({
                companyName: companyName,
                purchasedCredits: packageSize,
                credits: creditPrice,
                earnings: creditPrice,
                purchaseDate: purchaseDate
              });
              
              remainingCredits -= packageSize;
            }
          }
          
          // Kalan kredileri de ekle (eğer varsa)
          if (remainingCredits > 0) {
            const creditPrice = getCreditPrice(remainingCredits);
            
            totalCredits += creditPrice;
            totalEarnings += creditPrice;
            totalPurchasedCreditsAmount += remainingCredits;
            
            companyDataArray.push({
              companyName: companyName,
              purchasedCredits: remainingCredits,
              credits: creditPrice,
              earnings: creditPrice,
              purchaseDate: purchaseDate
            });
          }
          
          // Aylık ve günlük veri - sadece creditPurchaseDate varsa ekle
          if (companyData.creditPurchaseDate) {
            const date = companyData.creditPurchaseDate.toDate ? companyData.creditPurchaseDate.toDate() : new Date(companyData.creditPurchaseDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            console.log(`Firma ${companyName} için kredi alım tarihi:`, date, 'DayKey:', dayKey);
            
            // Aylık veri
            if (!monthlyData[monthKey]) {
              monthlyData[monthKey] = { purchasedCredits: 0, credits: 0, earnings: 0 };
            }
            monthlyData[monthKey].purchasedCredits += finalTotalCredits;
            monthlyData[monthKey].credits += calculateTotalCreditPrice(finalTotalCredits);
            monthlyData[monthKey].earnings += calculateTotalCreditPrice(finalTotalCredits);
            
            // Günlük veri - her paket için ayrı ayrı ekle
            const creditPackages = [240, 120, 60, 30];
            let remainingCreditsForDaily = finalTotalCredits;
            
            for (const packageSize of creditPackages) {
              while (remainingCreditsForDaily >= packageSize) {
                const creditPrice = getCreditPrice(packageSize);
                
                if (!newDailyData[dayKey]) {
                  newDailyData[dayKey] = { purchasedCredits: 0, credits: 0, earnings: 0, date: date };
                }
                newDailyData[dayKey].purchasedCredits += packageSize;
                newDailyData[dayKey].credits += creditPrice;
                newDailyData[dayKey].earnings += creditPrice;
                
                remainingCreditsForDaily -= packageSize;
              }
            }
            
            // Kalan kredileri de ekle
            if (remainingCreditsForDaily > 0) {
              const creditPrice = getCreditPrice(remainingCreditsForDaily);
              
              if (!newDailyData[dayKey]) {
                newDailyData[dayKey] = { purchasedCredits: 0, credits: 0, earnings: 0, date: date };
              }
              newDailyData[dayKey].purchasedCredits += remainingCreditsForDaily;
              newDailyData[dayKey].credits += creditPrice;
              newDailyData[dayKey].earnings += creditPrice;
            }
          } else {
            console.log(`Firma ${companyName} için creditPurchaseDate bulunamadı, günlük veri eklenmedi`);
          }
        }
      }

      // Aylık veriyi düzenle
      const monthlyDataArray = Object.entries(monthlyData).map(([month, data]) => {
        // Bu ay için en son kredi alım tarihini bul
        let latestPurchaseDate = '';
        Object.entries(newDailyData).forEach(([dayKey, dayData]) => {
          if (dayKey.startsWith(month)) {
            const dateStr = dayData.date.toLocaleDateString('tr-TR');
            if (!latestPurchaseDate || dayData.date > new Date(latestPurchaseDate.split('.').reverse().join('-'))) {
              latestPurchaseDate = dateStr;
            }
          }
        });
        
        return {
          month,
          purchasedCredits: data.purchasedCredits,
          credits: data.credits,
          earnings: data.earnings,
          purchaseDate: latestPurchaseDate
        };
      }).sort((a, b) => b.month.localeCompare(a.month));

      setMonthlyData(monthlyDataArray);
      setFilteredMonthlyData([]);
      setOriginalCompanyData(companyDataArray);
      setFilteredCompanyData([]);
      setDailyData(newDailyData);
      setAccountingData({
        totalCredits,
        totalEarnings,
        totalPurchasedCreditsAmount,
        monthlyData: monthlyDataArray,
        companyData: companyDataArray.sort((a, b) => b.earnings - a.earnings)
      });
      
      // State'leri güncelle - tarih filtresi için gerekli
      console.log('State güncelleme öncesi:');
      console.log('companyDataArray uzunluğu:', companyDataArray.length);
      console.log('companyDataArray örnekleri:', companyDataArray.slice(0, 2));
      
      setMonthlyData(monthlyDataArray);
      setOriginalCompanyData(companyDataArray);
      setDailyData(newDailyData);
      
      console.log('fetchAccountingData tamamlandı:');
      console.log('monthlyDataArray:', monthlyDataArray);
      console.log('companyDataArray:', companyDataArray);
      console.log('newDailyData:', newDailyData);
      
      // Filtre aktifse, verileri tekrar filtrele
      if (startDate && endDate) {
        console.log('Filtre aktif, verileri tekrar filtrele');
        setTimeout(() => {
          handleDateFilter();
        }, 100); // State güncellemesinin tamamlanmasını bekle
      }
    } catch (error) {
      console.error("Muhasebe verileri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Muhasebe verileri yükleniyor...</div>;
  }

  return (
    <div className="accounting-container" style={{
      minHeight: "100vh",
      width: "100%",
      maxWidth: "100%",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      padding: "16px"
    }}>
      {/* Sabit Başlık Kısmı */}
      <div style={{ 
        flexShrink: 0, 
        marginBottom: "12px",
        maxWidth: "100%",
        overflowX: "hidden"
      }}>
        <h1 style={{ margin: 0, color: "#333", fontSize: "19px", fontWeight: "bold" }}>Muhasebe Verileri</h1>
      </div>

      {/* Ana İstatistik Kartları */}
      <div className="accounting-stats" style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", 
        gap: "8px", 
        marginBottom: "6px",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        minWidth: 0
      }}>
        {/* Toplam Kredi Miktarı Kartı */}
        <div style={{
          backgroundColor: "#f3e5f5",
          borderRadius: "12px",
          padding: "6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #e1bee7",
          minWidth: 0,
          maxWidth: "100%",
          wordWrap: "break-word"
        }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "3px", minWidth: 0, maxWidth: "100%" }}>
            <span style={{ fontSize: "13px", marginRight: "3px", flexShrink: 0 }}>🎯</span>
            <h3 style={{ margin: 0, color: "#7b1fa2", fontSize: "13px", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>Toplam Kredi Miktarı</h3>
          </div>
          <div style={{ fontSize: "25px", fontWeight: "bold", color: "#7b1fa2", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>
            {accountingData.totalPurchasedCreditsAmount} Kredi
          </div>
        </div>

        {/* Toplam Kredi Geliri Kartı */}
        <div style={{
          backgroundColor: "#e3f2fd",
          borderRadius: "12px",
          padding: "6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #bbdefb",
          minWidth: 0,
          maxWidth: "100%",
          wordWrap: "break-word"
        }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "3px", minWidth: 0, maxWidth: "100%" }}>
            <span style={{ fontSize: "13px", marginRight: "3px", flexShrink: 0 }}>💳</span>
            <h3 style={{ margin: 0, color: "#1976d2", fontSize: "13px", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>Toplam Kredi Geliri</h3>
          </div>
          <div style={{ fontSize: "25px", fontWeight: "bold", color: "#1976d2", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>
            {accountingData.totalCredits.toLocaleString('tr-TR')} ₺
          </div>
        </div>

        {/* Toplam Kazanç Kartı */}
        <div style={{
          backgroundColor: "#e8f5e8",
          borderRadius: "12px",
          padding: "6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #c8e6c9",
          minWidth: 0,
          maxWidth: "100%",
          wordWrap: "break-word"
        }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "3px", minWidth: 0, maxWidth: "100%" }}>
            <span style={{ fontSize: "13px", marginRight: "3px", flexShrink: 0 }}>💰</span>
            <h3 style={{ margin: 0, color: "#2e7d32", fontSize: "13px", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>Toplam Kazanç</h3>
          </div>
          <div style={{ fontSize: "25px", fontWeight: "bold", color: "#2e7d32", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>
            {accountingData.totalEarnings.toLocaleString('tr-TR')} ₺
          </div>
        </div>

        {/* Net Kar Kartı */}
        <div style={{
          backgroundColor: "#fff3cd",
          borderRadius: "12px",
          padding: "6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #ffeaa7",
          minWidth: 0,
          maxWidth: "100%",
          wordWrap: "break-word"
        }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "3px", minWidth: 0, maxWidth: "100%" }}>
            <span style={{ fontSize: "13px", marginRight: "3px", flexShrink: 0 }}>📈</span>
            <h3 style={{ margin: 0, color: "#856404", fontSize: "13px", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>Net Kar</h3>
          </div>
          <div style={{ fontSize: "25px", fontWeight: "bold", color: "#856404", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>
            {(accountingData.totalEarnings - accountingData.totalCredits).toLocaleString('tr-TR')} ₺
          </div>
        </div>
      </div>

      {/* Yenile Butonu */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", marginTop: "4px", maxWidth: "100%", overflowX: "hidden" }}>
        <button
          onClick={handleRefreshData}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "6px 12px",
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#218838";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#28a745";
          }}
        >
          <span style={{ fontSize: "14px" }}>🔄</span>
          Yenile
        </button>
      </div>

      {/* Aylık Veriler */}
      {(monthlyData.length > 0 || filteredMonthlyData.length > 0) && (
        <div style={{ marginBottom: "18px", maxWidth: "100%", overflowX: "hidden" }}>
          <div style={{ marginBottom: "12px", maxWidth: "100%", overflowX: "hidden" }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "14px" }}>Kredi Gelirleri</h3>
            
            {/* Tarih Filtresi */}
            <div className="accounting-filters" style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              flexWrap: "wrap",
              padding: "8px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
              maxWidth: "100%",
              overflowX: "hidden"
            }}>
              <span style={{ fontSize: "13px", fontWeight: "500", color: "#495057" }}>Tarih Aralığı:</span>
              
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "13px"
                }}
                placeholder="Başlangıç tarihi"
              />
              
              <span style={{ fontSize: "13px", color: "#6c757d" }}>-</span>
              
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "13px"
                }}
                placeholder="Bitiş tarihi"
              />
              
              <button
                onClick={() => {
                  handleDateFilter();
                }}
                disabled={!startDate || !endDate}
                style={{
                  backgroundColor: startDate && endDate ? "#007bff" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  fontSize: "13px",
                  cursor: startDate && endDate ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if (startDate && endDate) {
                    e.currentTarget.style.backgroundColor = "#0056b3";
                  }
                }}
                onMouseLeave={(e) => {
                  if (startDate && endDate) {
                    e.currentTarget.style.backgroundColor = "#007bff";
                  }
                }}
              >
                Filtrele
              </button>
              
              <button
                onClick={handleClearFilter}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#545b62";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#6c757d";
                }}
              >
                Temizle
              </button>
            </div>
          </div>
          <div style={{ overflowX: "auto", minWidth: 0, maxWidth: "100%", marginLeft: "-8px" }}>
            <table className="accounting-table" style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", minWidth: 0, maxWidth: "100%" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6", fontSize: "13px", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>Ay</th>
                  <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6", fontSize: "13px", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>Alınan Kredi Miktarı</th>
                  <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6", fontSize: "13px", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>Kredi Geliri (₺)</th>
                  <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6", fontSize: "13px", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>Toplam Kazanç (₺)</th>
                  <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6", fontSize: "13px", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>Net Kar (₺)</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "12px" }}>
              {(startDate && endDate ? filteredMonthlyData : monthlyData).length > 0 ? (
                (startDate && endDate ? filteredMonthlyData : monthlyData).map((month, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #f1f3f4" }}>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <strong>{month.month}</strong>
                    </td>
                    <td style={{ padding: 12, textAlign: "center", fontWeight: "bold", color: "#7b1fa2" }}>
                      {month.purchasedCredits} Kredi
                    </td>
                    <td style={{ padding: 12, textAlign: "center", color: "#1976d2" }}>
                      {month.credits.toLocaleString('tr-TR')} ₺
                    </td>
                    <td style={{ padding: 12, textAlign: "center", color: "#2e7d32" }}>
                      {month.earnings.toLocaleString('tr-TR')} ₺
                    </td>
                    <td style={{ padding: 12, textAlign: "center", color: month.earnings - month.credits >= 0 ? "#2e7d32" : "#d32f2f" }}>
                      {(month.earnings - month.credits).toLocaleString('tr-TR')} ₺
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ 
                    padding: "40px 12px", 
                    textAlign: "center", 
                    color: "#666", 
                    fontSize: "15px",
                    fontStyle: "italic",
                    backgroundColor: "#f8f9fa"
                  }}>
                    {startDate && endDate ? 
                      `Bu tarihler arasında (${startDate} - ${endDate}) alınan kredi bulunamadı.` : 
                      "Henüz kredi alımı yapılmamış."
                    }
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Firma Bazında Veriler */}
      <div style={{ marginBottom: "18px", maxWidth: "100%", overflowX: "hidden" }}>
        <div style={{ marginBottom: "12px", maxWidth: "100%", overflowX: "hidden" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "14px" }}>Firma Bazında Kredi Gelirleri</h3>
        </div>
        <div style={{ overflowX: "auto", minWidth: 0, maxWidth: "100%", paddingLeft: "0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", minWidth: 0, maxWidth: "100%" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#f8f9fa" }}>
              <tr>
                <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6", fontSize: "13px", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>Firma Adı</th>
                <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6", fontSize: "13px", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>Alınan Kredi Miktarı</th>
                <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6", fontSize: "13px", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>Kredi Alım Tarihi</th>
                <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6", fontSize: "13px", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>Kredi Geliri (₺)</th>
                <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6", fontSize: "13px", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>Toplam Kazanç (₺)</th>
                <th style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #dee2e6", fontSize: "13px", minWidth: 0, maxWidth: "100%", wordWrap: "break-word" }}>Net Kar (₺)</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "12px" }}>
              {(startDate && endDate ? filteredCompanyData : accountingData.companyData).length > 0 ? (
                (startDate && endDate ? filteredCompanyData : accountingData.companyData).map((company, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #f1f3f4" }}>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <strong>{company.companyName}</strong>
                    </td>
                    <td style={{ padding: 12, textAlign: "center", fontWeight: "bold", color: "#1976d2" }}>
                      {company.purchasedCredits} Kredi
                    </td>
                    <td style={{ padding: 12, textAlign: "center", color: "#666", fontSize: "13px" }}>
                      {company.purchaseDate || "-"}
                    </td>
                    <td style={{ padding: 12, textAlign: "center", color: "#1976d2" }}>
                      {company.credits.toLocaleString('tr-TR')} ₺
                    </td>
                    <td style={{ padding: 12, textAlign: "center", color: "#2e7d32" }}>
                      {company.earnings.toLocaleString('tr-TR')} ₺
                    </td>
                    <td style={{ padding: 12, textAlign: "center", color: company.earnings - company.credits >= 0 ? "#2e7d32" : "#d32f2f" }}>
                      {(company.earnings - company.credits).toLocaleString('tr-TR')} ₺
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ 
                    padding: "40px 12px", 
                    textAlign: "center", 
                    color: "#666", 
                    fontSize: "15px",
                    fontStyle: "italic",
                    backgroundColor: "#f8f9fa"
                  }}>
                    {startDate && endDate ? 
                      `Bu tarihler arasında (${startDate} - ${endDate}) alınan kredi bulunamadı.` : 
                      "Henüz kredi alımı yapılmamış."
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Accounting; 