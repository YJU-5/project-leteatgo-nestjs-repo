import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class GoogleStrategy{
    async validateGoogleUser(accessToken:string){
        // user.controller.ts의 구글로그인 에서 받아온 access_token

        try{
            // 구글 API에 요청
            const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo',{
                headers:{
                    Authorization: `Bearer ${accessToken}`,
                }
            })
            // 요청하고 받은 값 
            const googleResponse = response.data

            // 생일, 성별, 휴대폰번호(구글보안때문에 인증이 필요함)를 받기위해 구글 피플API에 요청 
            const responseGooglePeople = await axios.get('https://people.googleapis.com/v1/people/me?personFields=birthdays,genders,phoneNumbers',{
                headers:{
                    Authorization: `Bearer ${accessToken}`,
                }
            })

            // 요청하고 받은 값 (성별, 생일)
            const {genders, birthdays} = responseGooglePeople.data

            // 구글 로그인 서버에 요청하고 받은 정보들을 user로 정리
            const user ={
                socialId: googleResponse.sub,
                name: googleResponse.name,
                email: googleResponse.email,
                photo:googleResponse.picture || null,
                provider:'GOOGLE',
                gender: genders?.[0].value || null,
                birthday: birthdays?.[0]?.date || null,
            }
            // return으로 user.controller.ts의 구글로그인에 정보를 보내준다
            return user
        }catch(error){
            console.log(error);     
            throw new Error('구글 로그인 정보를 가져오는데 실패했습니다');
        }
    }
}