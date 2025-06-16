import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatParticipantService } from 'src/chat-participant/chat-participant.service';
import { UserChatRoomService } from 'src/user-chat-room/user-chat-room.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from 'src/message/message.service';
import { Client } from 'socket.io/dist/client';
import { Message } from 'src/message/entities/message.entity';

@WebSocketGateway({ namespace: '/chat-room/join', cors: { origin: '*' } })
export class ChatRoomGateway implements OnGatewayDisconnect {
  // 소켓 ID 채팅방 ID를 저장하는 map
  private socketRoomMap = new Map<string, string>();

  constructor(
    private readonly userChatRoomService: UserChatRoomService,
    private readonly chatParticipantService: ChatParticipantService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly messageService: MessageService,
  ) {}
  @WebSocketServer() server: Server;

  // 소켓에 연결되었을 때 이벤트
  async handleConnection(client: Socket) {
    try {
      // 프론트엔드의 채팅방과 연결되었을 때 토큰을 주는데 그것을 추출
      const token = client.handshake.auth.token;

      // 토큰 유효성 검사
      const decoded = this.jwtService.verify(token);

      // 토큰에서 추출한 socialId로 유저정보 가져오기
      const user = await this.userService.getProfile(decoded.socialId);

      // 소켓과 연결되었다는 console.log
      console.log(`✅ Client connected: ${client.id} - ${user.name}`);
    } catch (error) {
      console.log('error', error);
    }
  }

  // 유저가 연결을 끊을 때 이벤트 (페이지를 나가거나 닫거나 이동하거나 )
  async handleDisconnect(client: Socket) {
    // 프론트엔드의 채팅방과 연결되었을 때 토큰을 주는데 그것을 추출
    const token = client.handshake.auth.token;

    // 토큰 유효성 검사
    const decoded = this.jwtService.verify(token);

    // 토큰에서 추출한 socialId로 유저정보 가져오기
    const user = await this.userService.getProfile(decoded.socialId);

    // map에 저장되어있는 채팅방의 아이디를 가져옴
    const roomId = this.socketRoomMap.get(client.id);

    // 유저가 연결을 끊을 때 (유저아이디, 연결끊을 채팅방아이디)
    await this.userChatRoomService.setUserChatRoomDisconnet(user.id, roomId);

    // 소켓과 연결이 끊겼다는 console.log
    console.log(`disconnected: ${client.id} - ${user.name}`);

    // roomId에 해당하는 방에 메세지로 이벤트와 메세지 전송
    this.server.to(roomId).emit('message', {
      id: Date.now().toString(),
      userName: 'System',
      message: `${user.name} 님의 연결이 끊겼습니다.`,
      createdAt: new Date().toISOString(),
      isSystem: true,
    });
  }

  // 프론트에서 보낸 채팅방 참여이벤트와 메세지 roomId를 받아들임
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatRoomId: string,
  ) {
    // 프론트엔드의 채팅방과 연결되었을 때 토큰을 주는데 그것을 추출
    const token = client.handshake.auth.token;

    // 토큰 유효성 검사
    const decoded = this.jwtService.verify(token);

    // 토큰에서 추출한 socialId로 유저정보 가져오기
    const user = await this.userService.getProfile(decoded.socialId);

    // 유저 채팅 참여 목록 가져오기
    const userChatRoomGet = await this.userChatRoomService.userChatRoomGet(
      user.id,
      chatRoomId,
    );

    // 소켓, 채팅방 매핑정보 Map에 저장
    this.socketRoomMap.set(client.id, chatRoomId);

    // 채팅방 나간 유저가 다시 채팅방에 들어오는 경우
    if (userChatRoomGet) {
      // 나간 유저 다시 활성화
      await this.userChatRoomService.userChatRoomActiveUpdate(
        user.id,
        chatRoomId,
      );
    } else {
      // 새로운 유저가 방에 들어오는 경우
      await this.userChatRoomService.userChatRoomCreateUser(
        user.id,
        chatRoomId,
      );
    }

    // 채팅방 연결이 끊긴 유저가 다시 요청해 방에 들어오는 경우 // 새로 들어오는사람도 파악함
    if (userChatRoomGet.isOnline === false) {
      // 현재 유저가 온라인 상태인지 아닌지 검사

      // 유저아이디와 채팅룸의 아이디를 userChatRoomService의 setUserChatRoomOnline로 전송
      await this.userChatRoomService.setUserChatRoomOnline(user.id, chatRoomId);
    }

    client.join(chatRoomId);

    // 참여했다는 메세지 보내기
    this.server.to(chatRoomId).emit('message', {
      id: Date.now().toString(),
      userName: 'System',
      message: `${user.name} 님이 방에 참여하셨습니다.`,
      createdAt: new Date().toISOString(),
      isSystem: true,
    });

    // 유저의 역할 보내기
    this.server.emit('role', `${userChatRoomGet.role}`);
  }

  // 메세지 전송 이벤트
  @SubscribeMessage('message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message: string; roomId: string },
  ) {
    const token = client.handshake.auth.token;
    const decoded = this.jwtService.verify(token);
    const user = await this.userService.getProfile(decoded.socialId);
    const createdAt = new Date().toISOString();

    // 메세지 DB에 저장
    const message = await this.messageService.saveMessage(
      data.roomId,
      user.id,
      data.message,
    );

    this.server.to(data.roomId).emit('message', {
      id: message.id.toString(),
      userName: user.name,
      message: data.message,
      createdAt: createdAt,
      isSystem: false,
    });
  }

  // 기존에있는 메세지 DB에서 가져오기
  @SubscribeMessage('getMessages')
  async handleGetMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const messages = await this.messageService.getMessage(data.roomId);

    const messageObject = messages.map((msg) => ({
      id: msg.id.toString(),
      userName: msg.userId.name,
      message: msg.message,
      createdAt: msg.createdAt,
      isSystem: false,
    }));

    console.log('messageObject', messageObject);
    client.emit('messages', messageObject);
  }

  // 클라이언트 채팅방 나갈 때
  @SubscribeMessage('leaveRoom')
  async handleReaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const token = client.handshake.auth.token;
    const decoded = this.jwtService.verify(token);
    const user = await this.userService.getProfile(decoded.socialId);

    await this.userChatRoomService.setUserChatRoomLeave(user.id, data.roomId);

    client.leave(data.roomId);

    this.server.to(data.roomId).emit('message', {
      id: Date.now().toString(),
      userName: 'System',
      message: `${user.name}님이 방에서 나갔습니다.`,
      createdAt: new Date().toISOString(),
      isSystem: true,
    });
  }

  // 채팅방 참여자 목록
  @SubscribeMessage('getRoomParticipants')
  async handleRoomGetParticipants(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatRoomId: string,
  ) {
    // DB에서 chatRoomId에 해당되는 채팅방 참여자목록을 가져옴
    const participants =
      await this.userChatRoomService.getRoomParticipants(chatRoomId);

    // 프론트엔드의 roomParticipants 이벤트에 채팅방 참여자목록을 전송
    client.emit('roomParticipants', participants);
  }

  // 리뷰작성요청 ->
  // 이 채팅방에 관련된 유저목록을 전부 불러오고
  // role이 USER인 사람에게만 요청하기
  @SubscribeMessage('requestReview')
  async handleReview(
    @ConnectedSocket() Client: Socket,
    @MessageBody() chatRoomId: string,
  ) {}
}