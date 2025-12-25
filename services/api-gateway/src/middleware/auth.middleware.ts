import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = this.jwtService.verify(token);
        req.user = decoded;
      } catch (error) {
        // Token invalid, but continue (some routes don't require auth)
      }
    }

    next();
  }
}