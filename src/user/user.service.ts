import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
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
  async googleLogin(req) {
    const findUser = await this.userRepository.findOneBy({socialId:req.user.socialId})
    // 회원가입이 되어있는 경우 로그인 
    if(findUser){
      try{
        // JWT 토큰 발급
        const googleJwtToken = this.authService.googleLogin(req)
        return googleJwtToken
      }catch{
        throw new UnauthorizedException('로그인 실패');
      }

    }else{ // 안되어있는 경우 createUser 후 토큰발급 

    // 생일 날짜 변환 함수
    function convertBirthdayToDate(birthday: { year: number; month: number; day: number }): Date {
      const { year, month, day } = birthday;
      return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }
    const formattedBirtday = convertBirthdayToDate(req.user.birthday)
    console.log('formattedBirtday',formattedBirtday);

    const newUser = this.userRepository.create({
      name: req.user.name, // 이름 
      email: req.user.email, // 이메일 
      pictureUrl: req.user.photo, // 사진
      birthday: formattedBirtday, // 생년월일 
      gender: req.user.gender, // 성별 
      socialProvider:req.user.provider, // 제공자 
      role: 'USER', // 역할 
    })
    // const saveUser = await this.userRepository.save(newUser)
    const googleJwtToken = this.authService.googleLogin(req)
    return googleJwtToken
    }
  }

  // 카카오 로그인, 회원가입 
  async kakaoLogin(user){
    const findUser = await this.userRepository.findOneBy({socialId:user.socialId})
    // 회원가입이 되어있는 경우 로그인 
    if(findUser){
      try{
        // JWT 토큰 발급
        const kakaoJwtToken = this.authService.kakaoLogin(user)
        return kakaoJwtToken
      }catch{
        throw new UnauthorizedException('로그인 실패');
      }
    }else{

      // 생년월일 변환 
      const birthday = new Date(
        `${user.birthday.slice(0,4)}-${user.birthday.slice(4,6)}-${user.birthday.slice(6,8)}`
      )
      // 전화번호 변환 
      function convertPhoneNumber(phoneNumber:string):string{
        return '0'+phoneNumber.slice(4)
      }
      const convertedPhoneNumber = convertPhoneNumber(user.phone_number)

      // 안되어있는 경우 createUser후 토큰 발급 
      // 생일 날짜 변환 
      const newUser = this.userRepository.create({
        name:user.name, // 이름
        email:user.email, // 이메일 
        pictureUrl:user.photo, // 사진
        birthday:birthday, // 생년월일 
        phoneNumber:convertedPhoneNumber, // 휴대폰 번호
        gender:user.gender,
        socialProvider:user.provider,
        role:'USER'
      })
      // const saveUser = await this.userRepository.save(newUser)
      const kakaoJwtToken = this.authService.kakaoLogin(user)
      return kakaoJwtToken
    }
  }


  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
