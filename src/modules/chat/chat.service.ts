import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './schema/chat.schema';
import { Model, Types } from 'mongoose';
import { Agency } from '../agency/schema/agency.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private _ChatModel: Model<Chat>,
    @InjectModel(Agency.name) private _AgencyModel: Model<Agency>,
  ) {}

  async getAgencies() {
    const agencies = await this._AgencyModel
      .find({ isConfirmed: true, isActive: true }, { name: 1, _id: 1 })
      .sort({ name: 1 });
    return agencies;
  }
  async getagenciesToChat(userId: string) {
    const agencies = await this._ChatModel.aggregate([
      {
        $match: { userId: new Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: 'messages',
          localField: '_id',
          foreignField: 'chatId',
          as: 'messages',
        },
      },
    ]);
    console.log('rrrrrr', agencies);
  }
}
