import axios from 'axios'

export class KakaoStrategy{
    async validateKakaoUser(accessToken:string){
        // user.controller.ts의 카카오로그인 에서 받아온 access_token
        try{
            // 카카오 API에 요청
            const response = await axios.get('https://kapi.kakao.com/v2/user/me',{
                headers:{
                    Authorization: `Bearer ${accessToken}`,
                }
            })
            // 요청하고 받은 값 
            const kakaoResponse = response.data

            // 카카오 로그인 서버에 요청하고 받은 정보들을 user로 정리
            const user ={
                socialId: kakaoResponse.id,
                name: kakaoResponse.kakao_account.profile.nickname,
                email: kakaoResponse.kakao_account.email,
                photo: kakaoResponse.kakao_account.profile.profile_image_url || null,
                phone_number: kakaoResponse.kakao_account.phone_number || null,
                provider:'KAKAO',
                gender: kakaoResponse.kakao_account.gender  || null,
                birthday: kakaoResponse.kakao_account.birthyear+kakaoResponse.kakao_account.birthday  || null,
            }
            // return으로 user.controller.ts의 카카오로그인에 정보를 보내준다
            return user
        }catch (error){
            console.log(error);
            throw new Error('카카오 로그인 정보를 가져오는데 실패했습니다');
        }
    }
}