import {Injectable, Logger} from '@nestjs/common';
import {SchedulerRegistry} from "@nestjs/schedule";
import {ConfigurationService} from "./configuration.service";
import {CronJob} from "cron";

@Injectable()
export class SynchronizationWorkerService {
  private static readonly CRON_NAME = "synchronization-job";

  private readonly logger = new Logger(typeof SynchronizationWorkerService);
  private intervalCron: string;

  constructor(private schedulerRegistry: SchedulerRegistry) {
    this.intervalCron = "0,30 * * * * *";
    this.updateJobScheduling();
  }

  public updateIntervalCRON(newIntervalCRON: string) {
    this.intervalCron = newIntervalCRON;
    this.updateJobScheduling();
  }

  synchroniseOmbi() {
  }

  private updateJobScheduling() {
    const job = new CronJob(this.intervalCron, () => {
      this.logger.warn(`Tick!`);
    });

    try {
      this.schedulerRegistry.getCronJob(SynchronizationWorkerService.CRON_NAME);
      this.logger.log("Deleting previous CRON job...");
      this.schedulerRegistry.deleteCronJob(SynchronizationWorkerService.CRON_NAME);
    } catch (e) {
      // Ignore the error as the cron job may not exist on first creation
      this.logger.log("No previous CRON job registered");
    }

    this.logger.log(`Creating new CRON job with schedule ${this.intervalCron}...`);
    this.schedulerRegistry.addCronJob(SynchronizationWorkerService.CRON_NAME, job);
    job.start();
  }

}
