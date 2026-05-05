import {NestFactory} from '@nestjs/core';
import {AppModule} from '../../app.module';

// Pattern: https://docs.nestjs.com/standalone-applications
async function bootstrap(): Promise<void> {
    const app = await NestFactory.createApplicationContext(AppModule);

    // Docs: https://docs.nestjs.com/standalone-applications#terminating-phase
    await app.close();
    process.exit(0);
}

void bootstrap();
