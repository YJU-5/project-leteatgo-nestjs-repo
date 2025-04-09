import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { User } from './user/entities/user.entity';
import { Board } from './board/entities/board.entity';
import { Category } from './category/entities/category.entity';
import { ChatRoom } from './chat-room/entities/chat-room.entity';
import { Comment } from './comment/entities/comment.entity';
import { Message } from './message/entities/message.entity';
import { Restaurant } from './restaurant/entities/restaurant.entity';
import { Review } from './review/entities/review.entity';
import { Tag } from './tag/entities/tag.entity';
import { UserChatRoom } from './user-chat-room/entities/user-chat-room.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'root',
  password: '1234',
  database: 'project_5team',
  entities: [
    User,
    Board,
    Category,
    ChatRoom,
    Comment,
    Message,
    Restaurant,
    Review,
    Tag,
    UserChatRoom,
  ],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
