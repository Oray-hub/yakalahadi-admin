import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

// Notification Service for Firebase Firestore Triggers
export class NotificationService {
  // Firma onay/red bildirimi gönder - Firestore trigger ile
  static async sendCompanyApprovalNotice(companyId: string, approvalStatus: 'approved' | 'rejected', reason?: string): Promise<any> {
    try {
      console.log("📝 Creating company approval document:", { companyId, approvalStatus, reason });
      
      // Firestore'a doküman ekle - bu trigger'ı tetikleyecek
      const approvalData = {
        companyId: companyId,
        approvalStatus: approvalStatus,
        reason: reason || "",
        timestamp: new Date().toISOString(),
        processed: false
      };
      
      const docRef = await addDoc(collection(db, 'companyApprovals'), approvalData);
      
      console.log("✅ Company approval document created:", docRef.id);
      
      return {
        success: true,
        message: "Firma onay durumu güncellendi ve bildirim gönderildi",
        documentId: docRef.id
      };
      
    } catch (error) {
      console.error("❌ Company approval notification error:", error);
      throw new Error(`Bildirim gönderilemedi: ${error}`);
    }
  }

  // Toplu bildirim gönder - Firestore trigger ile
  static async sendBulkNotification(title: string, message: string): Promise<any> {
    try {
      console.log("📝 Creating bulk notification document:", { title, message });
      
      // Firestore'a doküman ekle - bu trigger'ı tetikleyecek
      const bulkNotificationData = {
        title: title,
        message: message,
        timestamp: new Date().toISOString(),
        processed: false,
        type: 'bulk_notification'
      };
      
      const docRef = await addDoc(collection(db, 'bulkNotifications'), bulkNotificationData);
      
      console.log("✅ Bulk notification document created:", docRef.id);
      
      return {
        success: true,
        message: "Toplu bildirim başarıyla gönderildi",
        documentId: docRef.id
      };
      
    } catch (error) {
      console.error("❌ Bulk notification error:", error);
      throw new Error(`Toplu bildirim gönderilemedi: ${error}`);
    }
  }

  // Bireysel veya firma bildirimi gönder - Firestore trigger ile
  static async sendIndividualNotification(title: string, message: string, email: string, type: 'individual' | 'company'): Promise<any> {
    try {
      console.log("📝 Creating individual notification document:", { title, message, email, type });
      
      // Firestore'a doküman ekle - bu trigger'ı tetikleyecek
      const individualNotificationData = {
        title: title,
        message: message,
        email: email,
        type: type,
        timestamp: new Date().toISOString(),
        processed: false,
        notificationType: type === 'individual' ? 'individual_notification' : 'company_notification'
      };
      
      const docRef = await addDoc(collection(db, 'individualNotifications'), individualNotificationData);
      
      console.log("✅ Individual notification document created:", docRef.id);
      
      return {
        success: true,
        message: type === 'individual' ? "Bireysel bildirim başarıyla gönderildi" : "Firma bildirimi başarıyla gönderildi",
        documentId: docRef.id
      };
      
    } catch (error) {
      console.error("❌ Individual notification error:", error);
      throw new Error(`${type === 'individual' ? 'Bireysel' : 'Firma'} bildirimi gönderilemedi: ${error}`);
    }
  }

  // Test bildirimi gönder
  static async sendTestNotification(
    companyId: string,
    testMessage: string = 'Test bildirimi'
  ): Promise<{ success: boolean; message: string }> {
    return this.sendCompanyApprovalNotice(companyId, 'approved', testMessage);
  }
} 