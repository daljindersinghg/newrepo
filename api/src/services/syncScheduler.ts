// api/src/services/syncScheduler.service.ts
import cron from 'node-cron';
import { ClinicService } from './clinic.service';
import logger from '../config/logger.config';

export class SyncScheduler {
  private static isRunning = false;

  /**
   * Start the sync scheduler
   */
  static start() {
    if (this.isRunning) {
      logger.warn('Sync scheduler is already running');
      return;
    }

    // Run daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      logger.info('Starting scheduled clinic sync with Google Places');
      
      try {
        const result = await ClinicService.bulkSyncClinics();
        logger.info(`Scheduled sync completed: ${result.success} success, ${result.failed} failed`);
        
        if (result.errors.length > 0) {
          logger.error('Sync errors:', result.errors);
        }
      } catch (error) {
        logger.error('Scheduled sync failed:', error);
      }
    });

    this.isRunning = true;
    logger.info('Sync scheduler started - will run daily at 2 AM');
  }

  /**
   * Run sync immediately (for testing)
   */
  static async runNow() {
    logger.info('Running manual clinic sync');
    
    try {
      const result = await ClinicService.bulkSyncClinics();
      logger.info(`Manual sync completed: ${result.success} success, ${result.failed} failed`);
      return result;
    } catch (error) {
      logger.error('Manual sync failed:', error);
      throw error;
    }
  }
}

// Add this to your api/src/server.ts to start the scheduler:
/*
import { SyncScheduler } from './services/syncScheduler.service';

// After database initialization
initDB().then(() => {
  SyncScheduler.start();
});
*/