import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule],
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'sua-chave-secreta-aqui', // ⚠️ Em produção, usar variável de ambiente
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class AuthModule {}
