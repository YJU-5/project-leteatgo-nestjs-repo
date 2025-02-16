import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChatRoom } from 'src/chat-room/entities/chat-room.entity';

@Entity()
export class Restaurant {
    // 레스토랑 ID 
    @PrimaryGeneratedColumn('uuid')
    restaurantId: string;

    // 채팅방 ID 
    @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.restaurants, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chat_room_id' })
    chatRoom: ChatRoom;

    // 레스토랑 이름
    @Column({ type: 'varchar', length: 255, nullable: false })
    restaurantName: string;

    // 도로명 주소
    @Column({ type: 'varchar', length: 255, nullable: false })
    address: string;

    // 위도 
    @Column({ type: 'double precision', nullable: false })
    latitude: number;

    // 경도 
    @Column({ type: 'double precision', nullable: false })
    longitude: number;
}