import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { GetUser } from 'src/decorator/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Public } from 'src/decorator/public.decorator';

@ApiTags('boards')
@Controller('api/board')
@UseGuards(JwtAuthGuard) // Apply JWT authentication to all endpoints by default
@ApiBearerAuth() // Add bearer auth to Swagger docs
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly userService: UserService,
  ) {}

  // 게시물 생성 (단일/다중 이미지 지원)
  @Post()
  @ApiOperation({ summary: '게시글 생성' })
  @ApiResponse({
    status: 201,
    description: '게시글이 성공적으로 생성되었습니다.',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('file', 10))
  async create(
    @Body() createBoardDto: CreateBoardDto,
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser() user: User,
  ) {
    return this.boardService.create(createBoardDto, files || [], user);
  }

  // 게시물 목록 조회
  @Public() // Make this endpoint public
  @Get()
  @ApiOperation({ summary: '전체 게시글 조회' })
  @ApiResponse({
    status: 200,
    description: '게시글 목록을 성공적으로 조회했습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러가 발생했습니다.',
  })
  async findAll() {
    try {
      const boards = await this.boardService.findAll();
      return boards;
    } catch (error) {
      throw new HttpException(
        '게시글 목록을 가져오는데 실패했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 특정 게시글 조회
  @Public() // Make this endpoint public
  @Get(':id')
  @ApiOperation({ summary: '특정 게시글 조회' })
  @ApiResponse({
    status: 200,
    description: '게시글을 성공적으로 조회했습니다.',
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.boardService.findOne(id);
  }

  // 게시물 수정
  @Put(':id')
  @ApiOperation({ summary: '게시글 수정' })
  @ApiResponse({
    status: 200,
    description: '게시글이 성공적으로 수정되었습니다.',
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '게시글 제목' },
        content: { type: 'string', description: '게시글 내용' },
        isNotice: { type: 'boolean', description: '공지사항 여부' },
        file: {
          type: 'string',
          format: 'binary',
          description: '게시글 이미지',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // 파일 업로드 처리
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBoardDto: UpdateBoardDto,
    @GetUser() user: User,
  ) {
    return this.boardService.update(id, updateBoardDto, user);
  }

  // 게시물 삭제
  @Delete(':id')
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiResponse({
    status: 200,
    description: '게시글이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.boardService.remove(id, user);
  }
}
