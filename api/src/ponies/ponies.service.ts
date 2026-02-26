import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pony } from './pony.entity';
import { CreatePonyDto } from './dto/create-pony.dto';
import { UpdatePonyDto } from './dto/update-pony.dto';
import { UploadResponseDto } from './dto/upload-response.dto';
import { PonySummary } from './types/pony-summary';

@Injectable()
export class PoniesService {
  constructor(
    @InjectRepository(Pony)
    private repository: Repository<Pony>,
  ) {}

  // Criar
  async create(dto: CreatePonyDto): Promise<Pony> {
    const pony = this.repository.create(dto);
    return this.repository.save(pony);
  }

  // Listar todos
  async findAll(): Promise<PonySummary[]> {
    const list = await this.repository.find({
      order: { name: 'ASC' },
    });

    return list.map((pony) => ({
      id: pony.id,
      isFavorite: pony.isFavorite,
      name: pony.name,
      imageUrl: pony.imageUrl,
    }));
  }

  // Buscar por ID
  async findOne(id: string): Promise<Pony> {
    const pony = await this.repository.findOne({ where: { id } });

    if (!pony) {
      throw new NotFoundException(`Pony #${id} não encontrado`);
    }

    return pony;
  }

  // Atualizar
  async update(id: string, dto: UpdatePonyDto): Promise<Pony> {
    const pony = await this.findOne(id);

    Object.assign(pony, dto);

    return this.repository.save(pony);
  }

  // Remover
  async remove(id: string): Promise<void> {
    const pony = await this.findOne(id);
    await this.repository.remove(pony);
  }

  // Processar upload de imagem
  processImageUpload(file: Express.Multer.File): UploadResponseDto {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    // TODO: Mover para variável de ambiente
    const baseUrl = 'http://localhost:3000';
    const imageUrl = `${baseUrl}/uploads/${file.filename}`;

    return { imageUrl };
  }
}
