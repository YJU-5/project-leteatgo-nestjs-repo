import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Notification {
    // 알림 ID (자동 증가)
    @PrimaryGeneratedColumn()
    id: number;

    // 유저 ID 
    @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    // 알림 타입
    @Column({ type: 'varchar', length: 255, nullable: false })
    type: string;

    // 알림 내용
    @Column({ type: 'varchar', length: 255, nullable: false })
    description: string;

    // 알림 읽음 여부 (0 = 안 읽음, 1 = 읽음)
    @Column({ type: 'smallint', default: 0 })
    read: number;

    // 생성 날짜 
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
