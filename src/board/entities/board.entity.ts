import { User } from "src/user/entities/user.entity";
import { Like } from 'src/like/entities/like.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";

@Entity()
export class Board {

    // 사진첩 아이디 (자동 증가)
    @PrimaryGeneratedColumn()
    id:number;

    // 유저 아이디
    @ManyToOne(() => User, (user) => user.boards, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    // 사진 URL 배열 (최대 4개)
    @Column({ type: 'simple-array', nullable: true })
    picture_urls: string[];

    // 제목
    @Column({ type: 'varchar', length: 255, nullable: false })
    title: string;

    // 내용
    @Column({ type: 'text', nullable: false })
    content: string;

    // 좋아요 개수 (기본값 0)
    @Column({ type: 'int', default: 0 })
    like: number;

    // 조회수 (기본값 0)
    @Column({ type: 'int', default: 0 })
    hits: number;

    // 공지사항 여부 (boolean, 기본값 false)
    @Column({ type: 'boolean', default: false })
    isNotice: boolean;

    // 등록날짜
    @CreateDateColumn({name:'created_at'}) // 생성일시 자동 생성 
    createdAt: Date;

    // 수정날짜
    @UpdateDateColumn({name:'updated_at'})
    updatedAt:Date;

    // Like와 조인
    @OneToMany(() => Like, (like) => like.board)
    likes: Like[];

    // Comment와 조인
    @OneToMany(() => Comment, (comment) => comment.board)
    comments: Comment[];
}