import { ChatRoom } from "src/chat-room/entities/chat-room.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, CreateDateColumn } from "typeorm";

@Entity()
export class Review {

    // 리뷰아이디 
    @PrimaryColumn('uuid')
    id:string;

    // 채팅방아이디 (chat-room과 조인인)
    @ManyToOne(()=> ChatRoom, (chatroom) => chatroom.reviews, {onDelete:'CASCADE'})
    @JoinColumn({name:'chat_room_id'})
    chatRoom: ChatRoom

    // 평가한 유저 
    @ManyToOne(()=> User, (user) => user.givenReviews)
    @JoinColumn({name:'reviewer_id'})
    reviewer : User;

    // 평가 받은 유저
    @ManyToOne(()=> User, (user) => user.receivedReviews)
    @JoinColumn({name:'reviewee_id'})
    reviewee : User;
    
    // 평가내용 
    @Column()
    description:string

    // 사진 
    @Column({name:'picture_url',nullable:true})
    pictureUrl:string;

    // 친절함 
    @Column({type:'tinyint'})
    kindness:number

    // 유머 
    @Column({type:'tinyint'})
    humor:number

    // 적극성 
    @Column({type:'tinyint'})
    activeness:number

    // 요리 
    @Column({type:'tinyint'})
    cook:number

    // 약속준수 
    @Column({type:'tinyint'})
    compliance:number

    // 평가 생성 시간 
    @CreateDateColumn({name:'created_at'}) // 생성일시 자동 생성 
    createdAt: Date;

    // 평가 수정 시간
    @CreateDateColumn({name:'updated_at'})
    updatedAt:Date; 

    // 리뷰 활성화 여부
    @Column({type:'tinyint',default:1,name:'is_active'})
    isActive:number 
}
