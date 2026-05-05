import {Controller, Body, Post, HttpCode, HttpStatus} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bullmq';
import {Queue} from 'bullmq';

// TODO: Add query validation
type PlateDto = {
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
        const job = await this.plateQueue.add('process-plate', {
            plate: body.plate,
            lotId: body.lotId,
        });

        return {jobId: job.id}; // Job ID returned for tracking purposes
    }
}
