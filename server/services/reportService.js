const ExcelJS = require('exceljs');
const { Payment, Entity, User } = require('../models');
const { Op } = require('sequelize');

const reportService = {
  // Generate entity-wise payment report
  generateEntityWiseReport: async (startDate, endDate) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Entity-wise Report');

    // Add title
    worksheet.mergeCells('A1:I1');
    worksheet.getCell('A1').value = 'Entity-wise Payment Report';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Add date range
    if (startDate && endDate) {
      worksheet.mergeCells('A2:I2');
      worksheet.getCell('A2').value = `Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
      worksheet.getCell('A2').alignment = { horizontal: 'center' };
    }

    // Headers
    const headers = [
      'Sr No', 'Entity', 'Vendor', 'Nature of Expense', 
      'Invoice No', 'Invoice Date', 'Amount (₹)', 'Due Date', 'Status'
    ];
    
    worksheet.addRow([]);
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1e3a8a' }
    };
    headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Get payments
    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const payments = await Payment.findAll({
      where,
      include: [
        { model: Entity, as: 'entity' },
        { model: User, as: 'user', attributes: ['name'] }
      ],
      order: [['entity', 'name'], ['dueDate', 'ASC']]
    });

    // Add data
    let totalAmount = 0;
    payments.forEach((payment, index) => {
      worksheet.addRow([
        index + 1,
        payment.entity.name,
        payment.vendorName,
        payment.natureOfExpense,
        payment.invoiceNumber,
        new Date(payment.invoiceDate).toLocaleDateString(),
        parseFloat(payment.totalAmount),
        new Date(payment.dueDate).toLocaleDateString(),
        payment.status.toUpperCase()
      ]);
      totalAmount += parseFloat(payment.totalAmount);
    });

    // Add total
    const totalRow = worksheet.addRow([
      '', '', '', '', '', 'TOTAL:', totalAmount, '', ''
    ]);
    totalRow.font = { bold: true };
    totalRow.getCell(6).alignment = { horizontal: 'right' };
    totalRow.getCell(7).numFmt = '₹#,##0.00';

    // Format amount column
    worksheet.getColumn(7).numFmt = '₹#,##0.00';
    worksheet.getColumn(7).width = 15;

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      if (!column.width) {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
      }
    });

    return workbook;
  },

  // Generate vendor-wise payment report
  generateVendorWiseReport: async (startDate, endDate) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vendor-wise Report');

    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').value = 'Vendor-wise Payment Report';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    if (startDate && endDate) {
      worksheet.mergeCells('A2:H2');
      worksheet.getCell('A2').value = `Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
      worksheet.getCell('A2').alignment = { horizontal: 'center' };
    }

    const headers = [
      'Sr No', 'Vendor Name', 'Entity', 'Total Invoices', 
      'Total Amount (₹)', 'Paid', 'Pending', 'Status'
    ];
    
    worksheet.addRow([]);
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1e3a8a' }
    };
    headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const payments = await Payment.findAll({
      where,
      include: [{ model: Entity, as: 'entity' }],
      order: [['vendorName', 'ASC']]
    });

    // Group by vendor
    const vendorGroups = {};
    payments.forEach(payment => {
      const key = `${payment.vendorName}_${payment.entityId}`;
      if (!vendorGroups[key]) {
        vendorGroups[key] = {
          vendorName: payment.vendorName,
          entityName: payment.entity.name,
          count: 0,
          total: 0,
          paid: 0,
          pending: 0
        };
      }
      vendorGroups[key].count++;
      vendorGroups[key].total += parseFloat(payment.totalAmount);
      if (payment.status === 'paid') {
        vendorGroups[key].paid += parseFloat(payment.totalAmount);
      } else {
        vendorGroups[key].pending += parseFloat(payment.totalAmount);
      }
    });

    let grandTotal = 0;
    Object.values(vendorGroups).forEach((group, index) => {
      worksheet.addRow([
        index + 1,
        group.vendorName,
        group.entityName,
        group.count,
        group.total,
        group.paid,
        group.pending,
        group.pending > 0 ? 'PENDING' : 'COMPLETED'
      ]);
      grandTotal += group.total;
    });

    const totalRow = worksheet.addRow([
      '', '', 'TOTAL:', '', grandTotal, '', '', ''
    ]);
    totalRow.font = { bold: true };

    worksheet.getColumn(5).numFmt = '₹#,##0.00';
    worksheet.getColumn(6).numFmt = '₹#,##0.00';
    worksheet.getColumn(7).numFmt = '₹#,##0.00';

    worksheet.columns.forEach(column => {
      if (!column.width) {
        let maxLength = 10;
        column.eachCell({ includeEmpty: true }, cell => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength + 2;
      }
    });

    return workbook;
  },

  // Generate monthly forecast report
  generateMonthlyForecast: async (month, year) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Monthly Forecast');

    worksheet.mergeCells('A1:G1');
    worksheet.getCell('A1').value = `Payment Forecast - ${month}/${year}`;
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    const headers = [
      'Week', 'Entity', 'Vendor', 'Nature of Expense', 
      'Due Date', 'Amount (₹)', 'Status'
    ];
    
    worksheet.addRow([]);
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1e3a8a' }
    };
    headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const payments = await Payment.findAll({
      where: {
        dueDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{ model: Entity, as: 'entity' }],
      order: [['dueDate', 'ASC']]
    });

    let totalAmount = 0;
    payments.forEach(payment => {
      const weekNum = Math.ceil(new Date(payment.dueDate).getDate() / 7);
      worksheet.addRow([
        `Week ${weekNum}`,
        payment.entity.name,
        payment.vendorName,
        payment.natureOfExpense,
        new Date(payment.dueDate).toLocaleDateString(),
        parseFloat(payment.totalAmount),
        payment.status.toUpperCase()
      ]);
      totalAmount += parseFloat(payment.totalAmount);
    });

    const totalRow = worksheet.addRow([
      '', '', '', '', 'TOTAL:', totalAmount, ''
    ]);
    totalRow.font = { bold: true };

    worksheet.getColumn(6).numFmt = '₹#,##0.00';

    worksheet.columns.forEach(column => {
      if (!column.width) {
        column.width = 15;
      }
    });

    return workbook;
  }
};

module.exports = reportService;
