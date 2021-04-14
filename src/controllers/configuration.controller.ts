import {Controller, Get, HttpException, HttpStatus, Post, Req} from '@nestjs/common';
import {Request} from "express";
import {SynchronizationWorkerService} from "../service/synchronization-worker.service";

@Controller("configuration")
export class ConfigurationController {
  constructor(private synchronizationWorkerService: SynchronizationWorkerService) {}

  @Post()
  setInterval(@Req() request: Request): string {
    const cron = request.body.cron as string | undefined;
    if (cron) {
      this.synchronizationWorkerService.updateIntervalCRON(cron);
      return "Scheduler as been updated";
    } else {
      throw new HttpException("Missing cron parameter", HttpStatus.BAD_REQUEST);
    }
  }
}
