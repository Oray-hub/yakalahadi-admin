const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

// SendGrid API Key'ini environment variable'dan al
sgMail.setApiKey(functions.config().sendgrid?.key || process.env.SENDGRID_API_KEY);

// 📧 Firma onay/red email gönderme fonksiyonu - Firestore trigger v1
exports.sendCompanyApprovalEmail = functions
  .region('europe-west1')
  .runWith({
    minInstances: 0,
    maxInstances: 3000
  })
  .firestore
  .document('companyApprovals/{approvalId}')
  .onCreate(async (snap, context) => {
    try {
      console.log("📧 Company approval email event received:", context.params.approvalId);
      
      const approvalData = snap.data();
      const { companyId, approvalStatus, reason } = approvalData;
      
      if (!companyId || !approvalStatus) {
        console.log("❌ Missing parameters in approval data");
        return null;
      }
      
      console.log("🔍 Looking for company:", companyId);
      
      // Firma bilgilerini al
      const companyDoc = await admin.firestore().collection('companies').doc(companyId).get();
      
      if (!companyDoc.exists) {
        console.log("❌ Company not found:", companyId);
        return null;
      }
      
      const company = companyDoc.data();
      const companyName = company.company || company.companyTitle || "Firma";
      const companyEmail = company.email;
      const companyOfficer = company.companyOfficer || "Değerli Kullanıcı";
      
      if (!companyEmail) {
        console.log("⚠️ No email address found for company:", companyId);
        return null;
      }
      
      console.log("📧 Sending email to:", companyEmail);
      
      // Email içeriğini hazırla
      const emailSubject = approvalStatus === "approved" 
        ? "Yakalahadi - Firma Başvurunuz Onaylandı" 
        : "Yakalahadi - Firma Başvurunuz Onaylanmadı";
      
                           const emailContent = approvalStatus === "approved" 
          ? `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
              <!-- Header -->
              <div style="background: #28a745; color: white; padding: 25px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Yakalahadi</h1>
                <p style="margin: 8px 0 0 0; font-size: 16px;">Firma Başvurunuz Hakkında</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 30px 25px; background: #ffffff;">
                <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Merhaba ${companyOfficer},</h2>
                
                <p style="color: #555; line-height: 1.5; font-size: 16px; margin: 0 0 20px 0;">
                  <strong>${companyName}</strong> firma başvurunuz onaylanmıştır.
                </p>
                
                <p style="color: #555; line-height: 1.5; font-size: 16px; margin: 0 0 30px 0;">
                  Yakalahadi platformunda kampanyalarınızı oluşturabilirsiniz.
                </p>
                
                                 <!-- Button -->
                 <div style="text-align: center; margin: 30px 0;">
                   <a href="yakalahadi://mail_onay?status=approved&companyId=${companyId}" style="background: #6f42c1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                     Uygulamayı Aç
                   </a>
                 </div>
                
                <!-- Footer -->
                <p style="color: #999; font-size: 12px; text-align: center; margin: 30px 0 0 0; border-top: 1px solid #eee; padding-top: 20px;">
                  Bu email Yakalahadi platformu tarafından gönderilmiştir.<br>
                  Sorularınız için: destek@yakalahadi.com
                </p>
              </div>
            </div>
          `
         : `
           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
             <!-- Header -->
             <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 25px; text-align: center;">
               <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Yakalahadi</h1>
               <p style="margin: 8px 0 0 0; font-size: 16px;">Firma Başvurunuz Hakkında</p>
             </div>
             
             <!-- Content -->
             <div style="padding: 30px 25px; background: #ffffff;">
               <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Merhaba ${companyOfficer},</h2>
               
               <p style="color: #555; line-height: 1.5; font-size: 16px; margin: 0 0 20px 0;">
                 <strong>${companyName}</strong> firma başvurunuz incelenmiş ve onaylanmamıştır.
               </p>
               
               <p style="color: #856404; line-height: 1.5; font-size: 16px; margin: 0 0 30px 0; background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
                 <strong>Sebep:</strong> ${reason || "Belirtilen sebeplerden dolayı"}
               </p>
               
               <p style="color: #555; line-height: 1.5; font-size: 16px; margin: 0 0 30px 0;">
                 Başvurunuzu tekrar gönderebilir veya eksik bilgileri tamamlayarak yeniden başvurabilirsiniz.
               </p>
               
                               <!-- Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="yakalahadi://mail_onay?status=rejected&companyId=${companyId}&reason=${encodeURIComponent(reason || '')}" style="background: #6f42c1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                    Yeniden Başvur
                  </a>
                </div>
               
               <!-- Footer -->
               <p style="color: #999; font-size: 12px; text-align: center; margin: 30px 0 0 0; border-top: 1px solid #eee; padding-top: 20px;">
                 Bu email Yakalahadi platformu tarafından gönderilmiştir.<br>
                 Sorularınız için: destek@yakalahadi.com
               </p>
             </div>
           </div>
         `;
      
             const msg = {
         to: companyEmail,
         from: {
           email: 'noreply@yakalahadi.com',
           name: 'YakalaHadi'
         },
         subject: emailSubject,
         html: emailContent,
       };
      
      const result = await sgMail.send(msg);
      console.log("✅ Email sent successfully:", result);
      
      // Dokümanı işaretle
      await admin.firestore().collection('companyApprovals').doc(context.params.approvalId).update({
        emailSent: true,
        emailSentAt: new Date().toISOString(),
        emailMessageId: result[0]?.headers['x-message-id'] || null
      });
      
      console.log(`✅ ${companyName} için email gönderildi:`, result);
      
      return result;
      
    } catch (error) {
      console.error("❌ Email gönderilirken hata:", error);
      
      // Hata durumunda dokümanı işaretle
      try {
        await admin.firestore().collection('companyApprovals').doc(context.params.approvalId).update({
          emailSent: false,
          emailError: error.message,
          emailErrorAt: new Date().toISOString()
        });
      } catch (updateError) {
        console.error("❌ Error updating document:", updateError);
      }
      
      return null;
    }
  }); 