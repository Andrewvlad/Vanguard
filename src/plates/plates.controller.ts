import {Controller, Body, Post, HttpCode, HttpStatus} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bullmq';
import {Queue} from 'bullmq';

// TODO: Add query validation
type PlateDto = {
    paymentId: string; // Serves as idempotency key
    plate: string;
    lotId: string;
};

@Controller('plates')
export class PlatesController {
    // Pattern: https://github.com/nestjs/nest/blob/master/sample/26-queues/src/audio/audio.controller.ts
    constructor(@InjectQueue('plate-processing') private readonly plateQueue: Queue) {}

    @Post()
    @HttpCode(HttpStatus.ACCEPTED) // 202 since request is accepted but not available
    async enqueue(@Body() body: PlateDto) {
        const job = await this.plateQueue.add(
            'process-plate',
            {
                paymentId: body.paymentId, // Not necessary to enumerate (see jobId), but consistent
                plate: body.plate,
                lotId: body.lotId,
            },
            // Docs: https://docs.bullmq.io/guide/jobs/job-ids
            // This is a simple implementation of idempotency:
            //      - It does not solve for multiple queues
            //      - Only idempotent while in the queue (can be re-enqueued after BullMQ cleanup)
            {jobId: body.paymentId},
        );

        return {jobId: job.id}; // Job ID returned for tracking purposes (paymentId)
    }
}
