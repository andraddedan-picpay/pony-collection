import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const sqliteConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'database.sqlite',
  autoLoadEntities: true,
  synchronize: false, // usando migrations
  migrationsRun: true, // roda migrations automaticamente ao iniciar
};
