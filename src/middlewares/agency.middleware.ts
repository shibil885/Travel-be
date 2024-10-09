import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AgencyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies['refresh_token'];
      if (!token) {
        return res.status(403).json({ message: 'No token provided' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded['role'] === 'agency') {
        req['agency'] = decoded;
        next();
      } else {
        return res
          .status(403)
          .json({ message: 'Access restricted to agencies' });
      }
    } catch (error) {
      console.log('Error in AgencyMiddleware:', error);
      return res.status(403).json({ message: 'Invalid token' });
    }
  }
}
