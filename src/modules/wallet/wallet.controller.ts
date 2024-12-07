import { Controller, Get, Res, HttpStatus, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Request, Response } from 'express';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getOrCreateUserWallet(@Req() req: Request, @Res() res: Response) {
    try {
      const wallet = await this.walletService.getOrCreateUserWallet(
        req['user']['sub'],
      );
      return res.status(HttpStatus.OK).json(wallet);
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }
  @Get('admin')
  async getOrCreateAdminWallet(@Req() req: Request, @Res() res: Response) {
    try {
      const wallet = await this.walletService.getOrCreateUserWallet(
        req['admin']['sub'],
      );
      return res.status(HttpStatus.OK).json(wallet);
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }
}
