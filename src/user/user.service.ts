import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService
  ) {}

  // # 구글로그인, 회원가입 #
  async googleLogin(user) {
    // user : 프론트에서 받은 access_token을 이용해 구글 로그인 서버에 요청을하여 받은 사용자 값

    // 해당유저가 이미 가입되어있는 유저인지 해당유저의 소셜ID가 일치한지, 비활성화 유저가 아닌지 검사
    const findUser = await this.userRepository.findOneBy({
      socialId: user.socialId,
      deleted: false,
    });

    // 검사를 완료하였다면 실행
    if (findUser) {
      try {
        // 기존 사용자의 pictureUrl 업데이트
        if (user.photo && user.photo !== findUser.pictureUrl) {
          findUser.pictureUrl = user.photo;
          await this.userRepository.save(findUser);
        }
        const googleJwtToken = this.authService.googleLogin(findUser); // auth.service의 구글로그인
        return googleJwtToken; // 발급된 jwt토큰
      } catch {
        throw new UnauthorizedException("구글 로그인 실패");
      }
      // 비활성화유저도 일반유저도 아닌경우 ## 회원가입 실시 ##
    } else {
      // 생일 날짜 엔티티에 들어갈 수 있게 변환 함수
      function convertBirthdayToDate(birthday: {
        year: number;
        month: number;
        day: number;
      }): Date {
        const { year, month, day } = birthday;
        return new Date(
          `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        );
      }
      // 성별 엔티티에 들어갈 수 있게 변환
      function convertGender(gender: string): string {
        return gender.charAt(0).toUpperCase();
      }
      // 성별 값이 null이 아닐 때만 변환 실행
      const convertedGender = user.gender ? convertGender(user.gender) : null;

      // 생일 값이 null이 아닐 때만 변환 실행
      const formattedBirtday = user.birthday
        ? convertBirthdayToDate(user.birthday)
        : null;

      // 새로 만들어줄 유저의 정보 정리
      const newUser = this.userRepository.create({
        socialId: String(user.socialId),
        name: user.name, // 이름
        email: user.email, // 이메일
        pictureUrl: user.photo || null, // 사진
        birthday: formattedBirtday || null, // 생년월일
        gender: convertedGender || null, // 성별
        socialProvider: user.provider, // 제공자
        role: "USER", // 역할
      });

      // 정리한 유저 정보를 실제로 생성 (회원가입)
      const saveUser = await this.userRepository.save(newUser);

      // 회원가입이 끝나면 자동으로 로그인 실행
      const googleJwtToken = this.authService.googleLogin(saveUser);

      return googleJwtToken; // jwt 토큰 발급후 컨트롤러에 전송
    }
  }

  // # 카카오 로그인, 회원가입 #
  async kakaoLogin(user) {
    // user : 프론트에서 받은 access_token을 이용해 카카오 로그인 서버에 요청을하여 받은 사용자 값

    // 해당유저가 이미 가입되어있는 유저인지 해당유저의 소셜ID가 일치한지, 비활성화 유저가 아닌지 검사
    const findUser = await this.userRepository.findOneBy({
      socialId: user.socialId,
      deleted: false,
    });

    // 검사를 완료하였다면 실행
    if (findUser) {
      try {
        // JWT 토큰 발급
        const kakaoJwtToken = this.authService.kakaoLogin(findUser); // auth.service의 카카오로그인
        return kakaoJwtToken; // 발급된 jwt토큰
      } catch {
        throw new UnauthorizedException("카카오 로그인 실패");
      }
      // 비활성화유저도 일반유저도 아닌경우 회원가입 실시
    } else {
      // 생년월일 엔티티에 들어갈 수 있게 변환
      const birthday = new Date(
        `${user.birthday.slice(0, 4)}-${user.birthday.slice(4, 6)}-${user.birthday.slice(6, 8)}`
      );
      // 전화번호 엔티티에 들어갈 수 있게 변환
      function convertPhoneNumber(phoneNumber: string): string {
        return "0" + phoneNumber.slice(4);
      }
      // 성별 엔티티에 들어갈 수 있게 변환
      function convertGender(gender: string): string {
        return gender.charAt(0).toUpperCase();
      }

      // 변환된 휴대폰번호
      const convertedPhoneNumber = convertPhoneNumber(user.phone_number);

      // 변환된 성별
      const convertedGender = convertGender(user.gender);

      // 새로 만들어줄 유저의 정보 정리
      const newUser = this.userRepository.create({
        socialId: String(user.socialId),
        name: user.name, // 이름
        email: user.email, // 이메일
        pictureUrl: user.photo || null, // 사진
        birthday: birthday || null, // 생년월일
        phoneNumber: convertedPhoneNumber || null, // 휴대폰 번호
        gender: convertedGender || null,
        socialProvider: user.provider,
        role: "USER",
      });

      // 정리한 유저 정보를 실제로 생성
      const saveUser = await this.userRepository.save(newUser);

      // 회원가입이 끝나면 자동으로 로그인 실행
      const kakaoJwtToken = this.authService.kakaoLogin(saveUser);

      return kakaoJwtToken; // jwt 토큰 발급 후 컨트롤러에 전송
    }
  }

  // 회원 탈퇴(비활성화)
  async deactivateUser(socialId: string) {
    // 컨트롤러에서 받은 소셜아이디로 유저를 찾고 deleted 항목을 true로 수정함으로 유저 비활성화
    return await this.userRepository.update(socialId, { deleted: true });
  }

  // 회원 복구(활성화)
  async restoreUser(socialId: string) {
    // 컨트롤러에서 받은 소셜아이디로 유저를 찾고 deleted 항목을 false로 수정함으로 유저 비활성화
    return await this.userRepository.update(socialId, { deleted: false });
  }

  // 본인 회원 정보 조회
  async getProfile(id: string) {
    // id로 유저를 찾기
    return await this.userRepository.findOne({ where: { socialId: id } });
  }

  // 회원 정보 수정 // dto 참고, swagger로 해보기
  async updateProfile(
    socialId: string,
    updateUserDto: UpdateUserDto,
    uploadedUrl: string
  ) {
    // 컨트롤러에서 받아온 socialId, 프론트엔드에서 받아온 updateUserDto, s3에 이미지를 올리고 url을 받아온 uploadUrl
    // socialId로 해당하는 유저정보를 DB에서 불러옴
    const userProfile = await this.userRepository.findOneBy({
      socialId: socialId,
    });

    // DB에서 불러온 유저의 정보에서 아이디 추출
    const id = userProfile.id;

    // 사진 URL이 없으면 사진 URL 반영안함
    if (uploadedUrl.length <= 0) {
      // 위에서 추출한 유저아이디에 해당하는 정보를 수정
      await this.userRepository.update(id, {
        name: updateUserDto.name || null,
        phoneNumber: updateUserDto.phoneNumber || null,
        description: updateUserDto.description || null,
      });
      // 사진 URL 있으면 사진 URL 반영
    } else {
      // 위에서 추출한 유저아이디에 해당하는 정보를 수정
      await this.userRepository.update(id, {
        name: updateUserDto.name,
        phoneNumber: updateUserDto.phoneNumber || null,
        description: updateUserDto.description || null,
        pictureUrl: uploadedUrl || null,
      });
    }
    // 수정된 회원정보 조회
    const userProfileUpdated = this.userRepository.findOneBy({
      socialId: socialId,
    });

    // 수정된 회원정보를 컨트롤러에 보내줌
    return userProfileUpdated;
  }
}
