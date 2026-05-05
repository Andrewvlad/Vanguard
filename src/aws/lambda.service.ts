import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {InvokeCommand, LambdaClient} from '@aws-sdk/client-lambda';

type PlateOcrRequest = {bucket: string; key: string};
type PlateOcrResponse = {plate: string};

@Injectable()
export class LambdaService {
    private readonly client: LambdaClient;
    private readonly bucket: string;
    private readonly plateOcrFunctionName: string;

    // Pattern: https://docs.nestjs.com/techniques/configuration#using-the-configservice
    constructor(private readonly config: ConfigService) {
        this.client = new LambdaClient({
            region: this.config.get<string>('AWS_REGION') ?? 'us-east-1',
        });
        this.bucket = this.config.get<string>('S3_UPLOAD_BUCKET') ?? 'vanguard-uploads';
        this.plateOcrFunctionName = this.config.get<string>('LAMBDA_PLATE_OCR') ?? 'plate-ocr';
    }

    async invokePlateOcr(key: string): Promise<string> {
        const payload: PlateOcrRequest = {bucket: this.bucket, key};

        // Docs: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_lambda_code_examples.html
        const command = new InvokeCommand({
            FunctionName: this.plateOcrFunctionName,
            InvocationType: 'RequestResponse', // Default
            Payload: JSON.stringify(payload),
        });

        const response = await this.client.send(command);

        if (response.FunctionError) {
            const errorBody = response.Payload ? Buffer.from(response.Payload).toString() : '';
            throw new Error(
                `Lambda ${this.plateOcrFunctionName} failed: ${response.FunctionError} ${errorBody}`,
            );
        }

        if (!response.Payload) throw new Error('plate-ocr lambda returned empty payload');

        const parsed = JSON.parse(Buffer.from(response.Payload).toString()) as PlateOcrResponse;
        return parsed.plate;
    }
}
