const cron = require('node-cron');
const emailService = require('./emailService');

const cronService = {
  // Start weekly email cron job
  startWeeklyEmailCron: () => {
    // Default: Every Friday at 4:00 PM
    const schedule = process.env.EMAIL_CRON_SCHEDULE || '0 16 * * 5';

    cron.schedule(schedule, async () => {
      console.log('🕒 Running weekly payment schedule email job...');
      
      try {
        await emailService.sendWeeklySchedule();
        console.log('✅ Weekly email job completed successfully');
      } catch (error) {
        console.error('❌ Weekly email job failed:', error);
      }
    });

    console.log(`📅 Weekly email cron job scheduled: ${schedule}`);
  }
};

module.exports = cronService;
