import {Body, Controller, Get, HttpException, HttpStatus, Logger, Post, Req} from '@nestjs/common';
import {Request} from "express";
import {ConfigurationService} from "../service/configuration.service";
import {ConfigurationUpdateDTO} from "../dto/configuration.dto";

@Controller("configuration")
export class ConfigurationController {
  private readonly logger = new Logger(typeof ConfigurationController);

  constructor(private configurationService: ConfigurationService) {}

  @Get()
  async getConfiguration(@Req() request: Request) {
    this.logger.debug("Fetching configuration...")
    return await this.configurationService.get();
  }

  @Post()
  setInterval(@Body() configuration: ConfigurationUpdateDTO) {
    if (configuration) {
      this.configurationService.update(configuration);
      return {
        message: "Scheduler as been updated"
      };
    } else {
      throw new HttpException("Missing cron parameter", HttpStatus.BAD_REQUEST);
    }
  }
}
