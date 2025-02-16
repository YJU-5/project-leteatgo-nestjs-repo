import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryColumn, CreateDateColumn, JoinColumn } from "typeorm";

@Entity()
export class ChatRoom {

    // 채팅방 아이디
    @PrimaryColumn('uuid')
    id:string;

    // 개최자 아이디 (User와 조인인)
    @ManyToOne(()=>User,(users)=> users.chatRooms,{onDelete:'CASCADE'})
    @JoinColumn({name:'host_id'})
    hostId:User;

    // 소셜다이닝 제목 
    @Column()
    title:string;

    // 소셜다이닝 설명 
    @Column()
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
    @CreateDateColumn({name:'updated_at'})
    updatedAt:Date;

    // 활성화 여부 
    @Column({type:'tinyint',default:1,name:'is_active'})
    isActive:number


}
