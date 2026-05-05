import {Module} from '@nestjs/common';
import Redis from 'ioredis';
import {redisConnection} from './redis.config';

/**
 BullMQ creates and owns its own connection using .forRoot()
 This is the second of the ioredis connections required for Task 2
 **/

export const REDIS_CACHE = 'REDIS_CACHE';

@Module({
    // Docs: https://docs.nestjs.com/fundamentals/custom-providers#factory-providers-usefactory
    providers: [
        {
            provide: REDIS_CACHE,
            useFactory: () => new Redis(redisConnection()),
        },
    ],
    exports: [REDIS_CACHE],
})
export class RedisModule {}
