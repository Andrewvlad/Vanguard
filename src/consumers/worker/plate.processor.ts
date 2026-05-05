import {Processor, WorkerHost} from '@nestjs/bullmq';
import {Job} from 'bullmq';
import {Logger} from '@nestjs/common';
import {LambdaService} from '../../aws/lambda.service';

type PlateDto = {
    paymentId: string;
    plate: string; // S3 key from /uploads (passed straight through from controller)
    lotId: string;
};

// Pattern: https://github.com/nestjs/nest/blob/master/sample/26-queues/src/audio/audio.processor.ts
@Processor('plate-processing')
export class PlateProcessor extends WorkerHost {
    private readonly logger = new Logger(PlateProcessor.name);

    constructor(private readonly lambda: LambdaService) {
        super();
    }

    async process(job: Job<PlateDto>): Promise<void> {
        this.logger.log(`[Processing] Job ${job.id} (${job.name})`);

        const ocrPlate = await this.lambda.invokePlateOcr(job.data.plate);

        // TODO: Replace with DB write (Postgres + TypeORM)
        this.logger.log(
            `paymentId: ${job.data.paymentId},
            plate: ${ocrPlate}, // Plate # from OCR
            lotId: ${job.data.lotId},
            attachment: ${job.data.plate}, // S3 key from /uploads`,
        );

        this.logger.log(`[Complete] Job ${job.id} (${job.name})`);
    }
}
