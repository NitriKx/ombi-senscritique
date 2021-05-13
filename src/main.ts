import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import yargs from "yargs";

async function bootstrap(port: number) {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  await app.listen(port);
}

const argv = yargs
    .option('port', {
      alias: 'p',
      description: 'Port the service should listen to',
      default: 3582,
      type: 'number',
    })
    .help()
    .alias('help', 'h')
    .argv;

bootstrap(argv.port);
