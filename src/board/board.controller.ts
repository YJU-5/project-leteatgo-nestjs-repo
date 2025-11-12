import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { Public } from '../decorator/public.decorator';

@Controller('board')
@ApiTags('PhotoAlbum')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: '写真アルバム一覧表示',
    description: 'すべての写真アルバムを最新順で表示します。',
  })
  @ApiResponse({ status: 200, description: '写真アルバム一覧表示成功' })
  findAll() {
    return this.boardService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: '写真アルバム詳細表示',
    description: '特定の写真アルバムの詳細情報を表示します。',
  })
  @ApiResponse({ status: 200, description: '写真アルバム表示成功' })
  @ApiResponse({ status: 404, description: '写真アルバムが見つかりません' })
  findOne(@Param('id') id: string) {
    return this.boardService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 4)) // 최대 4개 파일 업로드 허용
  @ApiBearerAuth()
  @ApiOperation({
    summary: '集まりの感想を書く',
    description: 'ソーシャルダイニングの集まり後、写真と一緒に感想を記入します。',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: '弘大で新しくオープンしたイタリアンレストランの集まり感想',
          description: '集まりの感想のタイトル',
        },
        content: {
          type: 'string',
          example:
            '今日、新しくオープンしたイタリアンレストランで6人で集まりました！',
          description: '集まりの感想の内容',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
            description: '集まりの写真（オプション）',
          },
        },
      },
      required: ['title', 'content'],
    },
  })
  @ApiResponse({ status: 201, description: '사진첩 작성 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async create(
    @Req() req: any,
    @Body() createBoardDto: CreateBoardDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res,
  ) {
    const result = await this.boardService.create(
      req.user.id,
      createBoardDto,
      files,
    );

    if ((result as any).error) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 4)) // 최대 4개 파일 업로드 허용
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사진첩 수정',
    description: '작성한 사진첩을 수정합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: '홍대 이탈리안 레스토랑 모임 후기 (수정)',
          description: '수정할 사진첩 제목 (선택사항)',
        },
        content: {
          type: 'string',
          example:
            '사진첩 내용을 수정했습니다. 참석자 정보와 맛집 정보를 추가했어요!',
          description: '수정할 사진첩 내용 (선택사항)',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
            description: '수정할 모임 사진 (선택사항)',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '사진첩 수정 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '수정 권한 없음' })
  @ApiResponse({ status: 404, description: '해당 사진첩 찾을 수 없음' })
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateBoardDto: UpdateBoardDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.boardService.update(+id, req.user.id, updateBoardDto, files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사진첩 삭제',
    description: '특정 사진첩을 삭제합니다.',
  })
  @ApiResponse({ status: 200, description: '사진첩 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '삭제 권한 없음' })
  @ApiResponse({ status: 404, description: '사진첩을 찾을 수 없음' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.boardService.remove(+id, req.user.id);
  }
}
