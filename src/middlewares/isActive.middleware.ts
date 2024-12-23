import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AgencyService } from 'src/modules/agency/agency.service';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class CheckActiveMiddleware implements NestMiddleware {
  constructor(
    private _agencyService: AgencyService,
    private _userService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const role = req['user']
      ? 'user'
      : req['agency']
        ? 'agency'
        : req['admin']
          ? 'admin'
          : null;

    if (!role) {
      console.log('Role is null:', role);
      return res.status(401).json({ message: 'Unexpected role encountered' });
    }

    let accountData;

    try {
      if (role === 'agency') {
        accountData = await this._agencyService.findAgencyById(
          req['agency'].sub,
        );
      } else if (role === 'user') {
        accountData = await this._userService.findUserById(req['user']['sub']);
      } else if (role === 'admin') {
        next();
        return;
      }
      if (!accountData?.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      next();
    } catch (error) {
      console.error('Error in CheckActiveMiddleware:', error);
      return res
        .status(500)
        .json({ message: 'Internal Server Error', error: error.message });
    }
  }
}
