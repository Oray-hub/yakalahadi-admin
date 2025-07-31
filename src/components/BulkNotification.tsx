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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📢 Toplu Bildirim</h1>
          <p className="text-gray-600">Tüm kullanıcılara bildirim gönderin</p>
        </div>

        {/* Ana Kart */}
        <div className="bg-white rounded-lg shadow-md p-8">
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

            {/* Örnek Mesajlar */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">💡 Örnek Mesajlar:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div 
                  className="cursor-pointer hover:text-purple-600 transition-colors"
                  onClick={() => { setTitle("Yeni Kampanya Başladı!"); setMessage("Yeni kampanyalarımızı kaçırmayın! Hemen kontrol edin."); }}
                >
                  • "Yeni kampanyalarımızı kaçırmayın! Hemen kontrol edin."
                </div>
                <div 
                  className="cursor-pointer hover:text-purple-600 transition-colors"
                  onClick={() => { setTitle("Sistem Bakımı"); setMessage("Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz."); }}
                >
                  • "Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz."
                </div>
                <div 
                  className="cursor-pointer hover:text-purple-600 transition-colors"
                  onClick={() => { setTitle("Yeni Özellikler"); setMessage("Yeni özellikler eklendi! Uygulamayı güncelleyin."); }}
                >
                  • "Yeni özellikler eklendi! Uygulamayı güncelleyin."
                </div>
              </div>
            </div>

            {/* İpuçları */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">📋 İpuçları:</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <div>• Başlık kısa ve dikkat çekici olmalı</div>
                <div>• Mesaj net ve anlaşılır olmalı</div>
                <div>• Emoji kullanarak dikkat çekebilirsiniz</div>
                <div>• Gereksiz bildirimlerden kaçının</div>
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
      </div>
    </div>
  );
}

export default BulkNotification; 