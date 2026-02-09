import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Pony } from './pony.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pony])],
  //   controllers: [PoniesController],
  //   providers: [PoniesService],
})
export class PoniesModule {}
