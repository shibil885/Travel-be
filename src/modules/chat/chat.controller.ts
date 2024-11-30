import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private _chatService: ChatService) {}

  @Get('agencies')
  async getAgemcies(@Res() res: Response) {
    try {
      const response = await this._chatService.getAgencies();
      if (response.length) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'List of agencies',
          agencies: response,
        });
      } else {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'List of agencies',
          agencies: [],
        });
      }
    } catch (error) {
      console.log('Error occured while fetching agencies to add chat', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }
}
