import { Module } from '@nestjs/common';
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration from "./config/configuration";
import { SequelizeModule } from "@nestjs/sequelize";
import {SynchronizationModule} from "./modules/synchronization.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        dialect: 'sqlite',
        database: `${configService.get("configurationFolder")}/data/db.sqlite`,
        synchronize: true,
        autoLoadModels: true,
      }),
      inject: [ConfigService],
    }),
    SynchronizationModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
