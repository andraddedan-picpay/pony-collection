import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PoniesService } from './ponies.service';
import { UpdatePonyDto } from './dto/update-pony.dto';
import { CreatePonyDto } from './dto/create-pony.dto';
import { Pony } from './pony.entity';

@ApiTags('Ponies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ponies')
export class PoniesController {
  constructor(private readonly poniesService: PoniesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo pony' })
  @ApiBody({ type: CreatePonyDto })
  @ApiResponse({
    status: 201,
    description: 'Pony criado com sucesso',
    type: Pony,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  create(@Body() dto: CreatePonyDto) {
    return this.poniesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os ponies' })
  @ApiResponse({
    status: 200,
    description: 'Lista de ponies retornada com sucesso',
    type: [Pony],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  findAll() {
    return this.poniesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pony por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do pony (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Pony encontrado',
    type: Pony,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Pony não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.poniesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar pony' })
  @ApiParam({
    name: 'id',
    description: 'ID do pony (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdatePonyDto })
  @ApiResponse({
    status: 200,
    description: 'Pony atualizado com sucesso',
    type: Pony,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Pony não encontrado',
  })
  update(@Param('id') id: string, @Body() dto: UpdatePonyDto) {
    return this.poniesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover pony' })
  @ApiParam({
    name: 'id',
    description: 'ID do pony (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Pony removido com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Pony não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.poniesService.remove(id);
  }
}
