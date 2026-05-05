import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm';
import {Enforcement} from './enforcement.entity';

// Docs: https://docs.nestjs.com/techniques/database#repository-pattern
@Entity('photos')
export class Photo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({name: 's3_key'})
    s3Key: string;

    @ManyToOne(() => Enforcement, (enforcement) => enforcement.photos, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'enforcement_id'})
    enforcement: Enforcement;
}
