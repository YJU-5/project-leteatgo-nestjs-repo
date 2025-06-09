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
} from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { Public } from "../decorator/public.decorator";

@Controller("comment")
@ApiTags("Comment")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(":boardId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "댓글 생성",
    description: "사진첩 게시물에 새로운 댓글을 작성합니다.",
  })
  @ApiParam({
    name: "boardId",
    required: true,
    description: "사진첩 게시물 ID",
  })
  @ApiResponse({ status: 201, description: "댓글 작성 성공" })
  @ApiResponse({ status: 401, description: "인증되지 않은 사용자" })
  @ApiResponse({ status: 404, description: "게시물을 찾을 수 없음" })
  create(
    @Param("boardId") boardId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: any
  ) {
    return this.commentService.create(req.user.id, +boardId, createCommentDto);
  }

  @Public()
  @Get(":boardId")
  @ApiOperation({
    summary: "댓글 목록 조회",
    description: "특정 사진첩 게시물의 모든 댓글을 조회합니다.",
  })
  @ApiParam({
    name: "boardId",
    required: true,
    description: "사진첩 게시물 ID",
  })
  @ApiResponse({ status: 200, description: "댓글 목록 조회 성공" })
  findAll(@Param("boardId") boardId: string) {
    return this.commentService.findAllByBoardId(+boardId);
  }

  @Patch(":commentId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "댓글 수정",
    description: "작성한 댓글을 수정합니다.",
  })
  @ApiParam({
    name: "commentId",
    required: true,
    description: "댓글 ID",
  })
  @ApiResponse({ status: 200, description: "댓글 수정 성공" })
  @ApiResponse({ status: 401, description: "인증되지 않은 사용자" })
  @ApiResponse({ status: 403, description: "수정 권한 없음" })
  @ApiResponse({ status: 404, description: "댓글을 찾을 수 없음" })
  update(
    @Param("commentId") commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: any
  ) {
    return this.commentService.update(
      +commentId,
      req.user.id,
      updateCommentDto
    );
  }

  @Delete(":commentId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "댓글 삭제",
    description: "작성한 댓글을 삭제합니다.",
  })
  @ApiParam({
    name: "commentId",
    required: true,
    description: "댓글 ID",
  })
  @ApiResponse({ status: 200, description: "댓글 삭제 성공" })
  @ApiResponse({ status: 401, description: "인증되지 않은 사용자" })
  @ApiResponse({ status: 403, description: "삭제 권한 없음" })
  @ApiResponse({ status: 404, description: "댓글을 찾을 수 없음" })
  remove(@Param("commentId") commentId: string, @Req() req: any) {
    return this.commentService.remove(+commentId, req.user.id);
  }
}
