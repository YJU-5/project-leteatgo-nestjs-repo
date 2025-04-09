import { ChatRoom } from '../../chat-room/entities/chat-room.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Category {
  // 카테고리 아이디
  @PrimaryGeneratedColumn()
  id: number;

  // 카테고리 이름
  @Column()
  name: string;

  // 중간테이블 자동생성
  @ManyToMany(() => ChatRoom, (chatRoom) => chatRoom.categories, {
    onDelete: 'CASCADE',
  })
  @JoinTable() // 중간테이블 자동생성 Category가 주 테이블
  chatRooms: ChatRoom[];
}
