import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatParticipantService } from 'src/chat-participant/chat-participant.service';
import { UserChatRoomService } from 'src/user-chat-room/user-chat-room.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from 'src/message/message.service';
import { Client } from 'socket.io/dist/client';
import { Message } from 'src/message/entities/message.entity';

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


  // 소켓에 연결되었을 때 이벤트 
  async handleConnection(client: Socket) {
    try {
      // 프론트엔드의 채팅방과 연결되었을 때 토큰을 주는데 그것을 추출 
      const token = client.handshake.auth.token

      // 토큰 유효성 검사 
      const decoded = this.jwtService.verify(token) 

      // 토큰에서 추출한 socialId로 유저정보 가져오기 
      const user = await this.userService.getProfile(decoded.socialId)

      // 소켓과 연결되었다는 console.log  
      console.log(`✅ Client connected: ${client.id} - ${user.name}`);

    } catch (error) {
      console.log('error', error);
    }
  }

  // 유저가 연결을 끊을 때 이벤트 (페이지를 나가거나 닫거나 이동하거나 ) 
  async handleDisconnect(client: Socket) {

    // 프론트엔드의 채팅방과 연결되었을 때 토큰을 주는데 그것을 추출 
    const token = client.handshake.auth.token

    // 토큰 유효성 검사 
    const decoded = this.jwtService.verify(token) 

    // 토큰에서 추출한 socialId로 유저정보 가져오기 
    const user = await this.userService.getProfile(decoded.socialId)

    // map에 저장되어있는 채팅방의 아이디를 가져옴  
    const roomId = this.socketRoomMap.get(client.id)

    // 유저가 연결을 끊을 때 (유저아이디, 연결끊을 채팅방아이디)
    await this.userChatRoomService.setUserChatRoomDisconnet(user.id,roomId)

    // 소켓과 연결이 끊겼다는 console.log 
    console.log(`disconnected: ${client.id} - ${user.name}`);

    // roomId에 해당하는 방에 메세지로 이벤트와 메세지 전송 
    this.server.to(roomId).emit('message', `${user.name} 님의 연결이 끊겼습니다.`)
  }

  // 프론트에서 보낸 채팅방 참여이벤트와 메세지 roomId를 받아들임 
  @SubscribeMessage('joinRoom') // 이벤트이름 
  async handleJoinRoom(
    @ConnectedSocket() client: Socket, // 어떤 소켓에 해당되는지 
    @MessageBody() chatRoomId: string, // 메세지에 해당되는 roomId를 받아들임 
  ) {
    // 프론트엔드의 채팅방과 연결되었을 때 토큰을 주는데 그것을 추출 
    const token = client.handshake.auth.token

    // 토큰 유효성 검사 
    const decoded = this.jwtService.verify(token) 
 
    // 토큰에서 추출한 socialId로 유저정보 가져오기 
    const user = await this.userService.getProfile(decoded.socialId)
    
    // 유저 채팅 참여 목록 가져오기 
    const userChatRoomGet = await this.userChatRoomService.userChatRoomGet(user.id, chatRoomId)

    // 소켓, 채팅방 매핑정보 Map에 저장 
    this.socketRoomMap.set(client.id, chatRoomId)

    // 채팅방 나간 유저가 다시 채팅방에 들어오는 경우
    if (userChatRoomGet) {
      // 나간 유저 다시 활성화 
      await this.userChatRoomService.userChatRoomActiveUpdate(user.id, chatRoomId)
    } else {

      // 새로운 유저가 방에 들어오는 경우  
      await this.userChatRoomService.userChatRoomCreateUser(user.id, chatRoomId)
    }

    // 채팅방 연결이 끊긴 유저가 다시 요청해 방에 들어오는 경우 // 새로 들어오는사람도 파악함 
    if (userChatRoomGet.isOnline === false) { // 현재 유저가 온라인 상태인지 아닌지 검사 

      // 유저아이디와 채팅룸의 아이디를 userChatRoomService의 setUserChatRoomOnline로 전송 
      await this.userChatRoomService.setUserChatRoomOnline(user.id, chatRoomId)
    }

    client.join(chatRoomId) // 유저를 방에 추가 

    // 참여했다는 메세지 보내기 
    this.server.to(chatRoomId).emit('message', `${user.name} 님이 방에 참여하셨습니다.`)

    console.log(userChatRoomGet.role)
    // 유저의 역할 보내기
    client.emit('role',`${userChatRoomGet.role}`)
  }

  // 메세지 전송 이벤트 
  @SubscribeMessage('message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message: string; roomId: string }, // 메세지 이벤트가 전송한 채팅룸 아이디와 메세지내용
  ) {
    const token = client.handshake.auth.token
    const decoded = this.jwtService.verify(token) // 토큰 유효성 검사 
    const user = await this.userService.getProfile(decoded.socialId) // 토큰의 socilId를 이용해서 유저 가져오기

    // 메세지 DB에 저장 
    const message = await this.messageService.saveMessage(data.roomId,user.id,data.message) 

    this.server.to(data.roomId).emit('message',`${user.name}: ${data.message}`)
  }

  // 기존에있는 메세지 DB에서 가져오기
  @SubscribeMessage('getMessages')
  async handleGetMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {roomId: string},
  ){
    // DB에 있는 메세지를 불러오기 
    const messages = await this.messageService.getMessage(data.roomId)

    // 가져온 메세지 목록을 배열로 저장 
    const messageArray = messages.map(msg=>`${msg.userId.name}:${msg.message}`)

    // 프론트에 messages 이벤트로 전송 
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

    client.leave(data.roomId)
    // 프론트엔드의 message이벤트에 메세지 전송 
    this.server.to(data.roomId).emit('message', `${user.name}님이 방에서 나갔습니다.`)
  }

  // 채팅방 참여자 목록 
  @SubscribeMessage('getRoomParticipants')
  async handleRoomGetParticipants(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatRoomId: string,
  ){
    // DB에서 chatRoomId에 해당되는 채팅방 참여자목록을 가져옴 
    const participants = await this.userChatRoomService.getRoomParticipants(chatRoomId)

    // 프론트엔드의 roomParticipants 이벤트에 채팅방 참여자목록을 전송 
    client.emit('roomParticipants', participants)
  }

  // 리뷰작성요청 -> 
  // 이 채팅방에 관련된 유저목록을 전부 불러오고 
  // role이 USER인 사람에게만 요청하기 
  @SubscribeMessage('requestReview')
  async handleReview(
    @ConnectedSocket() Client:Socket,
    @MessageBody() chatRoomId:string,
  ){
  }
  
}
