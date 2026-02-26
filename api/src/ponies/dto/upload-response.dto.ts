import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    description: 'URL pública da imagem enviada',
    example: 'http://localhost:3000/uploads/1234567890-pony.png',
  })
  imageUrl: string;
}
