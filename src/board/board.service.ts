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
    // 욕설 검사
    const titleCheck = await this.profanityService.checkProfanity(
      createBoardDto.title,
    );
    console.log('titleCheck:', titleCheck);

    const contentCheck = await this.profanityService.checkProfanity(
      createBoardDto.content,
    );
    console.log('contentCheck:', contentCheck);

    if (titleCheck.is_profanity || contentCheck.is_profanity) {
      console.log('욕설 감지됨! 에러 응답 반환');
      return {
        statusCode: 400,
        message: '욕설이 포함된 내용은 작성할 수 없습니다.',
        error: true,
      };
    }

    console.log('이 줄이 실행된다면 욕설 없음, 저장 진행!');

    // id로 실제 사용자 찾기
    const user = await this.userService.getProfile(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 이미지 업로드 처리
    const pictureUrls = files ? await this.s3Service.uploadFiles(files) : [];

    // 게시글 생성
    const board = this.boardRepository.create({
      ...createBoardDto,
      picture_urls: pictureUrls,
      user: { id: user.id } as User,
    });

    return this.boardRepository.save(board);
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

    // 욕설 검사 (수정된 내용만)
    if (updateBoardDto.title) {
      const titleCheck = await this.profanityService.checkProfanity(
        updateBoardDto.title,
      );
      console.log('update titleCheck:', titleCheck);
      if (titleCheck.is_profanity) {
        throw new BadRequestException(
          '욕설이 포함된 제목은 사용할 수 없습니다.',
        );
      }
    }

    if (updateBoardDto.content) {
      const contentCheck = await this.profanityService.checkProfanity(
        updateBoardDto.content,
      );
      console.log('update contentCheck:', contentCheck);
      if (contentCheck.is_profanity) {
        throw new BadRequestException(
          '욕설이 포함된 내용은 사용할 수 없습니다.',
        );
      }
    }

    // 이미지 업로드 처리
    if (files && files.length > 0) {
      // 새 이미지 업로드
      const newPictureUrls = await this.s3Service.uploadFiles(files);
      
      // 기존 이미지 URL 유지 + 새 이미지 URL 추가
      const existingUrls = board.picture_urls || [];
      board.picture_urls = [...existingUrls, ...newPictureUrls];
      
      // 최대 4개까지만 유지
      if (board.picture_urls.length > 4) {
        // 초과분 삭제 (오래된 것부터)
        const urlsToDelete = board.picture_urls.slice(4);
        const deletePromises = urlsToDelete.map((url) =>
          this.s3Service.deleteFile(url),
        );
        await Promise.all(deletePromises);
        board.picture_urls = board.picture_urls.slice(0, 4);
      }
    }

    // 게시글 수정
    Object.assign(board, updateBoardDto);

    return this.boardRepository.save(board);
  }

  async remove(id: number, userId: string) {
    const board = await this.boardRepository.findOne({
      where: { id, user: { id: userId } },
    });

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
