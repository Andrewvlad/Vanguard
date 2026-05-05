import {NestFactory} from '@nestjs/core';
import {AppModule} from '../../app.module';
import {Logger} from '@nestjs/common';

// Pattern: https://docs.nestjs.com/standalone-applications
async function bootstrap(): Promise<void> {
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn', 'log'],
    });

    const logger = new Logger('Worker');
    logger.log('Worker process started');

    // Docs: https://docs.nestjs.com/standalone-applications#terminating-phase
    await app.close();
    process.exit(0);
}

void bootstrap().catch((e) => {
    console.error(e);
    process.exit(1);
});
