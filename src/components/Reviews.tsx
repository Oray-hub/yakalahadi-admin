import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";

interface Review {
  id: string;
  companyId: string;
  companyName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: any;
}

function Reviews() {
  const [searchParams] = useSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchField, setSearchField] = useState<string>('all');
  const [deletingReview, setDeletingReview] = useState<string | null>(null);
  
  // URL parametrelerini al
  const companyId = searchParams.get('companyId');
  const companyName = searchParams.get('companyName');

  useEffect(() => {
    fetchReviews();
  }, [companyId, companyName]);

  const fetchReviews = async () => {
    try {
      const db = getFirestore();
      const reviewsData: Review[] = [];
      
      if (companyId) {
        // Belirli bir firma için yorumları çek
        const reviewsRef = collection(db, "companies", companyId, "reviews");
        const reviewsSnapshot = await getDocs(reviewsRef);
        
        for (const reviewDoc of reviewsSnapshot.docs) {
          const reviewData = reviewDoc.data();
          reviewsData.push({
            id: reviewDoc.id,
            companyId: companyId,
            companyName: companyName || "Firma Adı Yok",
            userId: reviewData.userId || "",
            userName: reviewData.userName || "Kullanıcı Adı Yok",
            rating: reviewData.rating || 0,
            comment: reviewData.comment || "Yorum Yok",
            timestamp: reviewData.timestamp,
          });
        }
      } else {
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
      }
      
      setReviews(reviewsData);
    } catch (error) {
      console.error("Yorumlar yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteReview = async (reviewId: string, companyName: string, companyId: string) => {
    if (window.confirm(`${companyName} için yapılan yorumu silmek istediğinizden emin misiniz?`)) {
      setDeletingReview(reviewId);
      try {
        const db = getFirestore();
        
        // Yorumu sil
        await deleteDoc(doc(db, "companies", companyId, "reviews", reviewId));
        
        // Firma yıldızlarını yeniden hesapla
        await recalculateCompanyRating(companyId);
        
        // UI'dan yorumu kaldır
        setReviews(reviews.filter(review => review.id !== reviewId));
        alert("Yorum başarıyla silindi ve firma puanı güncellendi.");
      } catch (error) {
        console.error("Yorum silinirken hata:", error);
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        alert(`Yorum silinirken bir hata oluştu: ${errorMessage}`);
      } finally {
        setDeletingReview(null);
      }
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
      
      // Tüm yorumların puanlarını topla
      reviewsSnapshot.forEach((doc) => {
        const reviewData = doc.data();
        if (reviewData.rating && typeof reviewData.rating === 'number') {
          totalRating += reviewData.rating;
          reviewCount++;
        }
      });
      
      // Ortalama puanı hesapla (hiç yorum yoksa 0)
      const averageRating = 0;
      
      // Firma dokümanını güncelle - hiç yorum yoksa sıfırla
      const companyRef = doc(db, "companies", companyId);
      await updateDoc(companyRef, {
        averageRating: averageRating,
        ratingCount: reviewCount,
        totalScore: totalRating
      });
    } catch (error) {
      console.error("Firma puanı güncellenirken hata:", error);
    }
  };

  // İstatistik hesaplama fonksiyonu
  const calculateReviewStats = () => {
    let totalReviews = reviews.length;
    let totalComments = 0;
    let totalNoComments = 0;

    reviews.forEach(review => {
      if (review.comment && review.comment.trim() !== "" && review.comment !== "Yorum Yok") {
        totalComments++;
      } else {
        totalNoComments++;
      }
    });

    return {
      totalReviews,
      totalComments,
      totalNoComments
    };
  };

  const stats = calculateReviewStats();

  const filteredReviews = reviews.filter(review => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Seçili alana göre arama yap
    switch (searchField) {
      case 'companyName':
        return review.companyName.toLowerCase().includes(searchLower);
      case 'userName':
        return review.userName.toLowerCase().includes(searchLower);
      case 'comment':
        return review.comment.toLowerCase().includes(searchLower);
      case 'rating':
        return review.rating.toString().includes(searchLower);
      case 'all':
      default:
        return (
          review.companyName.toLowerCase().includes(searchLower) ||
          review.userName.toLowerCase().includes(searchLower) ||
          review.comment.toLowerCase().includes(searchLower) ||
          review.rating.toString().includes(searchLower)
        );
    }
  });

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? "#ffc107" : "#e4e5e9", fontSize: "16px" }}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Yorumlar yükleniyor...</div>;
  }

    return (
    <div className="reviews-container" style={{
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
          Yorumlar ve Puanlar
        </h1>
      </div>

      {/* Sabit İstatistik Kartları */}
      <div style={{ 
        flexShrink: 0, 
        marginBottom: "16px",
        width: "100%"
      }}>
        <div className="reviews-stats" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "12px", 
          marginBottom: "6px",
          width: "100%"
        }}>
          {/* Toplam Yorum Kartı */}
          <div style={{
            backgroundColor: "#e3f2fd",
            borderRadius: "6px",
            padding: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #bbdefb"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", marginRight: "4px" }}>💬</span>
              <h3 style={{ margin: 0, color: "#1976d2", fontSize: "13px" }}>Toplam Yorum</h3>
            </div>
            <div style={{ fontSize: "25px", fontWeight: "bold", color: "#1976d2", marginBottom: "2px" }}>
              {stats.totalReviews}
            </div>
            <div style={{ display: "flex", gap: "8px", fontSize: "12px" }}>
              <span style={{ color: "#1976d2" }}>
                ⭐ {reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "0.0"} Ortalama Puan
              </span>
            </div>
          </div>

          {/* Yorumlu Değerlendirme Kartı */}
          <div style={{
            backgroundColor: "#e8f5e8",
            borderRadius: "6px",
            padding: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #c8e6c9"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", marginRight: "4px" }}>✍️</span>
              <h3 style={{ margin: 0, color: "#2e7d32", fontSize: "13px" }}>Yorumlu Değerlendirme</h3>
            </div>
            <div style={{ fontSize: "25px", fontWeight: "bold", color: "#2e7d32", marginBottom: "2px" }}>
              {stats.totalComments}
            </div>
            <div style={{ display: "flex", gap: "8px", fontSize: "12px" }}>
              <span style={{ color: "#2e7d32" }}>
                ✅ {stats.totalComments} Yorumlu
              </span>
              <span style={{ color: "#f57c00" }}>
                ❌ {stats.totalNoComments} Yorumsuz
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sabit Filtre Kısmı */}
      <div className="reviews-filters" style={{
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
          <option value="companyName">🏢 Firma Adı</option>
          <option value="userName">👤 Kullanıcı Adı</option>
          <option value="comment">💬 Yorum</option>
          <option value="rating">⭐ Puan</option>
        </select>
        
        <input
          type="text"
          placeholder={`🔍 ${searchField === 'all' ? 'Tüm alanlarda ara...' : 
            searchField === 'companyName' ? 'Firma adı ara...' :
            searchField === 'userName' ? 'Kullanıcı adı ara...' :
            searchField === 'comment' ? 'Yorum ara...' :
            searchField === 'rating' ? 'Puan ara...' : 'Ara...'}`}
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
        <table className="reviews-table" style={{ 
          width: "100%", 
          borderCollapse: "collapse", 
          backgroundColor: "white"
        }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Firma Adı</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Kullanıcı Adı</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Puan</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Yorum</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>Tarih</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #dee2e6", fontSize: "13px" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "12px" }}>
            {filteredReviews.map((review) => (
              <tr key={review.id} style={{ borderBottom: "1px solid #f1f3f4", overflow: "visible" }}>
                <td style={{ padding: 12 }}>
                  <strong>{review.companyName}</strong>
                </td>
                                 <td style={{ padding: 12 }}>
                   <span style={{
                     padding: "4px 8px",
                     backgroundColor: "#e8f4fd",
                     borderRadius: 12,
                     fontSize: "0.8em",
                     color: "#0d6efd"
                   }}>
                     {review.userName}
                   </span>
                 </td>
                <td style={{ padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {renderStars(review.rating)}
                    <span style={{ marginLeft: "8px", fontSize: "0.9em", color: "#666" }}>
                      ({review.rating}/5)
                    </span>
                  </div>
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
                    {review.comment}
                  </div>
                </td>
                                 <td style={{ padding: 12 }}>
                   {review.timestamp ? new Date(review.timestamp.toDate()).toLocaleDateString('tr-TR') : "Bilinmiyor"}
                 </td>
                                  <td style={{ padding: 12 }}>
                   <button
                     onClick={() => handleDeleteReview(review.id, review.companyName, review.companyId)}
                     disabled={deletingReview === review.id}
                     style={{
                       padding: "6px 12px",
                       backgroundColor: "#dc3545",
                       color: "white",
                       border: "none",
                       borderRadius: 4,
                       cursor: deletingReview === review.id ? "not-allowed" : "pointer",
                       fontSize: "0.8em",
                       opacity: deletingReview === review.id ? 0.6 : 1
                     }}
                   >
                     {deletingReview === review.id ? "Siliniyor..." : "Sil"}
                   </button>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredReviews.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
          Henüz yorum bulunmuyor.
        </div>
      )}
    </div>
  );
}

export default Reviews; 