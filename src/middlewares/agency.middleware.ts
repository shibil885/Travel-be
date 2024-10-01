import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AgencyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies['agency_refresh_token'];

      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req['agency'] = decoded;
      next();
    } catch (error) {
      console.log('error from admin middleware', error);
      return res.status(403).json({ message: 'Invalid token' });
    }
  }
}
