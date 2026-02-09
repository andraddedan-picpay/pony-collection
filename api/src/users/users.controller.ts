import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Cadastro de usuário
   * (usado pelo Auth / Register)
   */
  @Post('register')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
