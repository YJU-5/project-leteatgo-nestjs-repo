// request.interface.ts
import { Request } from 'express';
import { User } from './user.interface';

export interface RequestWithUser extends Request {
  user: User;  // user 필드를 추가
}
