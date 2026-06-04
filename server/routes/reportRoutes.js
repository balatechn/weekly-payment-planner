const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const reportService = require('../services/reportService');

// All routes require authentication
router.use(authMiddleware);

// Finance and admin only
router.use(roleMiddleware('finance', 'admin'));

// Generate entity-wise report
router.get('/entity-wise', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const workbook = await reportService.generateEntityWiseReport(startDate, endDate);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=entity-wise-report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Entity-wise report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Generate vendor-wise report
router.get('/vendor-wise', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const workbook = await reportService.generateVendorWiseReport(startDate, endDate);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=vendor-wise-report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Vendor-wise report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Generate monthly forecast
router.get('/monthly-forecast', async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const workbook = await reportService.generateMonthlyForecast(parseInt(month), parseInt(year));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=forecast-${month}-${year}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Monthly forecast error:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

module.exports = router;
