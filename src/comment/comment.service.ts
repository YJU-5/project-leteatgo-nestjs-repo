import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { Comment } from "./entities/comment.entity";
import { UserService } from "../user/user.service";
import { BoardService } from "../board/board.service";
import { ProfanityService } from "../profanity/profanity.service";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private userService: UserService,
    private boardService: BoardService,
    private readonly profanityService: ProfanityService
  ) {}

  async create(
    userId: string,
    boardId: number,
    createCommentDto: CreateCommentDto
  ) {
    // 게시글 존재 여부 확인
    const board = await this.boardService.findOne(boardId);
    if (!board) {
      throw new NotFoundException("게시글을 찾을 수 없습니다.");
    }

    // 사용자 존재 여부 확인
    const user = await this.userService.getProfile(userId);
    if (!user) {
      throw new NotFoundException("사용자를 찾을 수 없습니다.");
    }

    // 욕설 검사
    const contentCheck = await this.profanityService.checkProfanity(
      createCommentDto.content
    );
    if (contentCheck.is_profanity) {
      throw new BadRequestException("욕설이 포함된 댓글은 작성할 수 없습니다.");
    }

    const comment = new Comment();
    comment.content = createCommentDto.content;
    comment.board = board;
    comment.user = user;

    return this.commentRepository.save(comment);
  }

  async findAllByBoardId(boardId: number) {
    // 게시글 존재 여부 확인
    const board = await this.boardService.findOne(boardId);
    if (!board) {
      throw new NotFoundException("게시글을 찾을 수 없습니다.");
    }

    return this.commentRepository.find({
      where: { board: { id: boardId } },
      relations: ["user"],
      order: {
        createdAt: "DESC",
      },
    });
  }

  async findOne(id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ["user", "board"],
    });

    if (!comment) {
      throw new NotFoundException("댓글을 찾을 수 없습니다.");
    }

    return comment;
  }

  async update(id: number, userId: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!comment) {
      throw new NotFoundException(
        "댓글을 찾을 수 없거나 수정 권한이 없습니다."
      );
    }

    // 욕설 검사
    const contentCheck = await this.profanityService.checkProfanity(
      updateCommentDto.content
    );
    if (contentCheck.is_profanity) {
      throw new BadRequestException("욕설이 포함된 댓글은 작성할 수 없습니다.");
    }

    comment.content = updateCommentDto.content;
    return this.commentRepository.save(comment);
  }

  async remove(id: number, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!comment) {
      throw new NotFoundException(
        "댓글을 찾을 수 없거나 삭제 권한이 없습니다."
      );
    }

    await this.commentRepository.remove(comment);
    return true;
  }
}
