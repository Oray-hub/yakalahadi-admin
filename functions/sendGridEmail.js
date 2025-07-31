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
        ? "✅ Yakalahadi - Firma Başvurunuz Onaylandı!" 
        : "❌ Yakalahadi - Firma Başvurunuz Onaylanmadı";
      
      const emailContent = approvalStatus === "approved" 
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🎉 Tebrikler!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Firma Başvurunuz Onaylandı</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Merhaba ${companyOfficer},</h2>
              
              <p style="color: #555; line-height: 1.6; font-size: 16px;">
                <strong>${companyName}</strong> firma başvurunuz başarıyla onaylanmıştır!
              </p>
              
              <div style="background: #e8f5e8; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3 style="color: #28a745; margin-top: 0;">✅ Onaylanan Bilgiler:</h3>
                <ul style="color: #555; margin: 10px 0;">
                  <li><strong>Firma Adı:</strong> ${companyName}</li>
                  <li><strong>VKN:</strong> ${company.vkn || 'Belirtilmemiş'}</li>
                  <li><strong>Kategori:</strong> ${company.category || 'Belirtilmemiş'}</li>
                  <li><strong>Firma Türü:</strong> ${company.firmType || 'Belirtilmemiş'}</li>
                </ul>
              </div>
              
              <p style="color: #555; line-height: 1.6; font-size: 16px;">
                Artık Yakalahadi platformunda kampanyalarınızı oluşturabilir, müşterilerinizle etkileşime geçebilir ve işletmenizi büyütebilirsiniz.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://yakalahadi.com" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  🚀 Platforma Git
                </a>
              </div>
              
              <p style="color: #777; font-size: 14px; text-align: center; margin-top: 30px;">
                Bu email Yakalahadi platformu tarafından otomatik olarak gönderilmiştir.<br>
                Sorularınız için destek@yakalahadi.com adresine yazabilirsiniz.
              </p>
            </div>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">📋 Bilgilendirme</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Firma Başvurunuz Hakkında</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Merhaba ${companyOfficer},</h2>
              
              <p style="color: #555; line-height: 1.6; font-size: 16px;">
                <strong>${companyName}</strong> firma başvurunuz incelenmiş ve onaylanmamıştır.
              </p>
              
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3 style="color: #856404; margin-top: 0;">❌ Onaylanmama Sebebi:</h3>
                <p style="color: #856404; margin: 10px 0; font-weight: bold;">
                  ${reason || "Belirtilen sebeplerden dolayı"}
                </p>
              </div>
              
              <p style="color: #555; line-height: 1.6; font-size: 16px;">
                Başvurunuzu tekrar gönderebilir veya eksik bilgileri tamamlayarak yeniden başvurabilirsiniz. 
                Sorularınız için destek ekibimizle iletişime geçebilirsiniz.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://yakalahadi.com" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  🔄 Yeniden Başvur
                </a>
              </div>
              
              <p style="color: #777; font-size: 14px; text-align: center; margin-top: 30px;">
                Bu email Yakalahadi platformu tarafından otomatik olarak gönderilmiştir.<br>
                Sorularınız için destek@yakalahadi.com adresine yazabilirsiniz.
              </p>
            </div>
          </div>
        `;
      
      const msg = {
        to: companyEmail,
        from: 'noreply@yakalahadi.com', // SendGrid verified sender
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