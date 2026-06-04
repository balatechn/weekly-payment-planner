const { Payment, Entity, EmailLog, EmailRecipient } = require('../models');
const emailTransporter = require('../config/email');
const { Op } = require('sequelize');

const emailService = {
  // Generate weekly payment schedule HTML
  generateWeeklyScheduleHTML: (payments, weekStartDate, weekEndDate) => {
    const formatDate = (date) => {
      const d = new Date(date);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const formatCurrency = (amount) => {
      return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
    };

    let tableRows = '';
    let totalAmount = 0;

    payments.forEach((payment, index) => {
      totalAmount += parseFloat(payment.totalAmount);
      
      const statusColors = {
        submitted: '#F59E0B', under_review: '#3B82F6', approved: '#10B981'
      };
      const statusLabels = {
        submitted: 'Submitted', under_review: 'Under Review', approved: 'Approved'
      };
      const statusColor = statusColors[payment.status] || '#6B7280';
      const statusLabel = statusLabels[payment.status] || payment.status;

      tableRows += `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 8px; text-align: center;">${index + 1}</td>
          <td style="padding: 12px 8px;">${payment.entity.name}</td>
          <td style="padding: 12px 8px;">${payment.vendorName}</td>
          <td style="padding: 12px 8px;">${payment.natureOfExpense}</td>
          <td style="padding: 12px 8px;">${payment.invoiceNumber} / ${formatDate(payment.invoiceDate)}</td>
          <td style="padding: 12px 8px; text-align: right;">${formatCurrency(payment.totalAmount)}</td>
          <td style="padding: 12px 8px; text-align: center;">${formatDate(payment.dueDate)}</td>
          <td style="padding: 12px 8px;">${payment.paymentTerms}</td>
          <td style="padding: 12px 8px; text-align: center;">
            <span style="background:${statusColor}20;color:${statusColor};padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600;">${statusLabel}</span>
          </td>
          <td style="padding: 12px 8px;">${payment.remarks || '-'}</td>
        </tr>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background: white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th {
              background-color: #1e3a8a;
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: 600;
            }
            .total-row {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <p>Dear Team,</p>
            <p>Please find below the list of payments required for the week.</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: center;">Sr No</th>
                <th>Entity</th>
                <th>Vendor / Payee Name</th>
                <th>Nature of Expense</th>
                <th>Invoice No & Date</th>
                <th style="text-align: right;">Invoice Amount (Incl GST)</th>
                <th style="text-align: center;">Due Date</th>
                <th>Payment Terms</th>
                <th style="text-align: center;">Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr class="total-row">
                <td colspan="5" style="padding: 12px 8px; text-align: right;"><strong>Total Amount:</strong></td>
                <td style="padding: 12px 8px; text-align: right;"><strong>${formatCurrency(totalAmount)}</strong></td>
                <td colspan="3"></td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Regards,<br>Finance Team</p>
          </div>
        </body>
      </html>
    `;
  },

  // Send weekly payment schedule
  sendWeeklySchedule: async () => {
    try {
      // Get current week info
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
      const weekStartDate = new Date(now.setDate(diff));
      weekStartDate.setHours(0, 0, 0, 0);
      
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);
      weekEndDate.setHours(23, 59, 59, 999);

      // Get week number
      const onejan = new Date(weekStartDate.getFullYear(), 0, 1);
      const weekNumber = Math.ceil((((weekStartDate - onejan) / 86400000) + onejan.getDay() + 1) / 7);
      const weekYear = weekStartDate.getFullYear();

      // Get all pending payments (submitted, under_review, approved) — not yet paid or rejected
      const payments = await Payment.findAll({
        where: {
          status: { [Op.in]: ['submitted', 'under_review', 'approved'] }
        },
        include: [
          { model: Entity, as: 'entity' }
        ],
        order: [['dueDate', 'ASC']]
      });

      if (payments.length === 0) {
        console.log('No pending payments to send');
        return { success: true, message: 'No pending payments to send' };
      }

      // Generate email HTML
      const emailHTML = emailService.generateWeeklyScheduleHTML(
        payments,
        weekStartDate,
        weekEndDate
      );

      // Get recipients
      const recipients = await EmailRecipient.findAll({
        where: { isActive: true }
      });

      const recipientEmails = recipients.map(r => r.email).join(',');

      if (!recipientEmails) {
        throw new Error('No active email recipients configured');
      }

      // Format subject
      const formatDate = (date) => {
        const d = new Date(date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
      };

      const subject = `Weekly Pending Payment Schedule – ${formatDate(weekStartDate)} to ${formatDate(weekEndDate)}`;

      // Send email
      const info = await emailTransporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: recipientEmails,
        subject: subject,
        html: emailHTML
      });

      // Calculate total amount
      const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0);

      // Log email
      await EmailLog.create({
        subject,
        recipients: recipientEmails,
        body: emailHTML,
        weekNumber,
        weekYear,
        weekStartDate,
        weekEndDate,
        totalAmount,
        paymentCount: payments.length,
        status: 'sent',
        sentAt: new Date()
      });

      console.log('✅ Weekly payment schedule email sent:', info.messageId);

      return {
        success: true,
        message: 'Email sent successfully',
        paymentCount: payments.length,
        totalAmount
      };
    } catch (error) {
      console.error('❌ Send weekly schedule error:', error);

      // Log failed email
      try {
        await EmailLog.create({
          subject: 'Weekly Payment Schedule',
          recipients: '',
          body: '',
          status: 'failed',
          error: error.message,
          sentAt: new Date()
        });
      } catch (logError) {
        console.error('Failed to log email error:', logError);
      }

      throw error;
    }
  },

  // Send custom email
  sendCustomEmail: async (recipients, subject, payments, weekStartDate, weekEndDate) => {
    try {
      const emailHTML = emailService.generateWeeklyScheduleHTML(
        payments,
        weekStartDate,
        weekEndDate
      );

      const info = await emailTransporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: recipients,
        subject: subject,
        html: emailHTML
      });

      const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0);

      await EmailLog.create({
        subject,
        recipients,
        body: emailHTML,
        weekStartDate,
        weekEndDate,
        totalAmount,
        paymentCount: payments.length,
        status: 'sent',
        sentAt: new Date()
      });

      return {
        success: true,
        message: 'Email sent successfully',
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Send custom email error:', error);
      
      await EmailLog.create({
        subject,
        recipients,
        body: '',
        status: 'failed',
        error: error.message,
        sentAt: new Date()
      });

      throw error;
    }
  },

  // Send individual payment submission notification (with invoice attachment)
  sendPaymentNotification: async (payment) => {
    try {
      const recipients = await EmailRecipient.findAll({ where: { isActive: true } });
      if (recipients.length === 0) {
        console.log('No active recipients — skipping payment notification');
        return;
      }

      const recipientEmails = recipients.map(r => r.email).join(',');

      const formatDate = (date) => {
        const d = new Date(date);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
      };
      const formatCurrency = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN')}`;

      const subject = `New Payment Request – ${payment.vendorName} – ${formatCurrency(payment.totalAmount)}`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1E3A8A, #2563EB); color: white; padding: 24px; border-radius: 12px 12px 0 0; }
          .header h2 { margin: 0; font-size: 20px; }
          .header p { margin: 6px 0 0; opacity: 0.8; font-size: 13px; }
          .body { background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px; }
          .field { display: flex; margin-bottom: 12px; }
          .label { width: 160px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; padding-top: 2px; }
          .value { flex: 1; font-size: 14px; font-weight: 500; color: #1e293b; }
          .amount-box { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
          .total { font-size: 22px; font-weight: 700; color: #1E3A8A; }
          .badge { display: inline-block; background: #FEF3C7; color: #D97706; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .footer { margin-top: 20px; font-size: 12px; color: #94a3b8; }
        </style>
        </head>
        <body>
          <div class="header">
            <h2>📋 New Payment Request Submitted</h2>
            <p>Requires your attention and approval</p>
          </div>
          <div class="body">
            <div class="field">
              <div class="label">Submitted By</div>
              <div class="value">${payment.user?.name} (${payment.user?.email})</div>
            </div>
            <div class="field">
              <div class="label">Entity</div>
              <div class="value">${payment.entity?.name}</div>
            </div>
            <div class="field">
              <div class="label">Vendor / Payee</div>
              <div class="value">${payment.vendorName}</div>
            </div>
            <div class="field">
              <div class="label">Nature of Expense</div>
              <div class="value">${payment.natureOfExpense}</div>
            </div>
            <div class="field">
              <div class="label">Invoice No & Date</div>
              <div class="value">${payment.invoiceNumber} &nbsp;|&nbsp; ${formatDate(payment.invoiceDate)}</div>
            </div>
            <div class="field">
              <div class="label">Due Date</div>
              <div class="value">${formatDate(payment.dueDate)}</div>
            </div>
            <div class="field">
              <div class="label">Payment Terms</div>
              <div class="value">${payment.paymentTerms}</div>
            </div>
            ${payment.remarks ? `<div class="field"><div class="label">Remarks</div><div class="value">${payment.remarks}</div></div>` : ''}

            <div class="amount-box">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="font-size:13px;color:#64748b;">Invoice Amount</span>
                <span style="font-size:13px;">${formatCurrency(payment.invoiceAmount)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                <span style="font-size:13px;color:#64748b;">GST Amount</span>
                <span style="font-size:13px;">${formatCurrency(payment.gstAmount)}</span>
              </div>
              <div style="border-top:1px solid #e2e8f0;padding-top:10px;display:flex;justify-content:space-between;">
                <span style="font-weight:600;color:#1e293b;">Total Amount</span>
                <span class="total">${formatCurrency(payment.totalAmount)}</span>
              </div>
            </div>

            <div style="text-align:center;">
              <span class="badge">⏳ Pending Approval</span>
              ${payment.attachment ? '<p style="margin-top:12px;font-size:12px;color:#64748b;">📎 Invoice attached to this email</p>' : ''}
            </div>
          </div>
          <div class="footer">
            <p>This is an automated notification from Weekly Payment Planner. Please log in to approve or review this request.</p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Weekly Payment Planner'}" <${process.env.EMAIL_FROM}>`,
        to: recipientEmails,
        subject,
        html,
      };

      // Attach invoice file if available (stored as base64 in payment.attachmentData)
      if (payment.attachmentData && payment.attachment) {
        const matches = payment.attachmentData.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          mailOptions.attachments = [{
            filename: payment.attachment,
            content: Buffer.from(matches[2], 'base64'),
            contentType: matches[1],
          }];
        }
      }

      const info = await emailTransporter.sendMail(mailOptions);

      await EmailLog.create({
        subject,
        recipients: recipientEmails,
        body: html,
        totalAmount: payment.totalAmount,
        paymentCount: 1,
        status: 'sent',
        sentAt: new Date(),
      });

      console.log(`✅ Payment notification sent: ${payment.vendorName} → ${recipientEmails}`);
    } catch (error) {
      console.error('sendPaymentNotification error:', error.message);

      try {
        await EmailLog.create({
          subject: `Payment Notification – ${payment.vendorName}`,
          recipients: '',
          body: '',
          status: 'failed',
          error: error.message,
          sentAt: new Date(),
        });
      } catch (_) {}

      throw error;
    }
  }
};

module.exports = emailService;
