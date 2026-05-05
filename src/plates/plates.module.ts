import {Module} from '@nestjs/common';
import {BullModule} from '@nestjs/bullmq';
import {TypeOrmModule} from '@nestjs/typeorm';
import {EnforcementSchema} from './enforcement.entity';
import {PhotoSchema} from './photo.entity';
import {PlatesController} from './plates.controller';

@Module({
    imports: [
        // Docs: https://docs.nestjs.com/techniques/queues
        BullModule.registerQueue({
            name: 'plate-processing',
            // Dead-letter queue
            // Docs: https://docs.bullmq.io/guide/retrying-failing-jobs
            defaultJobOptions: {
                attempts: 3,
                // 2000 * 2^(attempts-1) = retries at 4s & 12s.
                backoff: {type: 'exponential', delay: 2000},
            },
        }),
        // Docs: https://docs.nestjs.com/techniques/database
        TypeOrmModule.forFeature([EnforcementSchema, PhotoSchema]),
    ],
    controllers: [PlatesController],
})
export class PlatesModule {}
