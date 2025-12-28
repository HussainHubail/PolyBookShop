import cron from 'node-cron';
import { notificationService } from '../services/notification.service';
import { holdService } from '../services/hold.service';
import { fineService } from '../services/fine.service';
import { logger, LogAction } from '../utils/logger';

class ScheduledJobsService {
  /**
   * Initialize all scheduled jobs
   */
  init() {
    // Run due date reminders daily at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      try {
        console.log('Running due date reminder job...');
        const notifications = await notificationService.sendDueDateReminders();
        console.log(`Sent ${notifications.length} due date reminders`);
        
        await logger.info(LogAction.SEND_DUE_REMINDERS, {
          jobType: 'scheduled',
          count: notifications.length,
          timestamp: new Date(),
        });
      } catch (error: any) {
        console.error('Error in due date reminder job:', error);
        await logger.error(LogAction.SYSTEM_ERROR, {
          job: 'due_date_reminders',
          error: error.message,
        });
      }
    });

    // Run overdue warnings daily at 10:00 AM
    cron.schedule('0 10 * * *', async () => {
      try {
        console.log('Running overdue warnings job...');
        const notifications = await notificationService.sendOverdueWarnings();
        console.log(`Sent ${notifications.length} overdue warnings`);
        
        await logger.info(LogAction.SEND_OVERDUE_WARNINGS, {
          jobType: 'scheduled',
          count: notifications.length,
          timestamp: new Date(),
        });
      } catch (error: any) {
        console.error('Error in overdue warnings job:', error);
        await logger.error(LogAction.SYSTEM_ERROR, {
          job: 'overdue_warnings',
          error: error.message,
        });
      }
    });

    // Run auto-place holds for severely overdue books daily at 11:00 AM
    // Grace period: 7 days after due date
    cron.schedule('0 11 * * *', async () => {
      try {
        console.log('Running auto-place holds job...');
        const holds = await holdService.autoPlaceOverdueHolds();
        console.log(`Placed ${holds.length} automatic holds`);
        
        await logger.info(LogAction.PLACE_HOLD, {
          jobType: 'scheduled_auto',
          count: holds.length,
          timestamp: new Date(),
        });
      } catch (error: any) {
        console.error('Error in auto-place holds job:', error);
        await logger.error(LogAction.SYSTEM_ERROR, {
          job: 'auto_place_holds',
          error: error.message,
        });
      }
    });

    // Run auto-charge overdue fines daily at 12:00 PM
    cron.schedule('0 12 * * *', async () => {
      try {
        console.log('Running auto-charge fines job...');
        const fines = await fineService.autoChargeOverdueFines();
        console.log(`Charged ${fines.length} automatic fines`);
        
        await logger.info(LogAction.CHARGE_FINE, {
          jobType: 'scheduled_auto',
          count: fines.length,
          timestamp: new Date(),
        });
      } catch (error: any) {
        console.error('Error in auto-charge fines job:', error);
        await logger.error(LogAction.SYSTEM_ERROR, {
          job: 'auto_charge_fines',
          error: error.message,
        });
      }
    });

    console.log('✅ Scheduled jobs initialized:');
    console.log('  - Due date reminders: Daily at 9:00 AM');
    console.log('  - Overdue warnings: Daily at 10:00 AM');
    console.log('  - Auto-place holds: Daily at 11:00 AM (7-day grace period)');
    console.log('  - Auto-charge fines: Daily at 12:00 PM');
  }

  /**
   * Manually trigger due date reminders (for testing)
   */
  async runDueDateReminders() {
    return await notificationService.sendDueDateReminders();
  }

  /**
   * Manually trigger overdue warnings (for testing)
   */
  async runOverdueWarnings() {
    return await notificationService.sendOverdueWarnings();
  }

  /**
   * Manually trigger auto-place holds (for testing)
   */
  async runAutoPlaceHolds() {
    return await holdService.autoPlaceOverdueHolds();
  }

  /**
   * Manually trigger auto-charge fines (for testing)
   */
  async runAutoChargeFines() {
    return await fineService.autoChargeOverdueFines();
  }
}

export const scheduledJobsService = new ScheduledJobsService();
