import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/jwt-payload';
import { UserData } from '../types/user-data';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'sua-chave-secreta-aqui', // Mesma do JwtModule
    });
  }

  // Este método é chamado após o token ser validado
  // O retorno é injetado em req.user
  validate(payload: JwtPayload): UserData {
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}
