import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {BullModule} from '@nestjs/bullmq';
import {TypeOrmModule} from '@nestjs/typeorm';
import {RedisModule} from '../../redis/redis.module';
import {redisConnection} from '../../redis/redis.config';
import {LambdaService} from '../../aws/lambda.service';
import {EnforcementSchema} from '../../plates/enforcement.entity';
import {PhotoSchema} from '../../plates/photo.entity';
import {dbConnection} from '../../db/db.config';
import {PlateProcessor} from './plate.processor';

@Module({
    imports: [
        // Docs: https://docs.nestjs.com/techniques/configuration
        ConfigModule.forRoot({isGlobal: true}),
        // Docs: https://docs.nestjs.com/techniques/database
        TypeOrmModule.forRoot(dbConnection()),
        TypeOrmModule.forFeature([EnforcementSchema, PhotoSchema]),
        // Docs: https://docs.nestjs.com/techniques/queues
        BullModule.forRoot({connection: redisConnection()}),
        // Dead-letter queue
        BullModule.registerQueue({name: 'plate-processing-dlq'}),
        RedisModule,
    ],
    providers: [PlateProcessor, LambdaService],
})
export class WorkerModule {}
