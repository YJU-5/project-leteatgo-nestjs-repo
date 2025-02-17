import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Subscription {
    // 구독 관계 테이블 ID (자동 증가)
    @PrimaryGeneratedColumn()
    id: number;

    // 구독하는 사용자 
    @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subscriber' })
    subscriber: User;

    // 구독 대상 사용자 
    @ManyToOne(() => User, (user) => user.subscribers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subscribed_user' })
    subscribedUser: User;

    // 등록 날짜 
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // 수정 날짜 
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
