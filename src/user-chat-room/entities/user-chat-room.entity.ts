import { ChatRoom } from "src/chat-room/entities/chat-room.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { deflate } from "zlib";

@Entity()
export class UserChatRoom {
    
    // 유저채팅룸 중간테이블 아이디 
    @PrimaryGeneratedColumn()
    id:number;

    // 채팅방 아이디 chat-room 조인 
    @ManyToOne(()=> ChatRoom, (chatRoom) => chatRoom.userChatRooms)
    @JoinColumn({name:'chat_room_id'})
    chatRoomId:ChatRoom;
    
    // 유저 아이디 user 조인
    // 여러 채팅룸은 하나의 유저에 조인이 된다 
    @ManyToOne(()=> User, (user) => user.userChatRooms)
    @JoinColumn({name:'user_id'})
    userId: User;
    
    // 참가시점 
    @CreateDateColumn()
    joinAt: Date;

    // 사용자의 역할 유저/반장/비활성화
    @Column('enum',{enum:['USER','HOST'], default:'USER'}) 
    role: 'USER'|'HOST'

    // 채팅방에서 나갔는지 아닌지 
    @Column({name:'is_active', default:false})
    isActive:boolean

    // 채팅방에 연결이 되어있는지 아닌지 
    @Column({name:'is_online',default:true})
    isOnline:boolean
}
