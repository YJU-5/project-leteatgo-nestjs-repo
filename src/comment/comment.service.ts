import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Board } from 'src/board/entities/board.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const { content, boardId, userId } = createCommentDto;

    const board = await this.boardRepository.findOne({
      where: { id: Number(boardId) },
    });
    if (!board) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const comment = this.commentRepository.create({
      content,
      board,
      user,
    });

    return this.commentRepository.save(comment);
  }

  async findAll() {
    return this.commentRepository.find({
      relations: ['user', 'board'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'board'],
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.findOne(id);
    const updatedComment = this.commentRepository.merge(
      comment,
      updateCommentDto,
    );
    return this.commentRepository.save(updatedComment);
  }

  async remove(id: number) {
    const comment = await this.findOne(id);
    return this.commentRepository.remove(comment);
  }

  async findByBoardId(boardId: string) {
    return this.commentRepository.find({
      where: { board: { id: Number(boardId) } },
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
