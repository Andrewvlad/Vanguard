import {Module} from '@nestjs/common';
import {BullModule} from '@nestjs/bullmq';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {RedisModule} from './redis/redis.module';
import {redisConnection} from './redis/redis.config';
import {PlatesModule} from './plates/plates.module';

@Module({
    imports: [
        // Docs: https://docs.nestjs.com/techniques/queues
        BullModule.forRoot({connection: redisConnection()}),
        RedisModule,
        PlatesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
