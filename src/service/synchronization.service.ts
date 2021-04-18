import {Injectable, Logger} from '@nestjs/common';
import {SchedulerRegistry} from "@nestjs/schedule";
import {CronJob} from "cron";
import {OmbiClient} from "./clients/ombi/OmbiClient";
import {ConfigurationService} from "./configuration.service";
import {OnEvent} from "@nestjs/event-emitter";
import {Configuration} from "../orm/configuration.model";
import {SensCritiqueClient} from "./clients/senscritique/SensCritiqueClient";

@Injectable()
export class SynchronizationService {
  private static readonly CRON_NAME = "synchronization-job";

  private readonly logger = new Logger(typeof SynchronizationService);
  private ombiClient: OmbiClient | undefined;
  private sensCritiqueClient: SensCritiqueClient | undefined;

  constructor(private configurationService: ConfigurationService, private schedulerRegistry: SchedulerRegistry) {
    this.init()
  }

  private async init() {
    this.onConfigurationChange(await this.configurationService.get());
  }

  @OnEvent("configuration.*", { async: true })
  public async onConfigurationChange(newConfiguration: Configuration): Promise<void> {
    const configuration = await this.configurationService.get();
    if (configuration.scheduling) {
      this.updateJobScheduling(configuration.scheduling);
      if (configuration.ombiUrl && configuration.ombiApiKey) {
        this.ombiClient = new OmbiClient(configuration.ombiUrl, configuration.ombiApiKey);
      }
      if (configuration.sensCritiqueUserEmail && configuration.sensCritiqueUserPassword) {
        this.sensCritiqueClient = new SensCritiqueClient(configuration.sensCritiqueUserEmail, configuration.sensCritiqueUserPassword);
      }
    }
    return;
  }

  public async synchroniseOmbi() {
    if (this.ombiClient && this.sensCritiqueClient) {
      const movies = await this.ombiClient.searchMovies("Le seigneur des anneaux");
      this.logger.log(`Movie found ${movies[0].title}`);
      const result = await this.sensCritiqueClient.getUserId();
    }
  }

  private updateJobScheduling(intervalCron: string) {
    const job = new CronJob(intervalCron, () => {
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

    this.logger.log(`Creating new CRON job...`);
    this.schedulerRegistry.addCronJob(SynchronizationService.CRON_NAME, job);
    job.start();
  }

}
