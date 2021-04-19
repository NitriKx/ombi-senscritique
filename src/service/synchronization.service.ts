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
import moment from "moment";

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
        // Await here to avoid spamming the Ombi instance
        await this.searchMovieAndRequestItIfNeeded(wishedMovie);
      }

      const wishedTVShows = await this.sensCritiqueClient.listWishes(SensCritiqueUniverse.TV_SHOW);
      this.logger.log(`Found ${wishedTVShows.length} TV Shows wished on SensCritique`)
      for (const wishedTVShow of wishedTVShows) {
        // Await here to avoid spamming the Ombi instance
        await this.searchTVShowAndRequestItIfNeeded(wishedTVShow);
      }
    } else {
      this.logger.warn("Ombi or Senscritique client not ready. Aborting synchronization... Please ensure that you have finished the configuration.")
    }
  }

  private async searchMovieAndRequestItIfNeeded(wishedMovie: Wish) {
    if (this.ombiClient) {
      // Extract the year from the text release date (format: "21 juillet 2021")
      moment.locale('fr')
      const releaseYear = moment(wishedMovie.release_date, "DD MMMM YYYY").year()

      const matchingMovies = await this.ombiClient.searchMovies(wishedMovie.title, releaseYear);
      if (matchingMovies.length > 0) {
        const betterMatchingMovie = matchingMovies[0];
        this.logger.debug(`Better match is movie ${betterMatchingMovie.title}`);
        if (!betterMatchingMovie.requested && !betterMatchingMovie.available && !betterMatchingMovie.approved) {
          this.logger.log(`Requesting movie ${betterMatchingMovie.title} (${betterMatchingMovie.theMovieDbId}) on Ombi...`);
          this.ombiClient.requestMovie(betterMatchingMovie.theMovieDbId).catch((err) => {
            this.logger.error(`Could not request movie ${betterMatchingMovie.title} (${betterMatchingMovie.theMovieDbId}) on Ombi: ${err}`)
          });
        } else {
          if (betterMatchingMovie.requested || betterMatchingMovie.approved) {
            this.logger.log(`Movie ${betterMatchingMovie.title} has been already requested`);
          } else if (betterMatchingMovie.available) {
            this.logger.log(`Movie ${betterMatchingMovie.title} is already available`);
          }
        }
      } else {
        this.logger.warn(`Could not find movie ${wishedMovie.title} in Ombi`)
      }
    }
  }

  private async searchTVShowAndRequestItIfNeeded(wishedTVShow: Wish) {
    if (this.ombiClient) {
      const matchingTVShows = await this.ombiClient.searchTVShows(wishedTVShow.title);
      if (matchingTVShows.length > 0) {
        const betterMatchingTVShow = matchingTVShows[0];
        this.logger.debug(`Better match is TV Show is ${betterMatchingTVShow.title}`);
        if (!betterMatchingTVShow.requested && !betterMatchingTVShow.available && !betterMatchingTVShow.approved) {
          this.logger.log(`Requesting TV Show ${betterMatchingTVShow.title} (${betterMatchingTVShow.theTvDbId}) on Ombi...`);
          this.ombiClient.requestMovie(betterMatchingTVShow.theTvDbId).catch((err) => {
            this.logger.error(`Could not request TV Show ${betterMatchingTVShow.title} (${betterMatchingTVShow.theTvDbId}) on Ombi: ${err}`)
          });
        } else {
          if (betterMatchingTVShow.requested || betterMatchingTVShow.approved) {
            this.logger.log(`TV Show ${betterMatchingTVShow.title} has been already requested`);
          } else if (betterMatchingTVShow.available) {
            this.logger.log(`TV Show ${betterMatchingTVShow.title} is already available`);
          }
        }
      } else {
        this.logger.warn(`Could not find TV Show ${wishedTVShow.title} in Ombi`)
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
