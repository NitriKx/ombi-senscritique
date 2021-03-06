import { Module } from '@nestjs/common';
import { SynchronizationService } from '../service/synchronization.service';
import { ConfigurationService } from "../service/configuration.service";
import { SequelizeModule } from "@nestjs/sequelize";
import {Configuration} from "../orm/configuration.model";
import {ConfigurationController} from "../controllers/configuration.controller";
import {OndemandSynchronizationController} from "../controllers/ondemand-synchronization.controller";

@Module({
  imports: [
    SequelizeModule.forFeature([Configuration])
  ],
  controllers: [ConfigurationController, OndemandSynchronizationController],
  providers: [ConfigurationService, SynchronizationService],
})
export class SynchronizationModule {}
