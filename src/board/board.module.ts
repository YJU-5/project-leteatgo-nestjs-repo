// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { BoardController } from './board.controller';
// import { BoardService } from './board.service';
// import { Board } from './entities/board.entity';
// import { S3Service } from '../s3/s3.service';
// import { UserService } from '../user/user.service';
// import { User } from '../user/entities/user.entity';
// import { AuthModule } from '../auth/auth.module';
// import { UserModule } from '../user/user.module';

// @Module({
//   imports: [TypeOrmModule.forFeature([Board, User]), AuthModule, UserModule],
//   controllers: [BoardController],
//   providers: [BoardService, S3Service],
//   exports: [BoardService],
// })
// export class BoardModule {}
