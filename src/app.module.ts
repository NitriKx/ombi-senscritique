import { Module } from '@nestjs/common';
import { ConfigurationController } from './controllers/configuration.controller';
import { SynchronizationWorkerService } from './service/synchronization-worker.service';
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigurationService } from "./service/configuration.service";
import {ConfigModule, ConfigService} from "@nestjs/config";
import { OmbiConfiguration } from "./orm/ombi-configuration.model";
import { SenscritiqueConfiguration } from "./orm/senscritique-configuration.model";
import configuration from "./config/configuration";
import {SequelizeModule} from "@nestjs/sequelize";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        dialect: 'sqlite',
        database: `${configService.get("configurationFolder")}/data/line.sqlite`,
        entities: [OmbiConfiguration, SenscritiqueConfiguration],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ConfigurationController],
  providers: [ConfigurationService, SynchronizationWorkerService],
})
export class AppModule {}
