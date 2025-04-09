import { ChatRoom } from '../../chat-room/entities/chat-room.entity';
import { User } from '../../user/entities/user.entity';
import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
@Entity()
export class ChatParticipant {
  // 참가한 채팅방 관리 테이블 아이디
  @PrimaryGeneratedColumn()
  id: number;

  // 채팅방아이디
  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.messages)
  @JoinColumn({ name: 'chat_room_id' })
  chatRoomId: ChatRoom;

  // 유저아이디
  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: 'user_id' })
  userId: User;

  // 만들어진 날짜
  @CreateDateColumn({ name: 'created_at' }) // 생성일시 자동 생성
  createdAt: Date;
}
