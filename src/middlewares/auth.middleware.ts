import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies['access_token'];

    if (!token) {
      console.log('No access token found in cookies');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      console.log('Access token received:', token);

      const decoded = await this.jwtService.verifyAsync(token);
      console.log('Decoded token:', decoded);

      req['user'] = decoded;
      next();
    } catch (error) {
      console.error('Error verifying token:', error.message);
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
}
