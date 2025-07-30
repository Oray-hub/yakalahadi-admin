import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: any;
  emailVerified: boolean;
  selectedCategories: string[];
  claimedCount?: number;
  privacyAccepted?: boolean;
  termsAccepted?: boolean;
  claimedCampaigns?: number;
  qrScanned?: boolean;
}

interface Company {
  id: string;
  company: string;
  category: string;
  approved: boolean;
  credits: number;
  totalPurchasedCredits: number;
  creditPurchaseDate?: any;
  createdAt: any;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  category: string;
  credits: number;
  maxClaims: number;
  currentClaims: number;
  startDate: any;
  endDate: any;
  active: boolean;
  createdAt: any;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  companyId: string;
  companyName: string;
  rating: number;
  comment: string;
  createdAt: any;
}



function Export() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});
  const [dateRanges, setDateRanges] = useState({
    users: { start: '', end: '' },
    companies: { start: '', end: '' },
    campaigns: { start: '', end: '' },
    reviews: { start: '', end: '' },
    accounting: { start: '', end: '' }
  });

  // Verileri yükle
  const loadData = async () => {
    setLoading(true);
    try {
      const db = getFirestore();
      
      // Kullanıcıları yükle
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Firmaları yükle
      const companiesSnapshot = await getDocs(collection(db, "companies"));
      const companies = companiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Kampanyaları yükle
      const campaignsSnapshot = await getDocs(collection(db, "campaigns"));
      const campaigns = campaignsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Yorumları yükle
      const reviewsSnapshot = await getDocs(collection(db, "reviews"));
      const reviews = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setData({ users, companies, campaigns, reviews });
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Veri yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
  const exportUsers = (format: 'excel' | 'csv' | 'pdf') => {
    const filteredUsers = filterByDateRange(data.users || [], 'createdAt', dateRanges.users.start, dateRanges.users.end);
    const userData = filteredUsers.map((user: User) => ({
      'Kullanıcı ID': user.id,
      'Ad Soyad': user.name || 'Belirtilmemiş',
      'E-posta': user.email,
      'Kayıt Tarihi': user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString('tr-TR') : 'Belirtilmemiş',
      'E-posta Doğrulandı': user.emailVerified ? 'Evet' : 'Hayır',
      'Kategoriler': user.selectedCategories?.join(', ') || 'Belirtilmemiş',
      'Yakalanan Kampanya Sayısı': user.claimedCount || 0,
      'Gizlilik Kabul': user.privacyAccepted ? 'Evet' : 'Hayır',
      'Şartlar Kabul': user.termsAccepted ? 'Evet' : 'Hayır'
    })) || [];

    if (format === 'excel') {
      exportToExcel(userData, 'Kullanıcı_Listesi');
    } else if (format === 'csv') {
      exportToCSV(userData, 'Kullanıcı_Listesi');
    } else if (format === 'pdf') {
      exportToPDF(userData, 'Kullanıcı_Listesi', 'Kullanıcı Listesi', 
        ['Kullanıcı ID', 'Ad Soyad', 'E-posta', 'Kayıt Tarihi', 'E-posta Doğrulandı', 'Kategoriler', 'Yakalanan Kampanya Sayısı']);
    }
  };

  // Firma Export
  const exportCompanies = (format: 'excel' | 'csv' | 'pdf') => {
    const filteredCompanies = filterByDateRange(data.companies || [], 'createdAt', dateRanges.companies.start, dateRanges.companies.end);
    const companyData = filteredCompanies.map((company: Company) => ({
      'Firma ID': company.id,
      'Firma Adı': company.company,
      'Kategori': company.category,
      'Onay Durumu': company.approved ? 'Onaylı' : 'Onay Bekliyor',
      'Mevcut Kredi': company.credits || 0,
      'Toplam Alınan Kredi': company.totalPurchasedCredits || 0,
      'Kredi Alım Tarihi': company.creditPurchaseDate?.toDate ? company.creditPurchaseDate.toDate().toLocaleDateString('tr-TR') : 'Belirtilmemiş',
      'Kayıt Tarihi': company.createdAt?.toDate ? company.createdAt.toDate().toLocaleDateString('tr-TR') : 'Belirtilmemiş'
    })) || [];

    if (format === 'excel') {
      exportToExcel(companyData, 'Firma_Listesi');
    } else if (format === 'csv') {
      exportToCSV(companyData, 'Firma_Listesi');
    } else if (format === 'pdf') {
      exportToPDF(companyData, 'Firma_Listesi', 'Firma Listesi', 
        ['Firma ID', 'Firma Adı', 'Kategori', 'Onay Durumu', 'Mevcut Kredi', 'Toplam Alınan Kredi', 'Kredi Alım Tarihi']);
    }
  };

  // Kampanya Export
  const exportCampaigns = (format: 'excel' | 'csv' | 'pdf') => {
    const filteredCampaigns = filterByDateRange(data.campaigns || [], 'createdAt', dateRanges.campaigns.start, dateRanges.campaigns.end);
    const campaignData = filteredCampaigns.map((campaign: Campaign) => ({
      'Kampanya ID': campaign.id,
      'Başlık': campaign.title,
      'Açıklama': campaign.description,
      'Firma Adı': campaign.companyName,
      'Kategori': campaign.category,
      'Kredi Miktarı': campaign.credits,
      'Maksimum Yakalama': campaign.maxClaims,
      'Mevcut Yakalama': campaign.currentClaims || 0,
      'Başlangıç Tarihi': campaign.startDate?.toDate ? campaign.startDate.toDate().toLocaleDateString('tr-TR') : 'Belirtilmemiş',
      'Bitiş Tarihi': campaign.endDate?.toDate ? campaign.endDate.toDate().toLocaleDateString('tr-TR') : 'Belirtilmemiş',
      'Aktif': campaign.active ? 'Evet' : 'Hayır',
      'Oluşturulma Tarihi': campaign.createdAt?.toDate ? campaign.createdAt.toDate().toLocaleDateString('tr-TR') : 'Belirtilmemiş'
    })) || [];

    if (format === 'excel') {
      exportToExcel(campaignData, 'Kampanya_Listesi');
    } else if (format === 'csv') {
      exportToCSV(campaignData, 'Kampanya_Listesi');
    } else if (format === 'pdf') {
      exportToPDF(campaignData, 'Kampanya_Listesi', 'Kampanya Listesi', 
        ['Kampanya ID', 'Başlık', 'Firma Adı', 'Kategori', 'Kredi Miktarı', 'Maksimum Yakalama', 'Mevcut Yakalama', 'Aktif']);
    }
  };

  // Yorum Export
  const exportReviews = (format: 'excel' | 'csv' | 'pdf') => {
    const filteredReviews = filterByDateRange(data.reviews || [], 'createdAt', dateRanges.reviews.start, dateRanges.reviews.end);
    const reviewData = filteredReviews.map((review: Review) => ({
      'Yorum ID': review.id,
      'Kullanıcı Adı': review.userName,
      'Firma Adı': review.companyName,
      'Puan': review.rating,
      'Yorum': review.comment,
      'Tarih': review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('tr-TR') : 'Belirtilmemiş'
    })) || [];

    if (format === 'excel') {
      exportToExcel(reviewData, 'Yorum_Listesi');
    } else if (format === 'csv') {
      exportToCSV(reviewData, 'Yorum_Listesi');
    } else if (format === 'pdf') {
      exportToPDF(reviewData, 'Yorum_Listesi', 'Yorum Listesi', 
        ['Yorum ID', 'Kullanıcı Adı', 'Firma Adı', 'Puan', 'Yorum', 'Tarih']);
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

      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          fontSize: '16px'
        }}>
          Veriler yükleniyor...
        </div>
      )}

             {!loading && (
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
      )}

      {/* Yenile Butonu */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <button
          onClick={loadData}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0056b3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#007bff';
          }}
        >
          🔄 Verileri Yenile
        </button>
      </div>
    </div>
  );
}

export default Export; 