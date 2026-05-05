import {Logger} from '@nestjs/common';
import {Processor, WorkerHost} from '@nestjs/bullmq';
import {Job} from 'bullmq';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {LambdaService} from '../../aws/lambda.service';
import {Enforcement} from '../../plates/enforcement.entity';

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
        @InjectRepository(Enforcement)
        private readonly enforcements: Repository<Enforcement>,
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
}
