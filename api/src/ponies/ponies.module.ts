import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { MulterModule } from '@nestjs/platform-express';
import { Pony } from './pony.entity';
import { PoniesController } from './ponies.controller';
import { PoniesService } from './ponies.service';
import { multerConfig } from './config/multer.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pony]),
    MulterModule.register(multerConfig),
  ],
  controllers: [PoniesController],
  providers: [PoniesService],
})
export class PoniesModule {}
