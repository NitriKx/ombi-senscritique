import { Injectable } from '@nestjs/common';
import {SchedulerRegistry} from "@nestjs/schedule";
import {ConfigurationService} from "./configuration.service";

@Injectable()
export class SynchronizationWorkerService {

  constructor(private schedulerRegistry: SchedulerRegistry, private configurationService: ConfigurationService) {}

  synchroniseOmbi() {
  }

}
