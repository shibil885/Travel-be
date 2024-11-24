import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CookieMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.cookies = this._parseCookies(req.headers.cookie || '');
    next();
  }

  private _parseCookies(cookieHeader: string): Record<string, string> {
    return cookieHeader
      .split(';')
      .map((v) => v.split('='))
      .reduce((acc, [key, val]) => {
        acc[key.trim()] = decodeURIComponent(val);
        return acc;
      }, {});
  }
}
