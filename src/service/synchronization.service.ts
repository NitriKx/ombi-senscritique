import {Injectable, Logger} from '@nestjs/common';
import {SchedulerRegistry} from "@nestjs/schedule";
import {CronJob} from "cron";
import {OmbiClient} from "./clients/ombi/OmbiClient";
import {ConfigurationService} from "./configuration.service";
import {OnEvent} from "@nestjs/event-emitter";
import {Configuration} from "../orm/configuration.model";
import {SensCritiqueClient} from "./clients/senscritique/SensCritiqueClient";
import {SensCritiqueUniverse} from "./clients/senscritique/SensCritiqueUniverse";
import {Wish} from "./clients/senscritique/requests/ListWishes";

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
        this.sensCritiqueClient = await SensCritiqueClient.build(configuration.sensCritiqueUserEmail, configuration.sensCritiqueUserPassword);
      }
    }
    return;
  }

  public async synchroniseOmbi() {
    if (this.ombiClient && this.sensCritiqueClient) {
      const wishedMovies = await this.sensCritiqueClient.listWishes(SensCritiqueUniverse.MOVIE);
      this.logger.log(`Found ${wishedMovies.length} movies wished on SensCritique`)
      for (const wishedMovie of wishedMovies) {
        this.searchMovieAndRequestItIfNeeded(wishedMovie);
      }
    } else {
      this.logger.warn("Ombi or Senscritique client not ready. Aborting synchronization... Please ensure that you have finished the configuration.")
    }
  }

  private async searchMovieAndRequestItIfNeeded(wishedMovie: Wish) {
    if (this.ombiClient) {
      const matchingMovies = await this.ombiClient.searchMovies(wishedMovie.title);
      if (matchingMovies.length > 0) {
        const betterMatchingMovie = matchingMovies[0];
        this.logger.debug(`Better match is movie ${betterMatchingMovie.title}`);
        if (!betterMatchingMovie.requested && !betterMatchingMovie.available && !betterMatchingMovie.approved) {
          this.logger.log(`Requesting movie ${betterMatchingMovie.title} (${betterMatchingMovie.theMovieDbId}) on Ombi...`);
          this.ombiClient.requestMovie(betterMatchingMovie.theMovieDbId).catch((err) => {
            this.logger.error(`Could not request movie ${betterMatchingMovie.title} (${betterMatchingMovie.theMovieDbId}) on Ombi: ${err}`)
          });
        } else {
          this.logger.log(`Movie ${betterMatchingMovie.title} has been already requested`);
        }
      } else {
        this.logger.warn(`Could not find movie ${wishedMovie.title} in Ombi`)
      }
    }
  }

  private updateJobScheduling(intervalCron: string) {
    const job = new CronJob(intervalCron, () => {
      this.synchroniseOmbi();
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
