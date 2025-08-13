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
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-4xl mx-auto">
        {/* Ana Kart */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-8">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <span className="text-2xl">📢</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Toplu Bildirim</h2>
              <p className="text-gray-600 mt-1">Tüm kullanıcılara bildirim gönderin</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Kullanıcı Sayısı */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <span className="text-blue-600 text-xl">👥</span>
                </div>
                <div>
                  <div className="text-blue-800 font-semibold text-lg">
                    Toplam {userCount} kullanıcıya bildirim gönderilecek
                  </div>
                  <div className="text-blue-600 text-sm mt-1">
                    Bu bildirim tüm kayıtlı kullanıcılara ulaşacak
                  </div>
                </div>
              </div>
            </div>

            {/* Form Alanları */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sol Kolon */}
              <div className="space-y-6">
                {/* Başlık */}
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3">
                    Bildirim Başlığı *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Örnek: Yeni Kampanya Başladı!"
                    maxLength={100}
                    required
                  />
                  <div className="text-xs text-gray-500 mt-2 flex justify-between">
                    <span>Kısa ve dikkat çekici olmalı</span>
                    <span className={title.length > 80 ? "text-orange-500" : ""}>{title.length}/100 karakter</span>
                  </div>
                </div>

                {/* Mesaj */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-3">
                    Bildirim Mesajı *
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                    placeholder="Bildirim mesajınızı buraya yazın..."
                    maxLength={500}
                    required
                  />
                  <div className="text-xs text-gray-500 mt-2 flex justify-between">
                    <span>Net ve anlaşılır olmalı</span>
                    <span className={message.length > 400 ? "text-orange-500" : ""}>{message.length}/500 karakter</span>
                  </div>
                </div>
              </div>

              {/* Sağ Kolon */}
              <div className="space-y-6">
                {/* Örnek Mesajlar */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                    <span className="mr-2">💡</span>
                    Örnek Mesajlar:
                  </h4>
                  <div className="space-y-3">
                    <div 
                      className="cursor-pointer p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                      onClick={() => { setTitle("Yeni Kampanya Başladı!"); setMessage("Yeni kampanyalarımızı kaçırmayın! Hemen kontrol edin."); }}
                    >
                      <div className="font-medium text-gray-800">Yeni Kampanya</div>
                      <div className="text-sm text-gray-600">"Yeni kampanyalarımızı kaçırmayın! Hemen kontrol edin."</div>
                    </div>
                    <div 
                      className="cursor-pointer p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                      onClick={() => { setTitle("Sistem Bakımı"); setMessage("Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz."); }}
                    >
                      <div className="font-medium text-gray-800">Sistem Bakımı</div>
                      <div className="text-sm text-gray-600">"Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz."</div>
                    </div>
                    <div 
                      className="cursor-pointer p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                      onClick={() => { setTitle("Yeni Özellikler"); setMessage("Yeni özellikler eklendi! Uygulamayı güncelleyin."); }}
                    >
                      <div className="font-medium text-gray-800">Yeni Özellikler</div>
                      <div className="text-sm text-gray-600">"Yeni özellikler eklendi! Uygulamayı güncelleyin."</div>
                    </div>
                  </div>
                </div>

                {/* İpuçları */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="text-sm font-semibold text-blue-800 mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    İpuçları:
                  </h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                      Başlık kısa ve dikkat çekici olmalı
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                      Mesaj net ve anlaşılır olmalı
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                      Emoji kullanarak dikkat çekebilirsiniz
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                      Gereksiz bildirimlerden kaçının
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all font-medium"
                disabled={isLoading}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading || !title.trim() || !message.trim()}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium transition-all shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📢</span>
                    Toplu Bildirim Gönder
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