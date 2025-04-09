import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: '댓글 생성' })
  @ApiResponse({
    status: 201,
    description: '댓글이 성공적으로 생성되었습니다.',
  })
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 댓글 조회' })
  findAll() {
    return this.commentService.findAll();
  }

  @Get('board/:boardId')
  @ApiOperation({ summary: '특정 게시글의 댓글 조회' })
  findByBoardId(@Param('boardId') boardId: string) {
    return this.commentService.findByBoardId(boardId);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 댓글 조회' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '댓글 수정' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '댓글 삭제' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.remove(id);
  }
}
