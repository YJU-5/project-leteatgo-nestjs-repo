import { Category } from "src/category/entities/category.entity";
import { ChatParticipant } from "src/chat-participant/entities/chat-participant.entity";
import { Message } from "src/message/entities/message.entity";
import { Review } from "src/review/entities/review.entity";
import { Tag } from "src/tag/entities/tag.entity";
import { UserChatRoom } from "src/user-chat-room/entities/user-chat-room.entity";
import { User } from "src/user/entities/user.entity";
import { Column,UpdateDateColumn, Entity, ManyToOne, PrimaryColumn,PrimaryGeneratedColumn, CreateDateColumn, JoinColumn, OneToMany, ManyToMany } from "typeorm";
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';

@Entity()
export class ChatRoom {

    // 채팅방 아이디
    @PrimaryGeneratedColumn('uuid')
    id:string;

    // 개최자 아이디 (User와 조인인)
    @ManyToOne(()=>User,(users)=> users.chatRooms,{onDelete:'CASCADE'})
    @JoinColumn({name:'host_id'})
    hostId:User;

    // Review와 조인 
    @OneToMany(()=> Review, (review) => review.chatRoom)
    reviews: Review[]

    // 소셜다이닝 제목 
    @Column()
    title:string;

    // 소셜다이닝 설명 
    @Column({type:'text'})
    description:string;

    // 소셜다이닝 상태 
    @Column('enum',{enum:['IN_PROGRESS','COMPLETED ']})
    status:string;

    // 소셜다이닝 시작 일시 
    @Column('date',{name:'start_date'})
    startDate:Date;

    // 최대참가자 수 
    @Column({type: 'smallint',name:'max_participants'})
    maxParticipants:number;

    // 성별 
    @Column('enum',{enum:['M','F']})
    gender:string;

    // 사진 
    @Column({name:'picture_url',nullable:true})
    pictureUrl:string;

    // 최소나이 
    @Column({type:'smallint',name:'min_age'})
    minAge:number;

    // 최대나이 
    @Column({type:'smallint',name:'max_age'})
    maxAge:number;

    // 위도
    @Column({type:'decimal',precision:9, scale:6})
    latitube: number;

    // 경도 
    @Column({type:'decimal',precision:9, scale:6})
    longitude: number;

    // 가격
    @Column()
    price:number

    // 생성날짜
    @CreateDateColumn({name:'created_at'}) // 생성일시 자동 생성 
    createdAt: Date;

    // 수정날짜
    @UpdateDateColumn({name:'updated_at'})
    updatedAt:Date;

    // 활성화 여부 
    @Column({type:'smallint',default:1,name:'is_active'})
    isActive:number

    // 메세지와 chatRoom 조인 
    @OneToMany(()=> Message,(message) => message.chatRoomId)
    messages:Message[]

    // 유저 채팅 룸 (유저와 채팅룸의 중간테이블) 과 조인
    @OneToMany(()=> UserChatRoom, (userChatRoom) => userChatRoom.chatRoomId)
    userChatRooms:UserChatRoom[]

    // 카테고리와 chatRoom의 중간테이블 생성 관계 
    @ManyToMany(()=> Category, (category) => category.chatRooms)
    categories: Category[];

    // 태그와 chatRoom의 중간테이블 생성 관계  
    @ManyToMany(()=> Tag, (tag) => tag.chatRooms)
    tags: Tag[]

    // ChatParticipant와 조인 
    @OneToMany(()=> ChatParticipant,(chatParticipant) => chatParticipant.chatRoomId)
    chatParticipants: ChatParticipant[]

    // Restaurant와 조인
    @OneToMany(() => Restaurant, (restaurant) => restaurant.chatRoom)
    restaurants: Restaurant[];
}
