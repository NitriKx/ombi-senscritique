import { Module } from '@nestjs/common';
import { ConfigurationController } from './controllers/configuration.controller';
import { SynchronizationWorkerService } from './service/synchronization-worker.service';
import { ScheduleModule } from "@nestjs/schedule";
import {TypeOrmModule} from "@nestjs/typeorm";
import {root} from "rxjs/internal-compatibility";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: `${root}/data/line.sqlite`,
      entities: [],
      synchronize: true,
    }),
  ],
  controllers: [ConfigurationController],
  providers: [SynchronizationWorkerService],
})
export class AppModule {}
