import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { NotificationService } from "../services/notificationService";

interface BulkNotificationProps {
  onClose: () => void;
}

function BulkNotification({ onClose }: BulkNotificationProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);

  // Kullanıcı sayısını al
  const fetchUserCount = async () => {
    try {
      const db = getFirestore();
      const usersSnapshot = await getDocs(collection(db, 'users'));
      setUserCount(usersSnapshot.size);
    } catch (error) {
      console.error("Kullanıcı sayısı alınırken hata:", error);
    }
  };

  // Component mount olduğunda kullanıcı sayısını al
  useEffect(() => {
    fetchUserCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      alert("Lütfen başlık ve mesaj alanlarını doldurun!");
      return;
    }

    if (userCount === 0) {
      alert("Gönderilecek kullanıcı bulunamadı!");
      return;
    }

    const confirmSend = window.confirm(
      `📢 Toplu Bildirim Gönderimi\n\n` +
      `Başlık: ${title}\n` +
      `Mesaj: ${message}\n\n` +
      `Bu bildirim ${userCount} kullanıcıya gönderilecek.\n` +
      `Devam etmek istediğinizden emin misiniz?`
    );

    if (!confirmSend) return;

    setIsLoading(true);

    try {
      const result = await NotificationService.sendBulkNotification(title, message);
      
      if (result.success) {
        alert(`✅ Toplu bildirim başarıyla gönderildi!\n\n📱 ${userCount} kullanıcıya bildirim gönderildi.`);
        setTitle("");
        setMessage("");
        onClose();
      } else {
        alert(`❌ Toplu bildirim gönderilemedi:\n${result.message}`);
      }
    } catch (error: any) {
      console.error("Toplu bildirim gönderilirken hata:", error);
      alert(`❌ Toplu bildirim gönderilirken hata oluştu:\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📢 Toplu Bildirim Sistemi</h1>
              <p className="text-gray-600 mt-2">Tüm kullanıcılara bildirim gönderin</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-lg font-bold"
            >
              ← Geri Dön
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Taraf - Bildirim Formu */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Yeni Bildirim Oluştur</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Kullanıcı Sayısı */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-blue-600 text-xl mr-3">👥</span>
                    <div>
                      <span className="text-blue-800 font-semibold text-lg">
                        Toplam {userCount} kullanıcıya bildirim gönderilecek
                      </span>
                      <p className="text-blue-600 text-sm mt-1">
                        Bu bildirim tüm kayıtlı kullanıcılara ulaşacak
                      </p>
                    </div>
                  </div>
                </div>

                {/* Başlık */}
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3">
                    📝 Bildirim Başlığı *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                    placeholder="Örnek: Yeni Kampanya Başladı!"
                    maxLength={100}
                    required
                  />
                  <div className="text-sm text-gray-500 mt-2 flex justify-between">
                    <span>Kısa ve dikkat çekici olmalı</span>
                    <span>{title.length}/100 karakter</span>
                  </div>
                </div>

                {/* Mesaj */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-3">
                    💬 Bildirim Mesajı *
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg"
                    placeholder="Bildirim mesajınızı buraya yazın..."
                    maxLength={500}
                    required
                  />
                  <div className="text-sm text-gray-500 mt-2 flex justify-between">
                    <span>Net ve anlaşılır olmalı</span>
                    <span>{message.length}/500 karakter</span>
                  </div>
                </div>

                {/* Butonlar */}
                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
                    disabled={isLoading}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !title.trim() || !message.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        📢 Toplu Bildirim Gönder
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sağ Taraf - Yardım ve Örnekler */}
          <div className="space-y-6">
            {/* Örnek Mesajlar */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                💡 Örnek Mesajlar
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => { setTitle("Yeni Kampanya Başladı!"); setMessage("Yeni kampanyalarımızı kaçırmayın! Hemen kontrol edin."); }}>
                  <div className="font-medium text-gray-800">🎯 Kampanya Duyurusu</div>
                  <div className="text-sm text-gray-600 mt-1">"Yeni kampanyalarımızı kaçırmayın! Hemen kontrol edin."</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => { setTitle("Sistem Bakımı"); setMessage("Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz."); }}>
                  <div className="font-medium text-gray-800">🔧 Bakım Bildirimi</div>
                  <div className="text-sm text-gray-600 mt-1">"Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz."</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => { setTitle("Yeni Özellikler"); setMessage("Yeni özellikler eklendi! Uygulamayı güncelleyin."); }}>
                  <div className="font-medium text-gray-800">✨ Güncelleme</div>
                  <div className="text-sm text-gray-600 mt-1">"Yeni özellikler eklendi! Uygulamayı güncelleyin."</div>
                </div>
              </div>
            </div>

            {/* İpuçları */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                📋 İpuçları
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Başlık kısa ve dikkat çekici olmalı</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Mesaj net ve anlaşılır olmalı</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Emoji kullanarak dikkat çekebilirsiniz</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Gereksiz bildirimlerden kaçının</span>
                </div>
              </div>
            </div>

            {/* İstatistikler */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                📊 İstatistikler
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Toplam Kullanıcı:</span>
                  <span className="font-bold text-purple-600">{userCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Maks. Başlık:</span>
                  <span className="font-bold text-blue-600">100 karakter</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Maks. Mesaj:</span>
                  <span className="font-bold text-blue-600">500 karakter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkNotification; 