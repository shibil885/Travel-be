import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private _jwtService: JwtService,
    private _authService: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies['access_token'];
    const refreshToken = req.cookies['refresh_token'];
    console.log('invoked');
    if (!accessToken) return res.status(401).json({ message: 'Unauthorized' });
    try {
      const decodedAccessToken =
        await this._jwtService.verifyAsync(accessToken);
      req[decodedAccessToken.role] = decodedAccessToken;
      return next();
    } catch (error) {
      console.error('Error occured while token verify from middleware', error);
      if (!refreshToken) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      try {
        const decodedRefreshToken =
          await this._jwtService.verifyAsync(refreshToken);
        const newTokens = await this._authService.refreshToken(refreshToken);
        res.cookie('access_token', newTokens.access_token, {
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
        });
        res.cookie('refresh_token', newTokens.refresh_token, {
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
        });
        req[decodedRefreshToken.role] = decodedRefreshToken;
        return next();
      } catch (refreshError) {
        console.log('Refresh token error:', refreshError);
        return res.status(401).json({ message: 'Unauthorized' });
      }
    }
  }
}
