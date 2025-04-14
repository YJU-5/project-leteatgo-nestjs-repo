# POSTGRES DB 접속 명령어 (터미널에서)
# DB 접속 명령어 docker exec -it postgres_db psql -U root -d project_5team
# \dt 테이블 확인 
# \d <테이블이름> : 테이블구조 확인 
# 접속 후 사용 예시 
# project_5team=# 

project_5team=# \dt (테이블 확인 명령어 입력)
                   List of relations
 Schema |             Name              | Type  | Owner 
--------+-------------------------------+-------+-------
 public | board                         | table | root
 public | category                      | table | root
 public | category_chat_rooms_chat_room | table | root
 public | chat_participant              | table | root
 public | chat_room                     | table | root
 public | comment                       | table | root
 public | like                          | table | root
 public | message                       | table | root
 public | notification                  | table | root
 public | restaurant                    | table | root
 public | review                        | table | root
 public | subscription                  | table | root
 public | tag                           | table | root
 public | tag_chat_rooms_chat_room      | table | root
 public | user                          | table | root
 public | user_chat_room                | table | root
(16 rows)

# 테이블 확인 후 입력 
# 예시 : select * from "user";  ""; 이 형태를 지켜주어야함 아니면 오류남

# 개선사항 
-   메세지 일정기간 내에 불러오기 DB 
-   사진,위치의 정보도 보낼 수 있게

# 리뷰 


# 웹소캣, 실시간채팅 학습
emit : 메시지를 특정 이벤트 이름과 함께 전송하는 데 사용 (송신자에게 메시지를 보내는 방법)

on : 특정 이벤트 이름을 수신하는 데 사용 

client.emit(...) : 자신에게만 전송

this.server.emit(...): 서버에 연결된 모든 클라이언트

this.server.to(roomId).emit(...) : 특정 채팅방 사용자에게 전송