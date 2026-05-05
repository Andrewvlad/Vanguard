import {Module} from '@nestjs/common';
import {BullModule} from '@nestjs/bullmq';
import {RedisModule} from '../../redis/redis.module';
import {PlateProcessor} from './plate.processor';

@Module({
    imports: [
        // Docs: https://docs.nestjs.com/techniques/queues
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST ?? 'localhost',
                port: Number(process.env.REDIS_PORT ?? 6379),
            },
        }),
        RedisModule,
    ],
    providers: [PlateProcessor],
})
export class WorkerModule {}
