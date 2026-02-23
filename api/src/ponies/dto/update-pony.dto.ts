import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePonyDto {
  @ApiPropertyOptional({
    description: 'Nome do pony',
    example: 'Rainbow Dash',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Elemento de harmonia do pony',
    example: 'Loyalty',
  })
  element?: string;

  @ApiPropertyOptional({
    description: 'Se o pony é favorito',
    example: true,
  })
  isFavorite?: boolean;

  @ApiPropertyOptional({
    description: 'Personalidade do pony',
    example: 'Brave and loyal',
  })
  personality?: string;

  @ApiPropertyOptional({
    description: 'Talento especial do pony',
    example: 'Flying at supersonic speeds',
  })
  talent?: string;

  @ApiPropertyOptional({
    description: 'Resumo sobre o pony',
    example: 'Rainbow Dash is a brave pegasus pony who represents the element of loyalty.',
  })
  summary?: string;

  @ApiPropertyOptional({
    description: 'URL da imagem do pony',
    example: 'https://example.com/rainbow-dash.png',
  })
  imageUrl?: string;
}
