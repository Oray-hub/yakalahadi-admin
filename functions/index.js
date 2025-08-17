const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// SendGrid email fonksiyonunu import et
const { sendCompanyApprovalEmail } = require('./sendGridEmail');

// Toplu bildirim fonksiyonunu import et
const { sendBulkNotificationTrigger } = require('./bulkNotification');

// Firma onay bildirimi fonksiyonunu import et
const { sendCompanyApprovalNoticeTrigger } = require('./companyApproval');

// Kullanıcı bildirimi fonksiyonunu import et
const { userNotification } = require('./userNotification');

// Firma bildirimi fonksiyonunu import et
const { companyNotification } = require('./companyNotification');

// Delete user completely fonksiyonunu import et
const { deleteUserCompletely } = require('./deleteUserCompletely');

// Export the functions
exports.sendCompanyApprovalEmail = sendCompanyApprovalEmail;
exports.sendBulkNotificationTrigger = sendBulkNotificationTrigger;
exports.sendCompanyApprovalNoticeTrigger = sendCompanyApprovalNoticeTrigger;
exports.userNotification = userNotification;
exports.companyNotification = companyNotification;
exports.deleteUserCompletely = deleteUserCompletely;

