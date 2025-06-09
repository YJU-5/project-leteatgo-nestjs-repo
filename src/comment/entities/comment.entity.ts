import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Board } from 'src/board/entities/board.entity'; 

@Entity()
export class Comment {
    // 댓글 ID (자동 증가)
    @PrimaryGeneratedColumn()
    id: number;

    // 사진첩 아이디 
    @ManyToOne(() => Board, (board) => board.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'photo_album_id' })
    board: Board; // Board 엔티티 사용 

    // 유저 아이디 
    @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    // 댓글 내용
    @Column({ type: 'varchar', length: 255, nullable: false })
    content: string;

    // 등록 날짜 
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // 수정 날짜 
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
