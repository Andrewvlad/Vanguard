import {Logger} from '@nestjs/common';
import {InjectQueue, OnWorkerEvent, Processor, WorkerHost} from '@nestjs/bullmq';
import {Job, Queue} from 'bullmq';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {LambdaService} from '../../aws/lambda.service';
import {Enforcement, EnforcementSchema} from '../../plates/enforcement.entity';

type PlateDto = {
    paymentId: string;
    plate: string; // S3 key from /uploads (passed straight through from controller)
    lotId: string;
};

// Pattern: https://github.com/nestjs/nest/blob/master/sample/26-queues/src/audio/audio.processor.ts
@Processor('plate-processing')
export class PlateProcessor extends WorkerHost {
    private readonly logger = new Logger(PlateProcessor.name);

    constructor(
        private readonly lambda: LambdaService,
        // Docs: https://docs.nestjs.com/techniques/database#repository-pattern
        @InjectRepository(EnforcementSchema)
        private readonly enforcements: Repository<Enforcement>,
        // Dead-letter queue for when jobs finish retry attempts
        @InjectQueue('plate-processing-dlq')
        private readonly dlq: Queue,
    ) {
        super();
    }

    async process(job: Job<PlateDto>): Promise<void> {
        this.logger.log(`[Processing] Job ${job.id} (${job.name})`);

        const ocrPlate = await this.lambda.invokePlateOcr(job.data.plate);

        // Photo is inserted alongside the enforcement in a single save() transaction
        await this.enforcements.save({
            paymentId: job.data.paymentId,
            plate: ocrPlate,
            lotId: job.data.lotId,
            photos: [{s3Key: job.data.plate}],
        });

        this.logger.log(`[Complete] Job ${job.id} (${job.name})`);
    }

    // Docs: https://docs.bullmq.io/guide/events
    @OnWorkerEvent('failed')
    async onFailed(job: Job<PlateDto>, err: Error): Promise<void> {
        const maxAttempts = job.opts.attempts ?? 1;
        const failedTimestamp = new Date().toISOString();

        this.logger.error(
            JSON.stringify({
                event: 'job.failed',
                jobId: job.id,
                paymentId: job.data?.paymentId,
                attempt: `${job.attemptsMade} / ${maxAttempts}`,
                failedAt: failedTimestamp,
                error: err.message,
            }),
        );

        // Hits every failure, so a gate is needed to check for final
        if ((job.attemptsMade ?? 0) < maxAttempts) return;

        await this.dlq.add('failed-plate', {
            originalJobId: job.id,
            originalQueue: 'plate-processing',
            data: job.data,
            error: {message: err.message, stack: err.stack},
            failedAt: failedTimestamp,
        });
    }
}
