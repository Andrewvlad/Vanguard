import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {v7 as uuidv7} from 'uuid'; // v7 over v4

const EXPIRE_SECONDS = 900; // 15 minutes

// Docs: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
// Docs: https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
@Injectable()
export class S3Service {
    private readonly client: S3Client;
    private readonly bucket: string;

    // Pattern: https://docs.nestjs.com/techniques/configuration#using-the-configservice
    constructor(private readonly config: ConfigService) {
        this.client = new S3Client({region: this.config.get<string>('AWS_REGION') ?? 'us-east-1'});
        this.bucket = this.config.get<string>('S3_UPLOAD_BUCKET') ?? 'vanguard-uploads';
    }

    // Returns a presigned PUT URL the client uses to upload a JPEG directly to S3.
    async createPresignedJpegUpload(): Promise<{url: string; key: string; expiresIn: number}> {
        const key = `uploads/${uuidv7()}.jpg`; // jpg hardcoded for now

        // Using simpler PutObjectCommand instead of createPresignedPost (@aws-sdk/s3-presigned-post)
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: 'image/jpeg', // jpg hardcoded for now
        });

        const url = await getSignedUrl(this.client, command, {expiresIn: EXPIRE_SECONDS});
        return {url, key, expiresIn: EXPIRE_SECONDS};
    }
}
