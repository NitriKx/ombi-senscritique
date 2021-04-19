import {Injectable, Logger} from '@nestjs/common';
import { Configuration } from "../orm/configuration.model";
import {InjectModel} from "@nestjs/sequelize";
import {EventEmitter2} from "@nestjs/event-emitter";
import {stringify} from "javascript-stringify";
import {ConfigurationUpdateDTO} from "../dto/configuration.dto";

@Injectable()
export class ConfigurationService {

  private readonly logger = new Logger(typeof ConfigurationService);

  constructor(@InjectModel(Configuration) private configurationModel: typeof Configuration,
              private eventEmitter: EventEmitter2) {}

  public async get(): Promise<Configuration> {
    const configurations = await this.configurationModel.findAll({order: [["createdAt", "DESC"]], limit: 1});
    if (configurations && configurations.length > 0) {
      const configuration = configurations[0];
      this.logger.debug(`Configuration is ${stringify(configuration.toJSON())}`)
      return configuration;
    } else {
      this.logger.debug(`No configuration available`)
      return this.getDefaultConfiguration();
    }
  }

  public async update(newConfiguration: ConfigurationUpdateDTO) {
    const configuration = Configuration.build(newConfiguration);
    const result = await configuration.save();
    this.eventEmitter.emit('configuration.update', result);
    return result;
  }

  private getDefaultConfiguration() {
    return new Configuration({
      scheduling: "0 */5 * * * *",
      languageCode: "FR"
    })
  }
}
