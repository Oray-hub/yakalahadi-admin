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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">📢 Toplu Bildirim</h1>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center"
            >
              <span className="mr-2">←</span>
              Geri Dön
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol Taraf - Bildirim Formu */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <span className="text-2xl mr-3">📝</span>
              <h2 className="text-xl font-bold text-gray-800">Yeni Bildirim Oluştur</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Kullanıcı Sayısı */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-blue-600 text-lg mr-3">👥</span>
                  <div>
                    <div className="text-blue-800 font-semibold">
                      Toplam {userCount} kullanıcıya bildirim gönderilecek
                    </div>
                    <div className="text-blue-600 text-sm mt-1">
                      Bu bildirim tüm kayıtlı kullanıcılara ulaşacak
                    </div>
                  </div>
                </div>
              </div>

              {/* Başlık */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Bildirim Başlığı *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Örnek: Yeni Kampanya Başladı!"
                  maxLength={100}
                  required
                />
                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                  <span>Kısa ve dikkat çekici olmalı</span>
                  <span>{title.length}/100 karakter</span>
                </div>
              </div>

              {/* Mesaj */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Bildirim Mesajı *
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Bildirim mesajınızı buraya yazın..."
                  maxLength={500}
                  required
                />
                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                  <span>Net ve anlaşılır olmalı</span>
                  <span>{message.length}/500 karakter</span>
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={isLoading}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !title.trim() || !message.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

          {/* Sağ Taraf - Yardım Kartları */}
          <div className="space-y-6">
            {/* Örnek Mesajlar */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <span className="text-xl mr-3">💡</span>
                <h3 className="text-lg font-bold text-gray-800">Örnek Mesajlar</h3>
              </div>
              <div className="space-y-3">
                <div 
                  className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                  onClick={() => { setTitle("Yeni Kampanya Başladı!"); setMessage("Yeni kampanyalarımızı kaçırmayın! Hemen kontrol edin."); }}
                >
                  <div className="flex items-center">
                    <span className="text-purple-600 mr-2">🎯</span>
                    <div>
                      <div className="font-medium text-gray-800">Kampanya Duyurusu</div>
                      <div className="text-sm text-gray-600">"Yeni kampanyalarımızı kaçırmayın! Hemen kontrol edin."</div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                  onClick={() => { setTitle("Sistem Bakımı"); setMessage("Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz."); }}
                >
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">🔧</span>
                    <div>
                      <div className="font-medium text-gray-800">Bakım Bildirimi</div>
                      <div className="text-sm text-gray-600">"Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz."</div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                  onClick={() => { setTitle("Yeni Özellikler"); setMessage("Yeni özellikler eklendi! Uygulamayı güncelleyin."); }}
                >
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✨</span>
                    <div>
                      <div className="font-medium text-gray-800">Güncelleme</div>
                      <div className="text-sm text-gray-600">"Yeni özellikler eklendi! Uygulamayı güncelleyin."</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* İpuçları */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <span className="text-xl mr-3">📋</span>
                <h3 className="text-lg font-bold text-gray-800">İpuçları</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <span className="text-xl mr-3">📊</span>
                <h3 className="text-lg font-bold text-gray-800">İstatistikler</h3>
              </div>
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