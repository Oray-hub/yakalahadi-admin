import { useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';



function Export() {
  const [dateRanges, setDateRanges] = useState({
    users: { start: '', end: '' },
    companies: { start: '', end: '' },
    campaigns: { start: '', end: '' },
    reviews: { start: '', end: '' },
    accounting: { start: '', end: '' }
  });

  // Tarih aralığı güncelleme fonksiyonu
  const updateDateRange = (type: string, field: 'start' | 'end', value: string) => {
    setDateRanges(prev => ({
      ...prev,
      [type]: {
        ...prev[type as keyof typeof prev],
        [field]: value
      }
    }));
  };

  // Tarih filtreleme fonksiyonu
  const filterByDateRange = (data: any[], dateField: string, startDate: string, endDate: string) => {
    if (!startDate || !endDate) return data;
    
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');
    
    return data.filter(item => {
      const itemDate = item[dateField];
      if (!itemDate) return false;
      
      let date: Date;
      if (itemDate.toDate) {
        date = itemDate.toDate();
      } else if (itemDate instanceof Date) {
        date = itemDate;
      } else {
        date = new Date(itemDate);
      }
      
      return date >= start && date <= end;
    });
  };

  // Excel/CSV Export fonksiyonları
  const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Veri");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToCSV = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export fonksiyonları
  const exportToPDF = (data: any[], filename: string, title: string, columns: string[]) => {
    const doc = new jsPDF();
    
    // Başlık
    doc.setFontSize(16);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);
    
    // Tablo
    const tableData = data.map(item => {
      return columns.map(col => {
        const value = item[col];
        if (value instanceof Date) {
          return value.toLocaleDateString('tr-TR');
        }
        if (typeof value === 'boolean') {
          return value ? 'Evet' : 'Hayır';
        }
        return value || '';
      });
    });

    (doc as any).autoTable({
      head: [columns],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`${filename}.pdf`);
  };

  // Kullanıcı Export
  const exportUsers = async (format: 'excel' | 'csv' | 'pdf') => {
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
      const userQrScanned = new Map<string, boolean>();
      
      // Yeni sistem claimedCampaigns
      claimedCampaignsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;
        
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
              
          if (hasScanned) {
            userQrScanned.set(userId, true);
          }
        }
      });
      
      // Eski sistem caught_campaigns
      caughtCampaignsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;
        
        if (userId) {
          userClaimedCounts.set(userId, (userClaimedCounts.get(userId) || 0) + 1);
          
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
              
          if (hasScanned) {
            userQrScanned.set(userId, true);
          }
        }
      });
      
      const usersData: any[] = [];
      
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const userId = doc.id;
        const claimedCount = userClaimedCounts.get(userId) || 0;
        const hasQrScanned = userQrScanned.get(userId) || false;
        
        usersData.push({
          id: userId,
          email: data.email || '',
          name: data.name || data.displayName || 'Belirtilmemiş',
          createdAt: data.createdAt,
          emailVerified: data.emailVerified || false,
          notificationsStatus: data.notificationsStatus || {},
          selectedCategories: data.selectedCategories || [],
          claimedCount: claimedCount,
          privacyAccepted: data.privacyAccepted || false,
          termsAccepted: data.termsAccepted || false,
          claimedCampaigns: claimedCount,
          qrScanned: hasQrScanned
        });
      });
      
      // Tarih filtreleme uygula
      const filteredUsers = filterByDateRange(usersData, 'createdAt', dateRanges.users.start, dateRanges.users.end);
      
      const userData = filteredUsers.map((user: any) => ({
        'Kullanıcı ID': user.id,
        'Ad Soyad': user.name,
        'E-posta': user.email,
        'Kayıt Tarihi': user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString('tr-TR') : 'Belirtilmemiş',
        'E-posta Doğrulandı': user.emailVerified ? 'Evet' : 'Hayır',
        'Kategoriler': user.selectedCategories?.join(', ') || 'Belirtilmemiş',
        'Yakalanan Kampanya Sayısı': user.claimedCount || 0,
        'QR Kod Okutuldu': user.qrScanned ? 'Evet' : 'Hayır',
        'Gizlilik Kabul': user.privacyAccepted ? 'Evet' : 'Hayır',
        'Şartlar Kabul': user.termsAccepted ? 'Evet' : 'Hayır'
      }));

      if (format === 'excel') {
        exportToExcel(userData, 'Kullanıcı_Listesi');
      } else if (format === 'csv') {
        exportToCSV(userData, 'Kullanıcı_Listesi');
      } else if (format === 'pdf') {
        exportToPDF(userData, 'Kullanıcı_Listesi', 'Kullanıcı Listesi', 
          ['Kullanıcı ID', 'Ad Soyad', 'E-posta', 'Kayıt Tarihi', 'E-posta Doğrulandı', 'Kategoriler', 'Yakalanan Kampanya Sayısı', 'QR Kod Okutuldu', 'Gizlilik Kabul', 'Şartlar Kabul']);
      }
    } catch (error) {
      console.error('Kullanıcı export hatası:', error);
      alert('Kullanıcı verileri export edilirken hata oluştu!');
    }
  };

  // Firma Export
  const exportCompanies = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      const db = getFirestore();
      const companiesRef = collection(db, "companies");
      const snapshot = await getDocs(companiesRef);
      
      const companiesData: any[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        companiesData.push({
          id: doc.id,
          company: data.company || '',
          companyTitle: data.companyTitle || '',
          companyOfficer: data.companyOfficer || '',
          vkn: data.vkn || '',
          createdAt: data.createdAt,
          firmType: data.firmType || '',
          category: data.category || '',
          approved: data.approved || false,
          email: data.email || '',
          phone: data.phone || '',
          averageRating: data.averageRating || 0,
          credits: data.credits || 0,
          totalPurchasedCredits: data.totalPurchasedCredits || 0,
          creditPurchaseDate: data.creditPurchaseDate
        });
      });
      
      // Tarih filtreleme uygula
      const filteredCompanies = filterByDateRange(companiesData, 'createdAt', dateRanges.companies.start, dateRanges.companies.end);
      
      const companyData = filteredCompanies.map((company: any) => ({
        'Firma ID': company.id,
        'Firma Adı': company.company,
        'Firma Başlığı': company.companyTitle,
        'Yetkili Kişi': company.companyOfficer,
        'VKN': company.vkn,
        'Firma Türü': company.firmType,
        'Kategori': company.category,
        'Onay Durumu': company.approved ? 'Onaylı' : 'Onay Bekliyor',
        'E-posta': company.email,
        'Telefon': company.phone,
        'Ortalama Puan': company.averageRating,
        'Mevcut Kredi': company.credits,
        'Toplam Alınan Kredi': company.totalPurchasedCredits,
        'Kredi Alım Tarihi': company.creditPurchaseDate?.toDate ? company.creditPurchaseDate.toDate().toLocaleDateString('tr-TR') : 'Belirtilmemiş',
        'Kayıt Tarihi': company.createdAt?.toDate ? company.createdAt.toDate().toLocaleDateString('tr-TR') : 'Belirtilmemiş'
      }));

      if (format === 'excel') {
        exportToExcel(companyData, 'Firma_Listesi');
      } else if (format === 'csv') {
        exportToCSV(companyData, 'Firma_Listesi');
      } else if (format === 'pdf') {
        exportToPDF(companyData, 'Firma_Listesi', 'Firma Listesi', 
          ['Firma ID', 'Firma Adı', 'Firma Başlığı', 'Yetkili Kişi', 'VKN', 'Firma Türü', 'Kategori', 'Onay Durumu', 'E-posta', 'Telefon', 'Ortalama Puan', 'Mevcut Kredi', 'Toplam Alınan Kredi', 'Kredi Alım Tarihi', 'Kayıt Tarihi']);
      }
    } catch (error) {
      console.error('Firma export hatası:', error);
      alert('Firma verileri export edilirken hata oluştu!');
    }
  };

  // Kampanya Export
  const exportCampaigns = async (format: 'excel' | 'csv' | 'pdf') => {
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
      
      const campaignsData: any[] = [];
      
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
      
      // Tarih filtreleme uygula
      const filteredCampaigns = filterByDateRange(campaignsData, 'createdAt', dateRanges.campaigns.start, dateRanges.campaigns.end);
      
      const campaignData = filteredCampaigns.map((campaign: any) => {
        const now = new Date();
        const createdAt = campaign.createdAt ? new Date(campaign.createdAt.toDate()) : new Date();
        const endsAt = campaign.endsAt ? new Date(campaign.endsAt.toDate()) : new Date(createdAt.getTime() + campaign.durationMinutes * 60000);
        const isActive = campaign.isActive && now < endsAt;
        
        return {
          'Kampanya ID': campaign.id,
          'Kampanya Tipi': campaign.type,
          'Firma Adı': campaign.companyName,
          'Bildirim İçeriği': campaign.notificationBody,
          'Süre (Dakika)': campaign.durationMinutes,
          'Oluşturulma Tarihi': createdAt.toLocaleDateString('tr-TR'),
          'Bitiş Tarihi': endsAt.toLocaleDateString('tr-TR'),
          'Aktif': isActive ? 'Evet' : 'Hayır'
        };
      });

      if (format === 'excel') {
        exportToExcel(campaignData, 'Kampanya_Listesi');
      } else if (format === 'csv') {
        exportToCSV(campaignData, 'Kampanya_Listesi');
      } else if (format === 'pdf') {
        exportToPDF(campaignData, 'Kampanya_Listesi', 'Kampanya Listesi', 
          ['Kampanya ID', 'Kampanya Tipi', 'Firma Adı', 'Bildirim İçeriği', 'Süre (Dakika)', 'Oluşturulma Tarihi', 'Bitiş Tarihi', 'Aktif']);
      }
    } catch (error) {
      console.error('Kampanya export hatası:', error);
      alert('Kampanya verileri export edilirken hata oluştu!');
    }
  };

  // Yorum Export
  const exportReviews = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      const db = getFirestore();
      const reviewsData: any[] = [];
      
      // Tüm firmalar için yorumları çek
      const companiesRef = collection(db, "companies");
      const companiesSnapshot = await getDocs(companiesRef);
      
      for (const companyDoc of companiesSnapshot.docs) {
        const companyData = companyDoc.data();
        const reviewsRef = collection(db, "companies", companyDoc.id, "reviews");
        
        try {
          const reviewsSnapshot = await getDocs(reviewsRef);
          
          for (const reviewDoc of reviewsSnapshot.docs) {
            const reviewData = reviewDoc.data();
            reviewsData.push({
              id: reviewDoc.id,
              companyId: companyDoc.id,
              companyName: companyData.company || "Firma Adı Yok",
              userId: reviewData.userId || "",
              userName: reviewData.userName || "Kullanıcı Adı Yok",
              rating: reviewData.rating || 0,
              comment: reviewData.comment || "Yorum Yok",
              timestamp: reviewData.timestamp,
            });
          }
        } catch (error) {
          console.log(`Firma ${companyDoc.id} için yorumlar yüklenirken hata:`, error);
        }
      }
      
      // Tarih filtreleme uygula
      const filteredReviews = filterByDateRange(reviewsData, 'timestamp', dateRanges.reviews.start, dateRanges.reviews.end);
      
      const reviewData = filteredReviews.map((review: any) => ({
        'Yorum ID': review.id,
        'Firma ID': review.companyId,
        'Firma Adı': review.companyName,
        'Kullanıcı ID': review.userId,
        'Kullanıcı Adı': review.userName,
        'Puan': review.rating,
        'Yorum': review.comment,
        'Tarih': review.timestamp?.toDate ? review.timestamp.toDate().toLocaleDateString('tr-TR') : 'Belirtilmemiş'
      }));

      if (format === 'excel') {
        exportToExcel(reviewData, 'Yorum_Listesi');
      } else if (format === 'csv') {
        exportToCSV(reviewData, 'Yorum_Listesi');
      } else if (format === 'pdf') {
        exportToPDF(reviewData, 'Yorum_Listesi', 'Yorum Listesi', 
          ['Yorum ID', 'Firma ID', 'Firma Adı', 'Kullanıcı ID', 'Kullanıcı Adı', 'Puan', 'Yorum', 'Tarih']);
      }
    } catch (error) {
      console.error('Yorum export hatası:', error);
      alert('Yorum verileri export edilirken hata oluştu!');
    }
  };

  // Muhasebe Raporu Export
  const exportAccounting = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      const db = getFirestore();
      const companiesSnapshot = await getDocs(collection(db, "companies"));
      
      // Firmaları tarih aralığına göre filtrele
      const companies = companiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const filteredCompanies = filterByDateRange(companies, 'creditPurchaseDate', dateRanges.accounting.start, dateRanges.accounting.end);
      
      let totalCredits = 0;
      let totalEarnings = 0;
      const monthlyData: { [key: string]: { purchasedCredits: number; credits: number; earnings: number } } = {};

      for (const companyData of filteredCompanies) {
        const totalPurchasedCredits = companyData.totalPurchasedCredits || 0;
        
        if (totalPurchasedCredits > 0) {
          // Kredi fiyatlandırma
          const getCreditPrice = (creditAmount: number): number => {
            switch (creditAmount) {
              case 30: return 100;
              case 60: return 180;
              case 120: return 340;
              case 240: return 660;
              default: return 0;
            }
          };

          const calculateTotalCreditPrice = (totalCredits: number): number => {
            let remainingCredits = totalCredits;
            let totalPrice = 0;
            const creditPackages = [240, 120, 60, 30];
            
            for (const packageSize of creditPackages) {
              while (remainingCredits >= packageSize) {
                totalPrice += getCreditPrice(packageSize);
                remainingCredits -= packageSize;
              }
            }
            return totalPrice;
          };

          const creditPrice = calculateTotalCreditPrice(totalPurchasedCredits);
          totalCredits += creditPrice;
          totalEarnings += creditPrice;

          // Aylık veri
          if (companyData.creditPurchaseDate) {
            const date = companyData.creditPurchaseDate.toDate ? companyData.creditPurchaseDate.toDate() : new Date(companyData.creditPurchaseDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
              monthlyData[monthKey] = { purchasedCredits: 0, credits: 0, earnings: 0 };
            }
            monthlyData[monthKey].purchasedCredits += totalPurchasedCredits;
            monthlyData[monthKey].credits += creditPrice;
            monthlyData[monthKey].earnings += creditPrice;
          }
        }
      }

      const accountingData = [
        {
          'Toplam Alınan Kredi': Object.values(monthlyData).reduce((sum, data) => sum + data.purchasedCredits, 0),
          'Toplam Kredi Geliri (₺)': totalCredits,
          'Toplam Kazanç (₺)': totalEarnings,
          'Net Kar (₺)': totalEarnings - totalCredits
        }
      ];

      if (format === 'excel') {
        exportToExcel(accountingData, 'Muhasebe_Raporu');
      } else if (format === 'csv') {
        exportToCSV(accountingData, 'Muhasebe_Raporu');
      } else if (format === 'pdf') {
        exportToPDF(accountingData, 'Muhasebe_Raporu', 'Muhasebe Raporu', 
          ['Toplam Alınan Kredi', 'Toplam Kredi Geliri (₺)', 'Toplam Kazanç (₺)', 'Net Kar (₺)']);
      }
    } catch (error) {
      console.error('Muhasebe raporu oluşturma hatası:', error);
      alert('Muhasebe raporu oluşturulurken hata oluştu!');
    }
  };

  // Tarih aralığı bileşeni
  const DateRangeFilter = ({ type }: { type: string }) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        flexWrap: 'wrap',
        padding: '8px',
        backgroundColor: '#fff',
        borderRadius: '6px',
        border: '1px solid #dee2e6',
        fontSize: '12px'
      }}>
        <span style={{ fontWeight: '500', color: '#495057' }}>Tarih Aralığı:</span>
        
        <input
          type="date"
          value={dateRanges[type as keyof typeof dateRanges].start}
          onChange={(e) => updateDateRange(type, 'start', e.target.value)}
          style={{
            padding: '4px 8px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        />
        
        <span style={{ color: '#6c757d' }}>-</span>
        
        <input
          type="date"
          value={dateRanges[type as keyof typeof dateRanges].end}
          onChange={(e) => updateDateRange(type, 'end', e.target.value)}
          style={{
            padding: '4px 8px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        />
      </div>
    </div>
  );

  // Export butonu bileşeni
  const ExportButton = ({ label, onClick, format }: { label: string; onClick: () => void; format: string }) => (
    <button
      onClick={onClick}
      style={{
        backgroundColor: format === 'excel' ? '#217346' : format === 'csv' ? '#6c757d' : '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '12px',
        cursor: 'pointer',
        margin: '4px',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '24px' }}>
          📊 Dışa Aktar Merkezi
        </h2>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
          Verilerinizi Excel, CSV veya PDF formatında dışa aktarın.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
        maxWidth: '100%'
      }}>
        {/* Kullanıcı Export */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '18px' }}>
            👥 Kullanıcı Listesi
          </h3>
          <p style={{ color: '#666', fontSize: '14px', margin: '0 0 16px 0' }}>
            Tüm kullanıcı verilerini dışa aktarın.
          </p>
          <DateRangeFilter type="users" />
          <div>
            <ExportButton label="📊 Excel" onClick={() => exportUsers('excel')} format="excel" />
            <ExportButton label="📄 CSV" onClick={() => exportUsers('csv')} format="csv" />
            <ExportButton label="📋 PDF" onClick={() => exportUsers('pdf')} format="pdf" />
          </div>
        </div>

        {/* Firma Export */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '18px' }}>
            🏢 Firma Listesi
          </h3>
          <p style={{ color: '#666', fontSize: '14px', margin: '0 0 16px 0' }}>
            Tüm firma verilerini dışa aktarın.
          </p>
          <DateRangeFilter type="companies" />
          <div>
            <ExportButton label="📊 Excel" onClick={() => exportCompanies('excel')} format="excel" />
            <ExportButton label="📄 CSV" onClick={() => exportCompanies('csv')} format="csv" />
            <ExportButton label="📋 PDF" onClick={() => exportCompanies('pdf')} format="pdf" />
          </div>
        </div>

        {/* Kampanya Export */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '18px' }}>
            🎯 Kampanya Listesi
          </h3>
          <p style={{ color: '#666', fontSize: '14px', margin: '0 0 16px 0' }}>
            Tüm kampanya verilerini dışa aktarın.
          </p>
          <DateRangeFilter type="campaigns" />
          <div>
            <ExportButton label="📊 Excel" onClick={() => exportCampaigns('excel')} format="excel" />
            <ExportButton label="📄 CSV" onClick={() => exportCampaigns('csv')} format="csv" />
            <ExportButton label="📋 PDF" onClick={() => exportCampaigns('pdf')} format="pdf" />
          </div>
        </div>

        {/* Yorum Export */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '18px' }}>
            ⭐ Yorum Listesi
          </h3>
          <p style={{ color: '#666', fontSize: '14px', margin: '0 0 16px 0' }}>
            Tüm yorum ve puan verilerini dışa aktarın.
          </p>
          <DateRangeFilter type="reviews" />
          <div>
            <ExportButton label="📊 Excel" onClick={() => exportReviews('excel')} format="excel" />
            <ExportButton label="📄 CSV" onClick={() => exportReviews('csv')} format="csv" />
            <ExportButton label="📋 PDF" onClick={() => exportReviews('pdf')} format="pdf" />
          </div>
        </div>

        {/* Muhasebe Export */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '18px' }}>
            💰 Muhasebe Raporu
          </h3>
          <p style={{ color: '#666', fontSize: '14px', margin: '0 0 16px 0' }}>
            Kredi gelirleri ve finansal verileri dışa aktarın.
          </p>
          <DateRangeFilter type="accounting" />
          <div>
            <ExportButton label="📊 Excel" onClick={() => exportAccounting('excel')} format="excel" />
            <ExportButton label="📄 CSV" onClick={() => exportAccounting('csv')} format="csv" />
            <ExportButton label="📋 PDF" onClick={() => exportAccounting('pdf')} format="pdf" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Export; 