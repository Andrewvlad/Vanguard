import {EntitySchema} from 'typeorm';
import {Enforcement} from './enforcement.entity';

export class Photo {
    id: string;
    s3Key: string;
    enforcement: Enforcement;
}

// Docs: https://docs.nestjs.com/techniques/database#separating-entity-definition
export const PhotoSchema = new EntitySchema<Photo>({
    name: 'Photo',
    target: Photo,
    tableName: 'photos',
    columns: {
        id: {type: 'uuid', primary: true, generated: 'uuid'},
        // S3 object key from /uploads (e.g. uploads/<uuid>.jpg)
        s3Key: {type: String, name: 's3_key'},
    },
    relations: {
        enforcement: {
            type: 'many-to-one',
            target: 'Enforcement',
            inverseSide: 'photos',
            joinColumn: {name: 'enforcement_id'},
            onDelete: 'CASCADE',
        },
    },
});
