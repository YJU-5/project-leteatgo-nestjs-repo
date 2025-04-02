# DB 접속 명령어 docker exec -it postgres_db psql -U root -d project_5team
# \dt 테이블 확인 
# \d <테이블이름> : 테이블구조 확인 

# https://cdragon.tistory.com/entry/NestJS-Guard-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0-feat-athentication-athorization-%EC%9D%B8%EC%A6%9D%EA%B3%BC-%EC%9D%B8%EA%B0%80 가드설정법

sudo chown -R $USER:$USER /home/jit/LetEatGo/backend/node_modules

# 개선사항 
-   메세지 일정기간 내에 불러오기 DB 
-   사진,위치의 정보도 보낼 수 있게

# 리뷰 
-   프론트에서 리뷰요청 -> 백에서 
-   브랜치만들고 -> 이슈만들기 



# 웹소캣, 실시간채팅 학습
emit : 메시지를 특정 이벤트 이름과 함께 전송하는 데 사용 (송신자에게 메시지를 보내는 방법)

on : 특정 이벤트 이름을 수신하는 데 사용 