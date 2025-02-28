import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class GoogleStrategy{
    async validateGoogleUser(accessToken:string){

        // 구글API도 똑같이 요청하기
        try{
            const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo',{
                headers:{
                    Authorization: `Bearer ${accessToken}`,
                }
            })
            const googleResponse = response.data

            const responseGooglePeople = await axios.get('https://people.googleapis.com/v1/people/me?personFields=birthdays,genders,phoneNumbers',{
                headers:{
                    Authorization: `Bearer ${accessToken}`,
                }
            })

            const {genders, birthdays} = responseGooglePeople.data

            const user ={
                socialId: googleResponse.sub,
                name: googleResponse.name,
                email: googleResponse.email,
                photo:googleResponse.picture,
                provider:'GOOGLE',
                gender: genders?.[0].value || null,
                birthday: birthdays?.[0]?.date || null,
            }

            return user
        }catch(error){
            console.log(error);     
            throw new Error('구글 로그인 정보를 가져오는데 실패했습니다');

        }
    }
}