import { ChatParticipant } from "src/chat-participant/entities/chat-participant.entity";
import { ChatRoom } from "src/chat-room/entities/chat-room.entity";
import { Message } from "src/message/entities/message.entity";
import { Review } from "src/review/entities/review.entity";
import { UserChatRoom } from "src/user-chat-room/entities/user-chat-room.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, Unique } from "typeorm";
import { Board } from "src/board/entities/board.entity"; // Board 엔티티 import 추가
import { Like } from 'src/like/entities/like.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { Notification } from 'src/notification/entities/notification.entity';

@Entity()
@Unique(['socialId'])
export class User {

    // 유저아이디
    @PrimaryGeneratedColumn('uuid')
    id:string;

    // 이름
    @Column({type:'varchar', length:50})
    name:string;

    // 이메일 
    @Column({type:'varchar', length:320})
    email:string;

    // 전화번호 
    @Column({type:'varchar',length:30,name:'phone_number',nullable:true}) 
    phoneNumber:string;

    // 생년월일 
    @Column('date',{nullable:true})
    birthday:Date;

    // 성별 
    @Column('enum',{enum:['M','F'],nullable:true})
    gender:string;

    // 사진 
    @Column({name:'picture_url',nullable:true})
    pictureUrl:string;

    // 소개문 
    @Column({type:'text',nullable:true})
    description:string;

    // 유저역할 
    @Column('enum',{enum:['USER','ADMIN']})
    role:string;

    // 소셜로그인 제공자 
    @Column('enum',{enum:['GOOGLE','KAKAO'],name:'social_provider'})
    socialProvider:string;

    // 소셜로그인 고유ID
    @Column({ name: 'social_id' }) // 소셜로그인 고유 아이디
    socialId:string;

    // 등록날짜
    @CreateDateColumn({name:'created_at'}) // 생성일시 자동 생성 
    createdAt: Date;

    // 수정날짜
    @UpdateDateColumn({name:'updated_at'})
    updatedAt:Date;

    // 유저 비활성화(탈퇴)
    @Column({default: false})
    deleted:boolean

    // UserChatRoom과 조인 
    // 하나의 유저는 자기가 참여한 여러 채팅룸 정보를 가질 수 있다 
    @OneToMany(()=>UserChatRoom,(userChatRoom) => userChatRoom.userId)
    userChatRooms: UserChatRoom[];

    // ChatRoom과 조인 
    // 하나의 유저는 여러 채팅룸을 가질 수 있다 (자기가 개최한) 
    @OneToMany(()=>ChatRoom,(chatRoom) => chatRoom.hostId)
    chatRooms:ChatRoom[];

    // review와 조인 (평가한 유저)
    // 하나의 유저는 자기가 작성한 여러 리뷰를 가질 수 있다 
    @OneToMany(()=>Review, (review) => review.reviewer)
    givenReviews : Review[]
    
    // review와 조인 (평가받은 유저)
    // 하나의 유저는 여러 리뷰를 받을 수 있다  
    @OneToMany(()=>Review, (review) => review.reviewee)
    receivedReviews: Review[]

    // message와 조인 
    // 하나의 유저는 여러 메세지를 가질 수 있다 
    @OneToMany(()=>Message, (message)=> message.userId)
    messages: Message[]

    // ChatParticipant와 조인 
    // 하나의 유저는 여러 채팅방에 참가한 목록을 가질 수 있다 
    @OneToMany(()=>ChatParticipant,(chatParticipant) => chatParticipant.userId)
    chatParticipants:ChatParticipant

    // Board와 조인
    // 하나의 유저는 여러 게시물을 가질 수 있다 
    @OneToMany(() => Board, (board) => board.user)
    boards: Board[];

    // Like와 조인
    // 하나의 유저는 여러 개의 좋아요를 가질 수 있다 
    @OneToMany(() => Like, (like) => like.user)
    likes: Like[];

    // Comment와 조인
    // 하나의 유저는 여러개의 댓글을 가질 수 있다 
    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[];

    // 내가 구독한 유저들
    // 하나의 유저는 여러명의 구독을 가질 수 있다 
    @OneToMany(() => Subscription, (subscription) => subscription.subscriber)
    subscriptions: Subscription[];

    // 나를 구독한 유저들
    // 하나의 유저는 여러명의 구독자들을 가질 수 있다 
    @OneToMany(() => Subscription, (subscription) => subscription.subscribedUser)
    subscribers: Subscription[];

    // Notification과 조인
    // 하나의 유저는 여러 알림을 가질 수 있다 
    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];
}