import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {BullModule} from '@nestjs/bullmq';
import {RedisModule} from './redis/redis.module';
import {redisConnection} from './redis/redis.config';
import {PlatesModule} from './plates/plates.module';
import {UploadsModule} from './uploads/uploads.module';

@Module({
    imports: [
        // Docs: https://docs.nestjs.com/techniques/configuration
        ConfigModule.forRoot({isGlobal: true}),
        // Docs: https://docs.nestjs.com/techniques/queues
        BullModule.forRoot({connection: redisConnection()}),
        RedisModule,
        PlatesModule,
        UploadsModule,
    ],
})
export class AppModule {}
