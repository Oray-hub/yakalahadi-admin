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
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
      <div className="max-w-6xl mx-auto">
        {/* Ana Kart - Yeni Tasarım */}
        <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
          <div className="flex items-center mb-10">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-2xl mr-6">
              <span className="text-3xl">📢</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Toplu Bildirim</h2>
              <p className="text-gray-600 text-lg">Tüm kullanıcılara bildirim gönderin</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Kullanıcı Sayısı - Yeni Tasarım */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-4 rounded-2xl mr-6">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <div className="text-white font-bold text-2xl mb-2">
                    Toplam {userCount} kullanıcıya bildirim gönderilecek
                  </div>
                  <div className="text-blue-100 text-lg">
                    Bu bildirim tüm kayıtlı kullanıcılara ulaşacak
                  </div>
                </div>
              </div>
            </div>

            {/* Form Alanları - Yeni Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              {/* Sol Kolon */}
              <div className="space-y-8">
                {/* Başlık */}
                <div>
                  <label htmlFor="title" className="block text-lg font-bold text-gray-700 mb-4">
                    Bildirim Başlığı *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all text-lg"
                    placeholder="Örnek: Yeni Kampanya Başladı!"
                    maxLength={100}
                    required
                  />
                  <div className="text-sm text-gray-500 mt-3 flex justify-between">
                    <span>Kısa ve dikkat çekici olmalı</span>
                    <span className={title.length > 80 ? "text-orange-500 font-bold" : ""}>{title.length}/100 karakter</span>
                  </div>
                </div>

                {/* Mesaj */}
                <div>
                  <label htmlFor="message" className="block text-lg font-bold text-gray-700 mb-4">
                    Bildirim Mesajı *
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={10}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 resize-none transition-all text-lg"
                    placeholder="Bildirim mesajınızı buraya yazın..."
                    maxLength={500}
                    required
                  />
                  <div className="text-sm text-gray-500 mt-3 flex justify-between">
                    <span>Net ve anlaşılır olmalı</span>
                    <span className={message.length > 400 ? "text-orange-500 font-bold" : ""}>{message.length}/500 karakter</span>
                  </div>
                </div>
              </div>

              {/* Sağ Kolon */}
              <div className="space-y-8">
                {/* Örnek Mesajlar - Yeni Tasarım */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-8">
                  <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <span className="mr-3 text-2xl">💡</span>
                    Örnek Mesajlar:
                  </h4>
                  <div className="space-y-4">
                    <div 
                      className="cursor-pointer p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all shadow-sm hover:shadow-md"
                      onClick={() => { setTitle("Yeni Kampanya Başladı!"); setMessage("Yeni kampanyalarımızı kaçırmayın! Hemen kontrol edin."); }}
                    >
                      <div className="font-bold text-gray-800 text-lg mb-2">Yeni Kampanya</div>
                      <div className="text-gray-600">"Yeni kampanyalarımızı kaçırmayın! Hemen kontrol edin."</div>
                    </div>
                    <div 
                      className="cursor-pointer p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all shadow-sm hover:shadow-md"
                      onClick={() => { setTitle("Sistem Bakımı"); setMessage("Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz."); }}
                    >
                      <div className="font-bold text-gray-800 text-lg mb-2">Sistem Bakımı</div>
                      <div className="text-gray-600">"Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz."</div>
                    </div>
                    <div 
                      className="cursor-pointer p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all shadow-sm hover:shadow-md"
                      onClick={() => { setTitle("Yeni Özellikler"); setMessage("Yeni özellikler eklendi! Uygulamayı güncelleyin."); }}
                    >
                      <div className="font-bold text-gray-800 text-lg mb-2">Yeni Özellikler</div>
                      <div className="text-gray-600">"Yeni özellikler eklendi! Uygulamayı güncelleyin."</div>
                    </div>
                  </div>
                </div>

                {/* İpuçları - Yeni Tasarım */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-8 shadow-lg">
                  <h4 className="text-lg font-bold text-white mb-6 flex items-center">
                    <span className="mr-3 text-2xl">📋</span>
                    İpuçları:
                  </h4>
                  <div className="space-y-4 text-lg">
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-white rounded-full mr-4"></span>
                      Başlık kısa ve dikkat çekici olmalı
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-white rounded-full mr-4"></span>
                      Mesaj net ve anlaşılır olmalı
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-white rounded-full mr-4"></span>
                      Emoji kullanarak dikkat çekebilirsiniz
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-white rounded-full mr-4"></span>
                      Gereksiz bildirimlerden kaçının
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Butonlar - Yeni Tasarım */}
            <div className="flex justify-end space-x-6 pt-8 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-10 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading || !title.trim() || !message.trim()}
                className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-bold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <span className="mr-3 text-2xl">📢</span>
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