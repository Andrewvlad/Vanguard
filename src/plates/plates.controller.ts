import {Controller, Body, Get, Post, Query, HttpCode, HttpStatus} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bullmq';
import {Queue} from 'bullmq';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Enforcement, EnforcementSchema} from './enforcement.entity';

// TODO: Add query validation
type PlateDto = {
    paymentId: string; // Serves as idempotency key
    plate: string; // S3 filename from /uploads
    lotId: string;
};

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

@Controller('plates')
export class PlatesController {
    constructor(
        // Pattern: https://github.com/nestjs/nest/blob/master/sample/26-queues/src/audio/audio.controller.ts
        @InjectQueue('plate-processing') private readonly plateQueue: Queue,
        @InjectRepository(EnforcementSchema)
        private readonly enforcements: Repository<Enforcement>,
    ) {}

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

    @Get()
    async list(
        @Query('lotId') lotId: string,
        @Query('take') requestedLimit?: string,
    ): Promise<Enforcement[]> {
        const limit = Math.min(Number(requestedLimit) || DEFAULT_LIMIT, MAX_LIMIT);

        /* Sample bad query:

        // 1 query (load parents)
        const enforcements = await this.enforcements.find({
            where: {lotId},
            take: limit,
            order: {issuedAt: 'DESC'},
        });

        // N queries (one trip per parent)
        for (const enforcement of enforcements) {
            enforcement.photos = await this.photos.findBy({
                enforcement: {id: enforcement.id},
            });
        }
        */

        return this.enforcements.find({
            where: {lotId},
            take: limit,
            relations: {photos: true}, // single join
            order: {issuedAt: 'DESC'},
        });
    }
}
