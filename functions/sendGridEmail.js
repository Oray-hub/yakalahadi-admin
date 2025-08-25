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
      
      // Şirket yetkilisinin adını ve soyadını birleştir
      const companyOfficerName = company.companyOfficerName || '';
      const companyOfficerSurname = company.companyOfficerSurname || '';
      const companyOfficer = companyOfficerName && companyOfficerSurname 
        ? `${companyOfficerName} ${companyOfficerSurname}` 
        : (company.companyOfficer || 'Değerli Kullanıcı');
      
      if (!companyEmail) {
        console.log("⚠️ No email address found for company:", companyId);
        return null;
      }
      
      console.log("📧 Sending email to:", companyEmail);
      
      // Email içeriğini hazırla
      const emailSubject = "Firma Başvurunuz Hakkında";
      
                                                      const emailContent = approvalStatus === "approved" 
          ? `
            <!DOCTYPE html>
            <html lang="tr">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Yakalahadi - Firma Başvurunuz Onaylandı</title>
              <link href="https://fonts.googleapis.com/css2?family=Chewy&display=swap" rel="stylesheet">
              <style>
                @media only screen and (max-width: 600px) {
                  .container { width: 100% !important; }
                  .mobile-padding { padding: 15px !important; }
                }
              </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <table width="600" cellpadding="0" cellspacing="0" class="container" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px;">
                      
                      <!-- Header -->
                      <tr>
                        <td style="background-color: #8B5CF6; color: white; padding: 30px; text-align: center;">
                          <h1 style="margin: 0; font-size: 36px; font-weight: bold; color: white; font-family: 'Chewy', cursive;">YakalaHadi</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 30px;" class="mobile-padding">
                          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Merhaba ${companyOfficer},</h2>
                          
                          <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 0 5px 5px 0;">
                            <p style="color: #333; line-height: 1.6; font-size: 16px; margin: 0;">
                              <strong style="color: #000000;">${companyName}</strong> firma başvurunuz başarıyla <span style="color: #28a745; font-weight: bold;">onaylanmıştır</span>.
                            </p>
                          </div>
                          
                          <div style="background-color: #e8f5e8; border: 1px solid #28a745; border-radius: 8px; padding: 20px; margin: 25px 0;">
                            <h3 style="color: #28a745; margin: 0 0 15px 0; font-size: 18px;">Sonraki Adımlar:</h3>
                            <ul style="color: #555; line-height: 1.6; font-size: 14px; margin: 0; padding-left: 20px;">
                              <li>Hesabınıza giriş yapın</li>
                              <li>Kampanya oluşturma sayfasına gidin</li>
                              <li>İlk kampanyanızı yayınlayın</li>
                              <li>Müşterilerinizle bağlantı kurun</li>
                            </ul>
                          </div>
                          
                          <!-- Footer -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                            <tr>
                              <td style="border-top: 2px solid #eee; padding-top: 20px;">
                                <p style="color: #999; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">
                                  Bu email Yakalahadi platformu tarafından gönderilmiştir.<br>
                                  Sorularınız için: <a href="mailto:destek@yakalahadi.com" style="color: #8B5CF6; text-decoration: none;">destek@yakalahadi.com</a>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            `
                  : `
            <!DOCTYPE html>
            <html lang="tr">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Yakalahadi - Firma Başvurunuz Onaylanmadı</title>
              <link href="https://fonts.googleapis.com/css2?family=Chewy&display=swap" rel="stylesheet">
              <style>
                @media only screen and (max-width: 600px) {
                  .container { width: 100% !important; }
                  .mobile-padding { padding: 15px !important; }
                }
              </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <table width="600" cellpadding="0" cellspacing="0" class="container" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px;">
                      
                      <!-- Header -->
                      <tr>
                        <td style="background-color: #8B5CF6; color: white; padding: 30px; text-align: center;">
                          <h1 style="margin: 0; font-size: 36px; font-weight: bold; color: white; font-family: 'Chewy', cursive;">YakalaHadi</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 30px;" class="mobile-padding">
                          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Merhaba ${companyOfficer},</h2>
                          
                          <div style="background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; border-radius: 0 5px 5px 0;">
                            <p style="color: #333; line-height: 1.6; font-size: 16px; margin: 0;">
                              <strong style="color: #000000;">${companyName}</strong> firma başvurunuz <span style="color: #dc3545; font-weight: bold;">onaylanmamıştır</span>.
                            </p>
                          </div>
                          
                          <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 25px 0;">
                            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">Red Sebebi:</h3>
                            <p style="color: #856404; line-height: 1.6; font-size: 14px; margin: 0; background-color: rgba(255,255,255,0.5); padding: 12px; border-radius: 5px;">
                              <strong>${reason || "Belirtilen sebeplerden dolayı"}</strong>
                            </p>
                          </div>
                          
                          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 25px 0;">
                            <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 18px;">Yeniden Başvuru:</h3>
                            <ul style="color: #555; line-height: 1.6; font-size: 14px; margin: 0; padding-left: 20px;">
                              <li>Eksik bilgileri tamamlayın</li>
                              <li>Başvurunuzu tekrar yapın</li>
                              <li>Gerekirse Destek ekibimizle, uygulama içindeki "Bize Yazın" bölümünden iletişime geçin</li>
                            </ul>
                          </div>
                          
                          <!-- Footer -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                            <tr>
                              <td style="border-top: 2px solid #eee; padding-top: 20px;">
                                <p style="color: #999; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">
                                  Bu email Yakalahadi platformu tarafından gönderilmiştir.<br>
                                  Sorularınız için: <a href="mailto:destek@yakalahadi.com" style="color: #8B5CF6; text-decoration: none;">destek@yakalahadi.com</a>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
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