// Notification Service for Firebase Cloud Functions
export class NotificationService {
  // Yeni nesil Cloud Run URL'si
  private static readonly CLOUD_FUNCTION_URL = 'https://sendcompanyapprovalnotice-6uoqecqeea-ew.a.run.app';

  // Firma onay/red bildirimi gönder
  static async sendCompanyApprovalNotice(
    companyId: string, 
    approvalStatus: 'approved' | 'rejected', 
    reason?: string
  ): Promise<{ success: boolean; message: string; messageId?: string }> {
    try {
      console.log("🌐 NotificationService: Cloud Function URL:", this.CLOUD_FUNCTION_URL);
      console.log("📤 NotificationService: Gönderilecek veri:", { companyId, approvalStatus, reason });
      
      const requestBody = JSON.stringify({ companyId, approvalStatus, reason: reason || '' });
      console.log("📦 NotificationService: Request body:", requestBody);
      
      const response = await fetch(this.CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody
      });
      
      console.log("📥 NotificationService: Response status:", response.status);
      console.log("📥 NotificationService: Response ok:", response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ NotificationService: HTTP Error:", errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("✅ NotificationService: Success response:", result);
      return { success: true, message: result.message || 'Bildirim başarıyla gönderildi', messageId: result.messageId };
    } catch (error: any) {
      console.error("❌ NotificationService: Error:", error);
      console.error("❌ NotificationService: Error stack:", error.stack);
      return { success: false, message: error.message || 'Bildirim gönderilirken hata oluştu' };
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