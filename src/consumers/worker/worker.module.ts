import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {BullModule} from '@nestjs/bullmq';
import {TypeOrmModule} from '@nestjs/typeorm';
import {RedisModule} from '../../redis/redis.module';
import {redisConnection} from '../../redis/redis.config';
import {LambdaService} from '../../aws/lambda.service';
import {EnforcementSchema} from '../../plates/enforcement.entity';
import {PhotoSchema} from '../../plates/photo.entity';
import {PlateProcessor} from './plate.processor';

@Module({
    imports: [
        // Docs: https://docs.nestjs.com/techniques/configuration
        ConfigModule.forRoot({isGlobal: true}),
        // Docs: https://docs.nestjs.com/techniques/database
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST ?? 'localhost',
            port: Number(process.env.DB_PORT ?? 5432),
            username: process.env.DB_USER ?? 'postgres',
            password: process.env.DB_PASSWORD ?? 'postgres',
            database: process.env.DB_NAME ?? 'vanguard',
            entities: [EnforcementSchema, PhotoSchema],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([EnforcementSchema, PhotoSchema]),
        // Docs: https://docs.nestjs.com/techniques/queues
        BullModule.forRoot({connection: redisConnection()}),
        RedisModule,
    ],
    providers: [PlateProcessor, LambdaService],
})
export class WorkerModule {}
