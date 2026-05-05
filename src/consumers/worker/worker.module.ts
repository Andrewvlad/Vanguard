import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {BullModule} from '@nestjs/bullmq';
import {RedisModule} from '../../redis/redis.module';
import {redisConnection} from '../../redis/redis.config';
import {PlateProcessor} from './plate.processor';

@Module({
    imports: [
        // Docs: https://docs.nestjs.com/techniques/configuration
        ConfigModule.forRoot({isGlobal: true}),
        // Docs: https://docs.nestjs.com/techniques/queues
        BullModule.forRoot({connection: redisConnection()}),
        RedisModule,
    ],
    providers: [PlateProcessor],
})
export class WorkerModule {}
