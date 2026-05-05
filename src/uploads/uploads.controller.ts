import {Controller, Post} from '@nestjs/common';
import {S3Service} from '../aws/s3.service';

@Controller('uploads')
export class UploadsController {
    // Pattern: https://docs.nestjs.com/providers
    constructor(private readonly s3: S3Service) {}

    @Post()
    async createUpload(): Promise<{url: string; key: string; expiresIn: number}> {
        return this.s3.createPresignedJpegUpload();
    }
}
