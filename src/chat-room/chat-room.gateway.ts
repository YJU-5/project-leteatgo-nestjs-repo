import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatParticipantService } from 'src/chat-participant/chat-participant.service';
import { UserChatRoomService } from 'src/user-chat-room/user-chat-room.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway({ namespace: '/chat-room/join', cors: { origin: '*' } })

export class ChatRoomGateway implements OnGatewayDisconnect  {
  // 소켓 ID 채팅방 ID를 저장하는 map 
  private socketRoomMap = new Map<string, string>()

  constructor(
    private readonly userChatRoomService: UserChatRoomService,
    private readonly chatParticipantService: ChatParticipantService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly messageService: MessageService,
  ) { }
  @WebSocketServer() server: Server

  // HOST의 경우는 어떻게 해야할지 필요 현재로서는
  // Host인 경우는 또 틀림 

  
  // 연결되었을 때 
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token
      const decoded = this.jwtService.verify(token) // 토큰 유효성 검사 
      const user = await this.userService.getProfile(decoded.socialId) // 토큰의 socilId를 이용해서 유저 가져오기

      console.log(`✅ Client connected: ${client.id} - ${user.name}`);

    } catch (error) {
      console.log('error', error);
    }
  }

  // 유저가 연결을 끊을 때 (페이지를 나가거나 닫거나 이동하거나 ) 
  async handleDisconnect(client: Socket) {

    const token = client.handshake.auth.token
    const decoded = this.jwtService.verify(token) // 토큰 유효성 검사 
    const user = await this.userService.getProfile(decoded.socialId) // 토큰의 socilId를 이용해서 유저 가져오기

    // 채팅방 정보 
    const roomId = this.socketRoomMap.get(client.id)

    // 유저가 연결을 끊을 때 
    await this.userChatRoomService.setUserChatRoomDisconnet(user.id,roomId)
    console.log(`disconnected: ${client.id} - ${user.name}`);

    this.server.to(roomId).emit('message', `${user.name} 님의 연결이 끊겼습니다.`)
  }

  // 채팅방아이디로 실제 채팅방이 존재하는지 확인할 것 
  // 컨트롤러로 어떻게 하지? 
  // 제한조건을 구현할 필요가 있음, 나이, 성별 등 
  @SubscribeMessage('joinRoom') // 메세지 수신(이벤트이름)
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatRoomId: string,
  ) {
    // 토큰 목록 
    const token = client.handshake.auth.token
    const decoded = this.jwtService.verify(token) // 토큰 유효성 검사 
    const user = await this.userService.getProfile(decoded.socialId) // 토큰의 socilId를 이용해서 유저 가져오기
    // 유저 채팅 참여 목록 가져오기 
    const userChatRoomGet = await this.userChatRoomService.userChatRoomGet(user.id, chatRoomId)
    const chatParticipantGetUser = await this.chatParticipantService.chatParticipantGetUser(user.id, chatRoomId)

    // 소켓, 채팅방 매핑정보 Map에 저장 
    this.socketRoomMap.set(client.id, chatRoomId)

    // 채팅방 나간 유저가 다시 들어오는 경우
    if (userChatRoomGet) {
      await this.userChatRoomService.userChatRoomActiveUpdate(user.id, chatRoomId)
    } else {
      // 새로 방에 들어오는 경우  
      await this.userChatRoomService.userChatRoomCreateUser(user.id, chatRoomId)
    }

    // 채팅방 끊긴 유저가 다시 요청해 방에 들어오는 경우 
    if (userChatRoomGet.isOnline === false) {
      await this.userChatRoomService.setUserChatRoomOnline(user.id, chatRoomId)
    }

    // 참가한 채팅방 관리 테이블 이미 참가한 내역이 없을경우 만들기
    // 있으면 넘어감 
    if (!chatParticipantGetUser) {
      await this.chatParticipantService.chatParticipantCreateUser(user.id, chatRoomId)
    }

    client.join(chatRoomId) // 클라이언트를 방에 추가 
    this.server.to(chatRoomId).emit('message', `${user.name} 님이 방에 참여하셨습니다.`)
  }

  // 메세지 전송
  @SubscribeMessage('message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message: string; roomId: string },
  ) {
    const token = client.handshake.auth.token
    const decoded = this.jwtService.verify(token) // 토큰 유효성 검사 
    const user = await this.userService.getProfile(decoded.socialId) // 토큰의 socilId를 이용해서 유저 가져오기

    const message = await this.messageService.saveMessage(data.roomId,user.id,data.message)

    this.server.to(data.roomId).emit('message',`${user.name}: ${data.message}`)
  }

  // 기존에있는 메세지 가져오기
  @SubscribeMessage('getMessages')
  async handleGetMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {roomId: string},
  ){
    const messages = await this.messageService.getMessage(data.roomId)
    const messageArray = messages.map(msg=>`${msg.userId.name}:${msg.message}`)

    client.emit('messages',messageArray)
  }

  // 클라이언트 채팅방 나갈 때 
  @SubscribeMessage('leaveRoom')
  async handleReaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data:{roomId: string},
  ) {
    const token = client.handshake.auth.token
    const decoded = this.jwtService.verify(token) // 토큰 유효성 검사 
    const user = await this.userService.getProfile(decoded.socialId) // 토큰의 socilId를 이용해서 유저 가져오기

    // 나간 유저 비활성화 
    await this.userChatRoomService.setUserChatRoomLeave(user.id, data.roomId)

    // Host가 나갈 경우
    // 채팅방 폭파 ?
    client.leave(data.roomId)
    this.server.to(data.roomId).emit('message', `${user.name}님이 방에서 나갔습니다.`)
  }

  // 채팅방 참여자 목록 
  @SubscribeMessage('getRoomParticipants')
  async handleRoomGetParticipants(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatRoomId: string,
  ){
    const participants = await this.userChatRoomService.getRoomParticipants(chatRoomId)
    console.log(participants);
    client.emit('roomParticipants', participants)
  }
}
