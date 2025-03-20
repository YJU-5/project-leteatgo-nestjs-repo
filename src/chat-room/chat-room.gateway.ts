import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChatParticipantService } from 'src/chat-participant/chat-participant.service';
import { UserChatRoomService } from 'src/user-chat-room/user-chat-room.service';
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv';
import { UserService } from 'src/user/user.service';
import { Logger, Req } from '@nestjs/common';
import { RequestWithUser } from 'src/user/request.interface';
import { JwtService } from '@nestjs/jwt';
import { error } from 'console';
import { Client } from 'socket.io/dist/client';
import { Public } from 'src/decorator/public.decorator';

@WebSocketGateway({ namespace: '/chat-room/join', cors: { origin: '*' } })

export class ChatRoomGateway implements OnGatewayDisconnect  {
  // 소켓 ID 채팅방 ID를 저장하는 map 
  private socketRoomMap = new Map<string, string>()

  constructor(
    private readonly userChatRoomService: UserChatRoomService,
    private readonly chatParticipantService: ChatParticipantService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) { }
  @WebSocketServer() server: Server
  private logger : Logger= new Logger("EventsGateway")

  // HOST의 경우는 어떻게 해야할지 필요 현재로서는 USER만 구현함 03/16
  // HOST 채팅방 생성 필요 
  // 클라이언트 채팅 참여
  // Host인 경우는 또 틀림 
  // ## 연결이 끊기는 경우 다시 연결 ##
  // joinRoom 과 끊기는 경우  
  // 커넥트와 분리 

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // 실제로 채팅방 프론트로 가져와서 거기에 참여하기 

  // // 연결되었을 때 
  async handleConnection(client: Socket) {
    console.log(`on connect called : ${client.id}`); // 어떤 id 소켓이 연결됨?
    // try {
    //   const token = client.handshake.auth.token
    //   const decoded = this.jwtService.verify(token) // 토큰 유효성 검사 
    //   const user = await this.userService.getProfile(decoded.socialId) // 토큰의 socilId를 이용해서 유저 가져오기

    //   console.log(`✅ Client connected: ${client.id} - ${user.name}`);
    // } catch (error) {
    //   console.log('error', error);
    // }
  }

    // 유저가 연결을 끊을 때 (페이지를 나가거나 닫거나 이동하거나 ) 
  async handleDisconnect(client: Socket) {
    // this.logger.log(`Client Disconnected : ${client.id}`)
    // const token = client.handshake.auth.token
    // const decoded = this.jwtService.verify(token) // 토큰 유효성 검사 
    // const user = await this.userService.getProfile(decoded.socialId) // 토큰의 socilId를 이용해서 유저 가져오기

    // // 채팅방 정보 
    // const roomId = this.socketRoomMap.get(client.id)

    // // 유저가 연결을 끊을 때 
    // await this.userChatRoomService.setUserChatRoomDisconnet(user.id,roomId)
  }

  // 채팅방아이디로 실제 채팅방이 존재하는지 확인할 것 
  // 컨트롤러로 어떻게 하지? 
  @SubscribeMessage('joinRoom') // 메세지 수신(이벤트이름)
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatRoomId: string,
  ) {
    console.log('joinRoom');
    // console.log('joinRoom');
    // // 토큰 목록 
    // const token = client.handshake.auth.token
    // const decoded = this.jwtService.verify(token) // 토큰 유효성 검사 
    // const user = await this.userService.getProfile(decoded.socialId) // 토큰의 socilId를 이용해서 유저 가져오기

    // // 유저 채팅 참여 목록 가져오기 
    // const userChatRoomGet = await this.userChatRoomService.userChatRoomGet(user.id, chatRoomId)
    // const chatParticipantGetUser = await this.chatParticipantService.chatParticipantGetUser(user.id, chatRoomId)

    // // 소켓, 채팅방 매핑정보 Map에 저장 
    // this.socketRoomMap.set(client.id, chatRoomId)

    // // 채팅방 나간 유저가 다시 들어오는 경우
    // if (userChatRoomGet) {
    //   await this.userChatRoomService.userChatRoomActiveUpdate(user.id, chatRoomId)
    // } else {
    //   // 새로 방에 들어오는 경우  
    //   await this.userChatRoomService.userChatRoomCreateUser(user.id, chatRoomId)
    // }

    // // 채팅방 끊긴 유저가 다시 요청해 방에 들어오는 경우 
    // if (userChatRoomGet.isOnline === false) {
    //   await this.userChatRoomService.setUserChatRoomOnline(user.id, chatRoomId)
    // }

    // // 참가한 채팅방 관리 테이블 이미 참가한 내역이 없을경우 만들기
    // // 있으면 넘어감 
    // if (!chatParticipantGetUser) {
    //   await this.chatParticipantService.chatParticipantCreateUser(user.id, chatRoomId)
    // }

    // client.join(chatRoomId) // 클라이언트를 방에 추가 
    // this.server.to(chatRoomId).emit('message', `${client.id} 님이 방에 참여하셨습니다.`)
    this.server.emit('joinRoom',`joinRoom`)
  }

  // 유저가 연결을 끊을 때 (페이지를 나가거나 닫거나 이동하거나 ) 
  // 참가할 때 참가하고, 나가고, 참가가 된다 그리고 다른페이지로 가면 leaveRoom이 된다
  // 언마운트, 마운트
  @SubscribeMessage('userLeft')
  async handleDisconnectRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatRoomId: string,
  ) {
    console.log('userLeft');
    const token = client.handshake.auth.token
    const decoded = this.jwtService.verify(token) // 토큰 유효성 검사 
    const user = await this.userService.getProfile(decoded.socialId) // 토큰의 socilId를 이용해서 유저 가져오기

    // 채팅방 정보 
    const roomId = this.socketRoomMap.get(client.id)

    // 유저가 연결을 끊을 때 
    await this.userChatRoomService.setUserChatRoomDisconnet(user.id, roomId)

    console.log(`Client disconnected: ${client.id} - ${user.name}`);
    this.server.to(chatRoomId).emit('message',`${user.name}님 연결 끊김`)
  }

  // 클라이언트 채팅방 나갈 때 
  @SubscribeMessage('leaveRoom')
  async handleReaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatRoomId: string,
  ) {
    const token = client.handshake.auth.token
    const decoded = this.jwtService.verify(token) // 토큰 유효성 검사 
    const user = await this.userService.getProfile(decoded.socialId) // 토큰의 socilId를 이용해서 유저 가져오기

    // 참가한 채팅방 목록 삭제
    await this.chatParticipantService.chatParticipantDeleteUser(user.id, chatRoomId)

    // 나간 유저 비활성화 
    await this.userChatRoomService.setUserChatRoomLeave(user.id, chatRoomId)

    // Host가 나갈 경우 
    client.leave(chatRoomId)
    this.server.to(chatRoomId).emit('message', `${user.name}님이 방에서 나갔습니다.`)
  }

  // 메세지 수신 -> 송신
  // 메세지 저장 필요 
  // postMan 검사 : 두 번 보내진다 
  @SubscribeMessage('message')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message: string; roomId: string },
  ) {
    console.log('message');
    // const token = client.handshake.auth.token
    // const decoded = this.jwtService.verify(token) // 토큰 유효성 검사 
    // const user = await this.userService.getProfile(decoded.socialId) // 토큰의 socilId를 이용해서 유저 가져오기

    // 메시지를 해당 방에 있는 모든 클라이언트에게 전송
    this.server.emit('message',`테스트 완료`)
  }
}
