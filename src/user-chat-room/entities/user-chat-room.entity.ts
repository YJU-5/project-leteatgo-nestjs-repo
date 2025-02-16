import { ChatRoom } from "src/chat-room/entities/chat-room.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserChatRoom {
    
    // 유저채팅룸 중간테이블 아이디 
    @PrimaryGeneratedColumn()
    id:number;

    // 채팅방 아이디 chat-room 조인 
    @ManyToOne(()=> ChatRoom, (chatRoom) => chatRoom.userChatRooms)
    @JoinColumn({name:'chat_room_id'})
    chatRoomId:ChatRoom[];
    
    // 유저 아이디 user 조인
    @ManyToOne(()=> User, (user) => user.userChatRooms)
    @JoinColumn({name:'user_id'})
    userId: User[];
    
    // 참가시점 
    @CreateDateColumn()
    joinAt: Date;

    // 사용자의 역할
    @Column('enum',{enum:['USER','HOST']}) 
    role:string;

}
