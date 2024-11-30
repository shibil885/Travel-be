import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Request, Response } from 'express';
import { MessageSenderType } from 'src/common/enum/messageSenderType.enum';

@Controller('chat')
export class ChatController {
  constructor(private _chatService: ChatService) {}

  @Get()
  async getAllChats(
    @Req() req: Request,
    @Res() res: Response,
    @Query('userType') userType: MessageSenderType,
  ) {
    try {
      if (!userType) throw new NotFoundException('User type not found');
      let response;
      if (userType === MessageSenderType.USER) {
        response = await this._chatService.getAllChats(
          req['user']['sub'],
          userType,
        );
      } else if (userType === MessageSenderType.AGENCY) {
        response = await this._chatService.getAllChats(
          req['agency']['sub'],
          userType,
        );
      } else {
        throw new InternalServerErrorException('Found not defined user type ');
      }
      if (response) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'List of chats', chats: response });
      } else {
        throw new InternalServerErrorException('Somthing went wrong');
      }
    } catch (error) {
      console.log('Error occured while fetch chats', error);
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Get('users')
  async getAgencies(@Req() req: Request, @Res() res: Response) {
    try {
      const userRole =
        req[MessageSenderType.AGENCY]?.['role'] || MessageSenderType.USER;

      const response =
        await this._chatService.getUsersOrAgenciesToChat(userRole);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: response.length ? 'List of agencies' : 'No agencies found',
        users: response,
      });
    } catch (error) {
      console.error(
        'Error occurred while fetching agencies to add chat:',
        error.message,
      );
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error occurred while fetching agencies.',
      });
    }
  }

  @Post('initialize')
  async initializeChat(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: { userType: MessageSenderType; id: string },
  ) {
    try {
      if (!body.userType || !body.id)
        throw new NotFoundException(
          !body.userType ? 'UserType is not provided' : 'id not provided',
        );
      let response;
      if (body.userType === MessageSenderType.USER) {
        response = await this._chatService.initializeChat(
          body.id,
          req['agency']['sub'],
        );
      } else if (body.userType === MessageSenderType.AGENCY) {
        response = await this._chatService.initializeChat(
          req['user']['sub'],
          body.id,
        );
      } else {
        throw new InternalServerErrorException();
      }
      if (response) {
        return res
          .status(HttpStatus.CREATED)
          .json({ success: true, message: 'chat initialized', chat: response });
      }
    } catch (error) {
      console.log('Error occured while initialize chat', error);
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }
}
