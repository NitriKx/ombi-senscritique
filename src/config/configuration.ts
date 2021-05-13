import {Logger} from "@nestjs/common";

export default () => {
    const logger = new Logger("EnvironmentConfig");
    const config = {
        configurationFolder: process.env.CONFIGURATION_FOLDER || "./data/"
    };
    logger.log(`Received configuration from environment: ${JSON.stringify(config)}`);
    return config;
}