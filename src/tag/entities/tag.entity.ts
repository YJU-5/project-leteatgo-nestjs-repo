import { ChatRoom } from "src/chat-room/entities/chat-room.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Tag {

    // 태그 아이디 
    @PrimaryGeneratedColumn()
    id:number

    // 태그 이름 
    @Column()
    name:string

    // 중간테이블 자동생성 
    @ManyToMany(()=> ChatRoom, (chatRoom) => chatRoom.tags, {onDelete:'CASCADE'})
    @JoinTable() // 중간테이블 자동생성 Tag가 주 테이블 
    chatRooms: ChatRoom[]

}
