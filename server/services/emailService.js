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
        order: [['entity', 'name', 'ASC'], ['dueDate', 'ASC']]
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
  }
};

module.exports = emailService;
