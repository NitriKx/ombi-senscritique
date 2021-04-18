import {Injectable, Logger} from '@nestjs/common';
import {SchedulerRegistry} from "@nestjs/schedule";
import {CronJob} from "cron";
import {OmbiClient} from "./clients/ombi/OmbiClient";

@Injectable()
export class SynchronizationService {
  private static readonly CRON_NAME = "synchronization-job";

  private readonly logger = new Logger(typeof SynchronizationService);
  private intervalCron: string;
  private ombiClient: OmbiClient;

  constructor(private schedulerRegistry: SchedulerRegistry) {
    this.intervalCron = "0,30 * * * * *";
    this.updateJobScheduling();
    this.ombiClient = new OmbiClient("https://ombi.p0i.re", "22cb146b108c46ef8cd467f137255dc3");
  }

  public updateIntervalCRON(newIntervalCRON: string) {
    this.intervalCron = newIntervalCRON;
    this.updateJobScheduling();
  }

  public synchroniseOmbi() {
    const title = this.ombiClient.searchMovie("Le seigneur des anneaux")[0].title;
    this.logger.log(`Movie found ${title}`);
  }

  public getIntervalCRON() {
    return this.intervalCron;
  }

  private updateJobScheduling() {
    const job = new CronJob(this.intervalCron, () => {
      this.logger.warn(`Tick!`);
    });

    try {
      this.schedulerRegistry.getCronJob(SynchronizationService.CRON_NAME);
      this.logger.log("Deleting previous CRON job...");
      this.schedulerRegistry.deleteCronJob(SynchronizationService.CRON_NAME);
    } catch (e) {
      // Ignore the error as the cron job may not exist on first creation
      this.logger.log("No previous CRON job registered");
    }

    this.logger.log(`Creating new CRON job with schedule ${this.intervalCron}...`);
    this.schedulerRegistry.addCronJob(SynchronizationService.CRON_NAME, job);
    job.start();
  }

}
