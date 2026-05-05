import {Processor, WorkerHost} from '@nestjs/bullmq';
import {Job} from 'bullmq';
import {Logger} from '@nestjs/common';

// Pattern: https://github.com/nestjs/nest/blob/master/sample/26-queues/src/audio/audio.processor.ts
@Processor('plate-processing')
export class PlateProcessor extends WorkerHost {
    private readonly logger = new Logger(PlateProcessor.name);

    // Async kept to match WorkerHost, as well as prepare for actual usage
    // eslint-disable-next-line @typescript-eslint/require-await
    async process(job: Job<{paymentId: string; plate: string; lotId: string}>): Promise<void> {
        this.logger.log(`Processing job ${job.id} (${job.name}):`, job.data);
    }
}
