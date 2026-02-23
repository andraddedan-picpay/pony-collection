import { ApiProperty } from '@nestjs/swagger';

export class CreatePonyDto {
  @ApiProperty({
    description: 'Nome do pony',
    example: 'Rainbow Dash',
  })
  name: string;

  @ApiProperty({
    description: 'Elemento de harmonia do pony',
    example: 'Loyalty',
  })
  element: string;

  @ApiProperty({
    description: 'Personalidade do pony',
    example: 'Brave and loyal',
  })
  personality: string;

  @ApiProperty({
    description: 'Talento especial do pony',
    example: 'Flying at supersonic speeds',
  })
  talent: string;

  @ApiProperty({
    description: 'Resumo sobre o pony',
    example:
      'Rainbow Dash is a brave pegasus pony who represents the element of loyalty.',
  })
  summary: string;

  @ApiProperty({
    description: 'URL da imagem do pony',
    example: 'https://example.com/rainbow-dash.png',
  })
  imageUrl: string;
}
