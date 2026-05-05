import {Module} from '@nestjs/common';
import {BullModule} from '@nestjs/bullmq';
import {PlatesController} from './plates.controller';

@Module({
    imports: [
        // Docs: https://docs.nestjs.com/techniques/queues
        BullModule.registerQueue({
            name: 'plate-processing',
        }),
    ],
    controllers: [PlatesController],
})
export class PlatesModule {}
