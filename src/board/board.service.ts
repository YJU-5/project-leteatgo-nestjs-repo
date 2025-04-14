import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { User } from '../user/entities/user.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    private readonly s3Service: S3Service,
  ) {}

  // 게시물 생성
  async create(
    createBoardDto: CreateBoardDto,
    files: Express.Multer.File[],
    user: User,
  ): Promise<Board> {
    try {
      console.log('Creating board with data:', {
        createBoardDto,
        filesCount: files?.length,
      });

      // Validate required fields
      if (!createBoardDto.title || !createBoardDto.content) {
        throw new BadRequestException('Title and content are required');
      }

      // Create new board entity
      const board = this.boardRepository.create({
        ...createBoardDto,
        userId: user.id,
        user: user,
        imageUrls: [],
        hits: 0,
        like: 0,
      });

      console.log('Board entity created:', board);

      // Upload images if provided
      if (files && files.length > 0) {
        console.log('Uploading files...');
        const imageUrls = await Promise.all(
          files.map(async (file) => {
            try {
              console.log('Uploading file:', file.originalname);
              const uploadResult = await this.s3Service.uploadFile(file);
              return uploadResult;
            } catch (error) {
              console.error('Error uploading file:', error);
              throw new InternalServerErrorException('Error uploading image');
            }
          }),
        );
        board.imageUrls = imageUrls;
        console.log('Files uploaded successfully:', imageUrls);
      }

      // Save board to database
      console.log('Saving board to database...');
      const savedBoard = await this.boardRepository.save(board);
      console.log('Board saved successfully:', savedBoard);
      return savedBoard;
    } catch (error) {
      console.error('Detailed error in create board:', {
        error,
        stack: error.stack,
        message: error.message,
        name: error.name,
      });
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error creating board: ${error.message}`,
      );
    }
  }

  // 전체 게시물 조회
  async findAll(): Promise<Board[]> {
    try {
      return await this.boardRepository.find({
        relations: ['user', 'comments', 'comments.user'],
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        '게시글을 조회하는 중 오류가 발생했습니다.',
      );
    }
  }

  // 특정 게시물 조회
  async findOne(id: number): Promise<Board> {
    try {
      const board = await this.boardRepository.findOne({
        where: { id },
        relations: ['user', 'comments', 'comments.user'],
      });

      if (!board) {
        throw new NotFoundException('게시글을 찾을 수 없습니다.');
      }

      // 조회수 증가
      board.hits += 1;
      await this.boardRepository.save(board);

      return board;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        '게시글을 조회하는 중 오류가 발생했습니다.',
      );
    }
  }

  // 게시물 수정
  async update(
    id: number,
    updateBoardDto: UpdateBoardDto,
    user: User,
  ): Promise<Board> {
    try {
      const board = await this.findOne(id);

      // 작성자 확인
      if (board.user.id !== user.id) {
        throw new UnauthorizedException('게시글을 수정할 권한이 없습니다.');
      }

      // 게시물 업데이트
      await this.boardRepository.update(id, updateBoardDto);
      return await this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        '게시글을 수정하는 중 오류가 발생했습니다.',
      );
    }
  }

  // 게시물 삭제
  async remove(id: number, user: User): Promise<void> {
    try {
      const board = await this.findOne(id);

      // 작성자 확인
      if (board.user.id !== user.id) {
        throw new UnauthorizedException('게시글을 삭제할 권한이 없습니다.');
      }

      // S3에서 이미지 삭제
      if (board.imageUrls && board.imageUrls.length > 0) {
        for (const imageUrl of board.imageUrls) {
          // URL에서 키 추출
          const key = imageUrl.split('/').pop();
          if (key) {
            await this.s3Service.deleteFile(key);
          }
        }
      }

      await this.boardRepository.remove(board);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        '게시글을 삭제하는 중 오류가 발생했습니다.',
      );
    }
  }
}
