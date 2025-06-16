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
} from "@nestjs/common";
import { BoardService } from "./board.service";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { Public } from "../decorator/public.decorator";

@Controller("board")
@ApiTags("PhotoAlbum")
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: "사진첩 목록 조회",
    description: "모든 사진첩을 최신순으로 조회합니다.",
  })
  @ApiResponse({ status: 200, description: "사진첩 목록 조회 성공" })
  findAll() {
    return this.boardService.findAll();
  }

  @Public()
  @Get(":id")
  @ApiOperation({
    summary: "사진첩 상세 조회",
    description: "특정 사진첩의 상세 정보를 조회합니다.",
  })
  @ApiResponse({ status: 200, description: "사진첩 조회 성공" })
  @ApiResponse({ status: 404, description: "사진첩을 찾을 수 없음" })
  findOne(@Param("id") id: string) {
    return this.boardService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor("files", 4)) // 최대 4개 파일 업로드 허용
  @ApiBearerAuth()
  @ApiOperation({
    summary: "모임 후기 작성",
    description: "소셜 다이닝 모임 후기를 사진과 함께 작성합니다.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          example: "홍대 새로 생긴 이탈리안 레스토랑 모임 후기",
          description: "모임 후기 제목",
        },
        content: {
          type: "string",
          example:
            "오늘 새로 생긴 이탈리안 레스토랑에서 6명이서 모임을 가졌어요!",
          description: "모임 후기 내용",
        },
        files: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
            description: "모임 사진 (선택사항)",
          },
        },
      },
      required: ["title", "content"],
    },
  })
  @ApiResponse({ status: 201, description: "사진첩 작성 성공" })
  @ApiResponse({ status: 401, description: "인증되지 않은 사용자" })
  async create(
    @Req() req: any,
    @Body() createBoardDto: CreateBoardDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res
  ) {
    const result = await this.boardService.create(
      req.user.id,
      createBoardDto,
      files
    );
    if ((result as any).error) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor("files", 4)) // 최대 4개 파일 업로드 허용
  @ApiBearerAuth()
  @ApiOperation({
    summary: "사진첩 수정",
    description: "작성한 사진첩을 수정합니다.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          example: "홍대 이탈리안 레스토랑 모임 후기 (수정)",
          description: "수정할 사진첩 제목 (선택사항)",
        },
        content: {
          type: "string",
          example:
            "사진첩 내용을 수정했습니다. 참석자 정보와 맛집 정보를 추가했어요!",
          description: "수정할 사진첩 내용 (선택사항)",
        },
        files: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
            description: "수정할 모임 사진 (선택사항)",
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: "사진첩 수정 성공" })
  @ApiResponse({ status: 401, description: "인증되지 않은 사용자" })
  @ApiResponse({ status: 403, description: "수정 권한 없음" })
  @ApiResponse({ status: 404, description: "해당 사진첩 찾을 수 없음" })
  update(
    @Param("id") id: string,
    @Req() req: any,
    @Body() updateBoardDto: UpdateBoardDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.boardService.update(+id, req.user.id, updateBoardDto, files);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "사진첩 삭제",
    description: "특정 사진첩을 삭제합니다.",
  })
  @ApiResponse({ status: 200, description: "사진첩 삭제 성공" })
  @ApiResponse({ status: 401, description: "인증되지 않은 사용자" })
  @ApiResponse({ status: 403, description: "삭제 권한 없음" })
  @ApiResponse({ status: 404, description: "사진첩을 찾을 수 없음" })
  remove(@Param("id") id: string, @Req() req: any) {
    return this.boardService.remove(+id, req.user.id);
  }
}
