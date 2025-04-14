import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
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
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id: id.toString() },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async updateProfilePicture(id: number, picture_url: string): Promise<User> {
    const user = await this.findOne(id);
    user.picture_url = picture_url;
    return await this.userRepository.save(user);
  }

  // 소셜 회원가입
  // # 구글로그인, 회원가입 #
  async googleLogin(user) {
    console.log('Google login user data:', JSON.stringify(user));

    // socialId가 없는 경우 이메일로 사용자 찾기 시도
    let socialId = user.socialId || user.id;
    if (!socialId && user.email) {
      // 이메일로 사용자 찾기
      const existingUser = await this.userRepository.findOne({
        where: { email: user.email },
      });

      if (existingUser) {
        console.log('Found user by email:', existingUser.email);
        // 기존 사용자가 있으면 socialId 업데이트
        if (!existingUser.socialId && socialId) {
          existingUser.socialId = socialId;
          await this.userRepository.save(existingUser);
        }

        // JWT 토큰 발급
        const jwtToken = await this.authService.googleLogin(existingUser);
        console.log('Generated JWT token for existing user');
        return jwtToken;
      }
    }

    // socialId로 사용자 찾기
    if (socialId) {
      const findUser = await this.userRepository.findOneBy({
        socialId: socialId,
        deleted: false,
      });

      if (findUser) {
        try {
          console.log('User found by socialId:', findUser.email);
          // JWT 토큰 발급
          const googleJwtToken = await this.authService.googleLogin(findUser);
          console.log('Generated JWT token');
          return googleJwtToken;
        } catch (error) {
          console.error('Google login error:', error);
          throw new UnauthorizedException('구글 로그인 실패');
        }
      }
    }

    // 새 사용자 생성
    console.log('Creating new user from Google data');
    try {
      // 기본값 설정
      const now = new Date();
      const defaultBirthday = now;
      const defaultGender = 'U'; // Unspecified

      // 사용자 생성
      const newUser = this.userRepository.create({
        socialId: String(socialId || Date.now()),
        name: user.name,
        email: user.email,
        picture_url: user.picture || user.photo,
        birthday: defaultBirthday,
        gender: defaultGender,
        socialProvider: 'GOOGLE',
        role: 'USER',
      });

      const saveUser = await this.userRepository.save(newUser);
      console.log('New user created:', saveUser.email);

      const googleJwtToken = await this.authService.googleLogin(saveUser);
      console.log('Generated JWT token for new user');
      return googleJwtToken;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new UnauthorizedException('사용자 생성 실패: ' + error.message);
    }
  }

  // 카카오 로그인, 회원가입 // 만약 카카오톡에서 정보를 수정해도 수정한 값 그대로 들어가기
  async kakaoLogin(user) {
    const findUser = await this.userRepository.findOneBy({
      socialId: user.socialId,
      deleted: false,
    });
    if (findUser) {
      try {
        // JWT 토큰 발급
        const kakaoJwtToken = this.authService.kakaoLogin(findUser);
        return kakaoJwtToken;
      } catch {
        throw new UnauthorizedException('카카오 로그인 실패');
      }
      // 비활성화유저도 일반유저도 아닌경우 회원가입 실시
    } else {
      // 생년월일 변환
      const birthday = new Date(
        `${user.birthday.slice(0, 4)}-${user.birthday.slice(4, 6)}-${user.birthday.slice(6, 8)}`,
      );
      // 전화번호 변환
      function convertPhoneNumber(phoneNumber: string): string {
        return '0' + phoneNumber.slice(4);
      }
      // 성별 변환
      function convertGender(gender: string): string {
        return gender.charAt(0).toUpperCase();
      }
      const convertedPhoneNumber = convertPhoneNumber(user.phone_number);
      const convertedGender = convertGender(user.gender);
      // 안되어있는 경우 createUser후 토큰 발급
      // 생일 날짜 변환
      const newUser = this.userRepository.create({
        socialId: String(user.socialId),
        name: user.name, // 이름
        email: user.email, // 이메일
        picture_url: user.photo, // 사진
        birthday: birthday, // 생년월일
        phoneNumber: convertedPhoneNumber, // 휴대폰 번호
        gender: convertedGender,
        socialProvider: user.provider,
        role: 'USER',
      });
      const saveUser = await this.userRepository.save(newUser); // 실제 생성
      console.log(saveUser);
      const kakaoJwtToken = this.authService.kakaoLogin(saveUser);
      return kakaoJwtToken;
    }
  }
  // 본인 회원 정보 조회
  async getProfile(socialId: string) {
    return await this.userRepository.findOne({ where: { socialId: socialId } });
  }

  // 회원 탈퇴(비활성화)
  async deactivateUser(socialId: string) {
    return await this.userRepository.update(socialId, { deleted: true });
  }

  // 회원 복구(활성화)
  async restoreUser(socialId: string) {
    return await this.userRepository.update(socialId, { deleted: false });
  }

  // 회원 정보 수정 // dto 참고, swagger로 해보기
  async updateProfile(
    socialId: string,
    updateUserDto: UpdateUserDto,
    uploadedUrl: string,
  ) {
    const userProfile = await this.userRepository.findOneBy({
      socialId: socialId,
    });
    const id = userProfile.id;
    // URL이 없으면 사진 URL 반영안함
    if (uploadedUrl.length <= 0) {
      await this.userRepository.update(id, {
        name: updateUserDto.name,
        phoneNumber: updateUserDto.phoneNumber,
        description: updateUserDto.description,
      });
    } else {
      // URL 있으면 반영함
      await this.userRepository.update(id, {
        name: updateUserDto.name,
        phoneNumber: updateUserDto.phoneNumber,
        description: updateUserDto.description,
        picture_url: uploadedUrl,
      });
    }
    const userProfileUpdated = this.userRepository.findOneBy({
      socialId: socialId,
    });
    return userProfileUpdated;
  }

  // 첫 번째 사용자 조회
  async findFirst(): Promise<User> {
    return this.userRepository.findOne({
      where: { deleted: false },
      order: { createdAt: 'ASC' },
    });
  }
}
