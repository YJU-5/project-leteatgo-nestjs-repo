import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: 'postgres', // postgres db를 명시
  host: 'postgres_db', // postgres host
  port: 5432, // postgres port
  username: 'root', // db username
  password: '1234', // db password
  database: 'project_5team', // database name
  entities: [__dirname + '/../**/*.entity.{js,ts}'], // entity class를 기반으로 테이블을 생성할 수 있도록 entity 파일 규칙 정의
  synchronize: true,
}; 