import {EntitySchema} from 'typeorm';
import {Photo} from './photo.entity';

export class Enforcement {
    id: string;
    plate: string;
    lotId: string;
    paymentId: string;
    issuedAt: Date;
    photos: Photo[];
}

// Schema comes from task 4 & 10.
// Docs: https://docs.nestjs.com/techniques/database#separating-entity-definition
export const EnforcementSchema = new EntitySchema<Enforcement>({
    name: 'Enforcement',
    target: Enforcement,
    tableName: 'enforcements',
    columns: {
        id: {type: 'uuid', primary: true, generated: 'uuid'},
        plate: {type: String},
        lotId: {type: String, name: 'lot_id'},
        paymentId: {type: String, name: 'payment_id', unique: true},
        issuedAt: {type: Date, name: 'issued_at', createDate: true},
    },
    relations: {
        photos: {
            type: 'one-to-many',
            target: 'Photo',
            inverseSide: 'enforcement',
            cascade: true,
        },
    },
    // Index for GET /plates?lotId=X (lot_id filter + issued_at order).
    indices: [{name: 'idx_enforcements_lot_id_issued_at', columns: ['lotId', 'issuedAt']}],
});
