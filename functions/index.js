const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// SendGrid email fonksiyonunu import et
const { sendCompanyApprovalEmail } = require('./sendGridEmail');

// Toplu bildirim fonksiyonunu import et
const { sendBulkNotificationTrigger } = require('./bulkNotification');

// Firma onay bildirimi fonksiyonunu import et
const { sendCompanyApprovalNoticeTrigger } = require('./companyApproval');

// Export the functions
exports.sendCompanyApprovalEmail = sendCompanyApprovalEmail;
exports.sendBulkNotificationTrigger = sendBulkNotificationTrigger;
exports.sendCompanyApprovalNoticeTrigger = sendCompanyApprovalNoticeTrigger;

