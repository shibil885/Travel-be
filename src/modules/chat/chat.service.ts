import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './schema/chat.schema';
import { Model, Types } from 'mongoose';
import { Agency } from '../agency/schema/agency.schema';
import { MessageSenderType } from 'src/common/enum/messageSenderType.enum';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private _ChatModel: Model<Chat>,
    @InjectModel(Agency.name) private _AgencyModel: Model<Agency>,
  ) {}

  async getAllChats(id: string, userType: MessageSenderType) {
    if (!id) throw new NotFoundException('Id not provided');
    let chats;
    if (userType === MessageSenderType.USER) {
      chats = await this._ChatModel
        .find({ userId: new Types.ObjectId(id) })
        .populate([
          { path: 'userId', select: '_id username profilePicture' },
          { path: 'agencyId', select: '_id name' },
        ]);
    } else if (userType === MessageSenderType.AGENCY) {
      chats = await this._ChatModel.find({ agencyId: new Types.ObjectId(id) });
    }
    console.log('chats', chats);
    return chats;
  }

  async getAgencies() {
    const agencies = await this._AgencyModel
      .find({ isConfirmed: true, isActive: true }, { name: 1, _id: 1 })
      .sort({ name: 1 });
    return agencies;
  }

  async initializeChat(userId: string, agencyId: string) {
    const newChat = await new this._ChatModel({
      userId: new Types.ObjectId(userId),
      agencyId: new Types.ObjectId(agencyId),
      lastMessageId: '',
    }).save();
    const populatedChat = await this._ChatModel
      .findById(newChat._id)
      .populate([
        { path: 'userId', select: '_id username profilePicture' },
        { path: 'agencyId', select: '_id name' },
      ])
      .exec();

    return populatedChat;
  }

  // async getagenciesToChat(userId: string) {
  //   const agencies = await this._ChatModel.aggregate([
  //     {
  //       $match: { userId: new Types.ObjectId(userId) },
  //     },
  //     {
  //       $lookup: {
  //         from: 'messages',
  //         localField: '_id',
  //         foreignField: 'chatId',
  //         as: 'messages',
  //       },
  //     },
  //   ]);
  //   console.log('rrrrrr', agencies);
  // }
}
