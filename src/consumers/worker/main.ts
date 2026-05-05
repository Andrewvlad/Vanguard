import {NestFactory} from '@nestjs/core';
import {Logger} from '@nestjs/common';
import {WorkerModule} from './worker.module';

// Pattern: https://docs.nestjs.com/standalone-applications
async function bootstrap(): Promise<void> {
    const app = await NestFactory.createApplicationContext(WorkerModule, {
        logger: ['error', 'warn', 'log'],
    });

    // Docs: https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown
    app.enableShutdownHooks();

    const logger = new Logger('Worker');
    logger.log('Worker process started');
}

void bootstrap().catch((e) => {
    console.error(e);
    process.exit(1);
});
