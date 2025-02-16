import { ChatRoom } from "src/chat-room/entities/chat-room.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany,CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message {
    
    // 메세지 아이디 
    @PrimaryGeneratedColumn()
    id:number;

    // 채팅방 아이디 
    @ManyToOne(()=> ChatRoom,(chatRoom) => chatRoom.messages)
    @JoinColumn({name:'chat_room_id'})
    chatRoomId : ChatRoom 
    
    // 메세지 보낸 사용자 아이디 
    @ManyToOne(()=> User,(user) => user.messages)
    @JoinColumn({name:'user_id'})
    userId : User

    // 내용 
    @Column()
    message: string

    // 사진 
    @Column({name:'picture_url',nullable:true})
    pictureUrl:string;

    // 만들어진 날짜 
    @CreateDateColumn({name:'created_at'}) // 생성일시 자동 생성 
    createdAt: Date;
}
