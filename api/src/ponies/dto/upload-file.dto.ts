import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Arquivo de imagem (jpg, jpeg, png, gif, webp)',
  })
  file: Express.Multer.File;
}
