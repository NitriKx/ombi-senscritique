import { Controller, Get } from '@nestjs/common';

@Controller()
export class ConfigurationController {
  constructor() {}

  @Get()
  getHello(): string {
    return "";
  }
}
