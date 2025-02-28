import axios from 'axios'

export class KakaoStrategy{
    async validateKakaoUser(accessToken:string){
        try{
            const response = await axios.get('https://kapi.kakao.com/v2/user/me',{
                headers:{
                    Authorization: `Bearer ${accessToken}`,
                }
            })
            const kakaoResponse = response.data
            // 유저 정보 추출 
            const user ={
                socialId: kakaoResponse.id,
                name: kakaoResponse.kakao_account.profile.nickname,
                email: kakaoResponse.kakao_account.email,
                photo: kakaoResponse.kakao_account.profile.profile_image_url,
                phone_number: kakaoResponse.kakao_account.phone_number,
                provider:'KAKAO',
                gender: kakaoResponse.kakao_account.gender,
                birthday: kakaoResponse.kakao_account.birthyear+kakaoResponse.kakao_account.birthday,
            }
            return user
        }catch (error){
            console.log(error);
            throw new Error('카카오 로그인 정보를 가져오는데 실패했습니다');
        }
    }
}