import {Body, Controller, Get, HttpException, HttpStatus, Logger, Post, Req} from '@nestjs/common';
import {Request} from "express";
import {ConfigurationService} from "../service/configuration.service";
import {ConfigurationUpdateDTO} from "../dto/configuration.dto";
import {SynchronizationService} from "../service/synchronization.service";

@Controller("ondemand-synchronization")
export class OndemandSynchronizationController {
  private readonly logger = new Logger(typeof OndemandSynchronizationController);

  constructor(private synchronizationService: SynchronizationService) {}

  @Post()
  executeSynchronization() {
    this.synchronizationService.synchroniseOmbi();
  }
}
