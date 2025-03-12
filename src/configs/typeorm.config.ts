import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: 'postgres', // postgres db를 명시
  host: process.env.DB_HOST, // postgres host
  port: parseInt(process.env.DB_PORT, 10), // postgres port
  username: process.env.DB_USERNAME, // db username
  password: process.env.DB_PASSWORD, // db password
  database: process.env.DB_DATABASE_NAME, // database name
  entities: [__dirname + '/../**/*.entity.{js,ts}'], // entity class를 기반으로 테이블을 생성할 수 있도록 entity 파일 규칙 정의
  synchronize: true,
};
