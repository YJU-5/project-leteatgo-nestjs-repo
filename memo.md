# DB 접속 명령어 docker exec -it postgres_db psql -U root -d project_5team
# \dt 테이블 확인 
# \d <테이블이름> : 테이블구조 확인 

# 수정, 로그아웃, 탈퇴 기능 구현 필요 02/25 -> 어떤 정보를 수정할 수 있게 해야하는지 회의, 얘기나눠보기
# 가입된 소셜로그인 정보 수정시 어떻게?
# https://cdragon.tistory.com/entry/NestJS-Guard-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0-feat-athentication-athorization-%EC%9D%B8%EC%A6%9D%EA%B3%BC-%EC%9D%B8%EA%B0%80 가드설정법

# 수정 : 본문, 사진, 전화번호, 이름, 주소, 
# 복구요청 : 로그인을 하고 이 계정이 비활성화되어있으니 거기서 복구요청하기

sudo chown -R $USER:$USER /home/jit/LetEatGo/backend/node_modules

jwt : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imd1ZHRqczEwMDRzZEBnbWFpbC5jb20iLCJuYW1lIjoi6rmA7ZiV7ISgIiwic29jaWFsSWQiOjM5MzUzMjk0NzcsImlhdCI6MTc0MDYzNzI5NiwiZXhwIjoxNzQwOTM5Njk2fQ.XDtG1coyJCiWtGL93mpR-1kU3Zjyk_nfMn3RNwgDwUA

https://www.googleapis.com/oauth2/v3/userinfo