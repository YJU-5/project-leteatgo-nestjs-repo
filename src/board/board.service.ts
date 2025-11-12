import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { S3Service } from '../s3/s3.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { ProfanityService } from '../profanity/profanity.service';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private s3Service: S3Service,
    private userService: UserService,
    private readonly profanityService: ProfanityService,
  ) {}

  // 게시판 기본 CRUD
  async create(
    userId: string,
    createBoardDto: CreateBoardDto,
    files: Express.Multer.File[],
  ) {
    console.log('=== 게시글 작성 시작 ===');
    console.log('userId:', userId);
    console.log('title:', createBoardDto.title);
    console.log('content:', createBoardDto.content);

    // 욕설 검사 (AI 서비스가 실패해도 게시글 작성은 진행)
    let titleCheck = { is_profanity: false, confidence: 0 };
    let contentCheck = { is_profanity: false, confidence: 0 };

    console.log('제목 욕설 검사 시작');
    try {
      titleCheck = await this.profanityService.checkProfanity(
        createBoardDto.title,
      );
      console.log('titleCheck 성공:', titleCheck);
    } catch (error) {
      console.error('욕설 검사 실패 (제목):', error);
      // AI 서비스 실패 시 욕설 검사를 건너뛰고 진행
      titleCheck = { is_profanity: false, confidence: 0 };
    }
    console.log('제목 욕설 검사 완료, titleCheck:', titleCheck);

    console.log('내용 욕설 검사 시작');
    try {
      contentCheck = await this.profanityService.checkProfanity(
        createBoardDto.content,
      );
      console.log('contentCheck 성공:', contentCheck);
    } catch (error) {
      console.error('욕설 검사 실패 (내용):', error);
      // AI 서비스 실패 시 욕설 검사를 건너뛰고 진행
      contentCheck = { is_profanity: false, confidence: 0 };
    }
    console.log('내용 욕설 검사 완료, contentCheck:', contentCheck);

    if (titleCheck.is_profanity || contentCheck.is_profanity) {
      console.log('욕설 감지됨! 에러 응답 반환');
      return {
        statusCode: 400,
        message: '욕설이 포함된 내용은 작성할 수 없습니다.',
        error: true,
      };
    }

    console.log('이 줄이 실행된다면 욕설 없음, 저장 진행!');
    console.log('userId:', userId);

    // id로 실제 사용자 찾기
    let user;
    try {
      console.log('사용자 조회 시작, socialId:', userId);
      user = await this.userService.getProfile(userId);
      console.log('사용자 조회 결과:', user ? '찾음' : '없음');
    } catch (error) {
      console.error('사용자 조회 실패:', error);
      throw new NotFoundException(`User not found: ${error.message}`);
    }

    if (!user) {
      throw new NotFoundException(`User not found with socialId: ${userId}`);
    }

    // 이미지 업로드 처리
    let pictureUrls: string[] = [];
    if (files && files.length > 0) {
      try {
        console.log('이미지 업로드 시작, 파일 개수:', files.length);
        pictureUrls = await this.s3Service.uploadFiles(files);
        console.log('이미지 업로드 완료, URL 개수:', pictureUrls.length);
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        throw new BadRequestException(`이미지 업로드 실패: ${error.message}`);
      }
    }

    // 게시글 생성
    try {
      console.log('게시글 생성 시작');
      const board = this.boardRepository.create({
        ...createBoardDto,
        picture_urls: pictureUrls,
        user: { id: user.id } as User,
      });
      console.log('게시글 저장 시작');
      const savedBoard = await this.boardRepository.save(board);
      console.log('게시글 저장 완료, ID:', savedBoard.id);
      return savedBoard;
    } catch (error) {
      console.error('게시글 저장 실패:', error);
      throw error;
    }
  }

  async findAll() {
    return this.boardRepository.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (board) {
      board.hits += 1;
      await this.boardRepository.save(board);
    }

    return board;
  }

  async update(
    id: number,
    userId: string,
    updateBoardDto: UpdateBoardDto,
    files: Express.Multer.File[],
  ) {
    const board = await this.findOne(id);

    if (!board) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 권한 체크
    if (board.user.id !== userId) {
      throw new BadRequestException('수정 권한이 없습니다.');
    }

    // 욕설 검사 (수정된 내용만, AI 서비스 실패 시 건너뛰기)
    if (updateBoardDto.title) {
      try {
        const titleCheck = await this.profanityService.checkProfanity(
          updateBoardDto.title,
        );
        console.log('update titleCheck:', titleCheck);
        if (titleCheck.is_profanity) {
          throw new BadRequestException(
            '욕설이 포함된 제목은 사용할 수 없습니다.',
          );
        }
      } catch (error) {
        console.error('욕설 검사 실패 (제목 수정):', error);
        // AI 서비스 실패 시 욕설 검사를 건너뛰고 진행
      }
    }

    if (updateBoardDto.content) {
      try {
        const contentCheck = await this.profanityService.checkProfanity(
          updateBoardDto.content,
        );
        console.log('update contentCheck:', contentCheck);
        if (contentCheck.is_profanity) {
          throw new BadRequestException(
            '욕설이 포함된 내용은 사용할 수 없습니다.',
          );
        }
      } catch (error) {
        console.error('욕설 검사 실패 (내용 수정):', error);
        // AI 서비스 실패 시 욕설 검사를 건너뛰고 진행
      }
    }

    // 기존 이미지 URL
    const oldImageUrls = board.picture_urls || [];
    console.log('=== 게시글 수정 시작 ===');
    console.log('기존 이미지 URL:', oldImageUrls);

    // 남아있는 기존 이미지 URL 목록 파싱
    let remainingImageUrls: string[] = [];
    const dto = updateBoardDto as any; // multipart/form-data 파싱을 위해
    console.log('받은 existingImageUrls:', dto.existingImageUrls);

    if (dto.existingImageUrls) {
      try {
        // 문자열인 경우 JSON 파싱, 이미 배열인 경우 그대로 사용
        if (typeof dto.existingImageUrls === 'string') {
          remainingImageUrls = JSON.parse(dto.existingImageUrls);
        } else if (Array.isArray(dto.existingImageUrls)) {
          remainingImageUrls = dto.existingImageUrls;
        }
        console.log('파싱된 남아있는 이미지 URL:', remainingImageUrls);
      } catch (error) {
        console.error('existingImageUrls 파싱 실패:', error);
        console.error('파싱 실패한 값:', dto.existingImageUrls);
      }
    } else {
      console.log(
        'existingImageUrls가 없습니다. 모든 기존 이미지가 삭제된 것으로 간주합니다.',
      );
    }

    // 삭제된 이미지 찾기 (기존에 있던 이미지 중 남아있지 않은 것)
    // URL 비교 시 정확한 문자열 매칭 사용
    const deletedImageUrls = oldImageUrls.filter((oldUrl) => {
      const exists = remainingImageUrls.some(
        (remainingUrl) =>
          remainingUrl === oldUrl || remainingUrl.trim() === oldUrl.trim(),
      );
      return !exists;
    });
    console.log('삭제할 이미지 URL:', deletedImageUrls);
    console.log('삭제할 이미지 개수:', deletedImageUrls.length);

    // 삭제된 이미지를 S3에서 삭제
    if (deletedImageUrls.length > 0) {
      console.log('S3에서 이미지 삭제 시작:', deletedImageUrls);
      try {
        const deletePromises = deletedImageUrls.map(async (url) => {
          try {
            await this.s3Service.deleteFile(url);
            console.log('S3에서 이미지 삭제 성공:', url);
          } catch (error) {
            console.error('S3에서 이미지 삭제 실패:', url, error);
            throw error;
          }
        });
        await Promise.all(deletePromises);
        console.log('S3에서 모든 이미지 삭제 완료');
      } catch (error) {
        console.error('S3 이미지 삭제 중 오류 발생:', error);
        // S3 삭제 실패해도 게시글 수정은 진행
      }
    } else {
      console.log('삭제할 이미지가 없습니다.');
    }

    // 새 이미지 업로드
    let newPictureUrls: string[] = [];
    if (files && files.length > 0) {
      try {
        newPictureUrls = await this.s3Service.uploadFiles(files);
        console.log('새 이미지 업로드 완료:', newPictureUrls);
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        throw new BadRequestException(`이미지 업로드 실패: ${error.message}`);
      }
    }

    // 최종 이미지 URL 목록: 남아있는 기존 이미지 + 새로 업로드한 이미지
    const finalImageUrls = [...remainingImageUrls, ...newPictureUrls];
    console.log('최종 이미지 URL 목록:', finalImageUrls);
    console.log('최종 이미지 개수:', finalImageUrls.length);

    // 최대 4개까지만 유지
    if (finalImageUrls.length > 4) {
      // 초과분 삭제 (오래된 것부터)
      const urlsToDelete = finalImageUrls.slice(4);
      const deletePromises = urlsToDelete.map((url) =>
        this.s3Service.deleteFile(url),
      );
      await Promise.all(deletePromises);
      board.picture_urls = finalImageUrls.slice(0, 4);
    } else {
      board.picture_urls = finalImageUrls;
    }

    // 게시글 수정
    Object.assign(board, updateBoardDto);

    return this.boardRepository.save(board);
  }

  async remove(id: number, userId: string) {
    const board = await this.boardRepository.findOne({
      where: { id, user: { id: userId } },
    });

    console.log('=== 게시글 삭제 시작 ===',board);

    if (!board) {
      return false;
    }

    // 이미지가 있다면 S3에서 삭제
    if (board.picture_urls) {
      const deletePromises = board.picture_urls.map((url) =>
        this.s3Service.deleteFile(url),
      );

      await Promise.all(deletePromises);
    }

    await this.boardRepository.remove(board);

    return true;
  }
}
