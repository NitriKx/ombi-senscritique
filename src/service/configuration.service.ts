import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigurationService {

  constructor() {}

  public getSynchronizationSchedule() {
    return "0 * * * * *"
  }

}
