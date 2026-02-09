import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Pony } from '../ponies/pony.entity';
import { Favorite } from '../favorites/favorite.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [User, Pony, Favorite],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
