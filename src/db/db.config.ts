import {DataSourceOptions} from 'typeorm';
import {EnforcementSchema} from '../plates/enforcement.entity';
import {PhotoSchema} from '../plates/photo.entity';

// Shared DB config
export const dbConnection = (): DataSourceOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'vanguard',
    entities: [EnforcementSchema, PhotoSchema],
    synchronize: true, // TODO: turn off for prod
});
