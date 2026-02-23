import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('ponies')
export class Pony {
  @ApiProperty({
    description: 'ID único do pony',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nome do pony',
    example: 'Rainbow Dash',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Se o pony é favorito',
    example: false,
  })
  @Column()
  isFavorite: boolean;

  @ApiProperty({
    description: 'Elemento de harmonia do pony',
    example: 'Loyalty',
  })
  @Column()
  element: string;

  @ApiProperty({
    description: 'Personalidade do pony',
    example: 'Brave and loyal',
  })
  @Column()
  personality: string;

  @ApiProperty({
    description: 'Talento especial do pony',
    example: 'Flying at supersonic speeds',
  })
  @Column()
  talent: string;

  @ApiProperty({
    description: 'Resumo sobre o pony',
    example: 'Rainbow Dash is a brave pegasus pony who represents the element of loyalty.',
  })
  @Column({ type: 'text' })
  summary: string;

  @ApiProperty({
    description: 'URL da imagem do pony',
    example: 'https://example.com/rainbow-dash.png',
  })
  @Column()
  imageUrl: string;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2024-01-15T10:30:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;
}
