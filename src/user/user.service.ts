import { ConflictException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,
    private readonly authService: AuthService,
  ){}

  // 소셜 회원가입 
  // # 구글로그인, 회원가입 # 
  async googleLogin(user) {
    const findUser = await this.userRepository.findOneBy({socialId:user.socialId, deleted:false})
    if(findUser){ 
      try{
        // JWT 토큰 발급
        const googleJwtToken = this.authService.googleLogin(findUser)
        return googleJwtToken
      }catch{
        throw new UnauthorizedException('구글 로그인 실패');
      }
    // 비활성화유저도 일반유저도 아닌경우 회원가입 실시
    }else{
    // 생일 날짜 변환 함수
    function convertBirthdayToDate(birthday: { year: number; month: number; day: number }): Date {
      const { year, month, day } = birthday;
      return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }
    // 성별 변환 
    function convertGender(gender:string):string{
      return gender.charAt(0).toUpperCase()
    }
    // 성별 값이 null이 아닐 때만 변환 실행
    const convertedGender = user.gender ? convertGender(user.gender) : null

    // 생일 값이 null이 아닐 때만 변환 실행 
    const formattedBirtday = user.birthday ? convertBirthdayToDate(user.birthday) : null

    const newUser = this.userRepository.create({
      socialId:String(user.socialId),
      name: user.name, // 이름 
      email: user.email, // 이메일 
      pictureUrl: user.photo || null, // 사진
      birthday: formattedBirtday || null, // 생년월일 
      gender: convertedGender || null, // 성별 
      socialProvider:user.provider, // 제공자 
      role: 'USER', // 역할 
    })
    const saveUser = await this.userRepository.save(newUser) // 실제 생성
    console.log(saveUser);
    const googleJwtToken = this.authService.googleLogin(saveUser)
    return googleJwtToken
    }
  }

  // 카카오 로그인, 회원가입 // 만약 카카오톡에서 정보를 수정해도 수정한 값 그대로 들어가기 
  // 만들 때 아이디가 두개가 만들어진다 
  async kakaoLogin(user){
    const findUser = await this.userRepository.findOneBy({socialId:user.socialId, deleted:false})
    if(findUser){
      try{
        // JWT 토큰 발급
        const kakaoJwtToken = this.authService.kakaoLogin(findUser)
        return kakaoJwtToken
      }catch{
        throw new UnauthorizedException('카카오 로그인 실패');
      }
    // 비활성화유저도 일반유저도 아닌경우 회원가입 실시
    }else{

      // 생년월일 변환 
      const birthday = new Date(
        `${user.birthday.slice(0,4)}-${user.birthday.slice(4,6)}-${user.birthday.slice(6,8)}`
      )
      // 전화번호 변환 
      function convertPhoneNumber(phoneNumber:string):string{
        return '0'+phoneNumber.slice(4)
      }
      // 성별 변환 
      function convertGender(gender:string):string{
        return gender.charAt(0).toUpperCase()
      }
      const convertedPhoneNumber = convertPhoneNumber(user.phone_number)
      const convertedGender = convertGender(user.gender)
      // 안되어있는 경우 createUser후 토큰 발급 
      // 생일 날짜 변환 
      const newUser = this.userRepository.create({
        socialId:String(user.socialId),
        name:user.name, // 이름
        email:user.email, // 이메일 
        pictureUrl:user.photo || null, // 사진
        birthday:birthday || null, // 생년월일 
        phoneNumber:convertedPhoneNumber || null, // 휴대폰 번호
        gender:convertedGender || null,
        socialProvider:user.provider,
        role:'USER'
      })
      const saveUser = await this.userRepository.save(newUser) // 실제 생성
      const kakaoJwtToken = this.authService.kakaoLogin(saveUser)
      return kakaoJwtToken
    }
  }
  // 본인 회원 정보 조회 
  async getProfile(socialId:string){
    return await this.userRepository.findOne({where:{socialId:socialId}})
  }

  // 회원 탈퇴(비활성화)
  async deactivateUser(socialId:string){
    return await this.userRepository.update(socialId,{deleted:true})
  }

  // 회원 복구(활성화)
  async restoreUser(socialId:string){
    return await this.userRepository.update(socialId,{deleted:false})
  }

  // 회원 정보 수정 // dto 참고, swagger로 해보기  
  async updateProfile(socialId:string, updateUserDto:UpdateUserDto, uploadedUrl:string){
    const userProfile = await this.userRepository.findOneBy({socialId:socialId})
    const id = userProfile.id
    // URL이 없으면 사진 URL 반영안함
    if(uploadedUrl.length <= 0){
      await this.userRepository.update(id,{
        name:updateUserDto.name || null,
        phoneNumber:updateUserDto.phoneNumber || null,
        description:updateUserDto.description || null
      })
    }else{
    // URL 있으면 반영함
      await this.userRepository.update(id,{
        name:updateUserDto.name,
        phoneNumber:updateUserDto.phoneNumber || null,
        description:updateUserDto.description || null,
        pictureUrl:uploadedUrl || null
      })
    }
    const userProfileUpdated = this.userRepository.findOneBy({socialId:socialId})
    return userProfileUpdated
  }
}
