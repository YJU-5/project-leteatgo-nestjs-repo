import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'postgres_db',
  port: 5432,
  username: 'root',
  password: '1234',
  database: 'project_5team',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};
