import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany} from 'typeorm';
import {Photo} from './photo.entity';

// Schema comes from task 4 & 10
// Docs: https://docs.nestjs.com/techniques/database#repository-pattern
@Entity('enforcements')
export class Enforcement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    plate: string;

    @Column({name: 'lot_id'})
    lotId: string;

    @Column({name: 'payment_id', unique: true})
    paymentId: string;

    @CreateDateColumn({name: 'issued_at'})
    issuedAt: Date;

    @OneToMany(() => Photo, (photo) => photo.enforcement, {cascade: true})
    photos: Photo[];
}
