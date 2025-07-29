import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat, Message } from './schema/chat.schema';
import { Model, Types } from 'mongoose';
import { Agency } from '../agency/schema/agency.schema';
import { MessageSenderType } from 'src/common/constants/enum/messageSenderType.enum';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private _ChatModel: Model<Chat>,
    @InjectModel(Message.name) private _MessageModel: Model<Message>,
    @InjectModel(Agency.name) private _AgencyModel: Model<Agency>,
    @InjectModel(User.name) private _UserModel: Model<User>,
  ) {}

  async getAllChats(id: string, userType: MessageSenderType) {
    if (!id) throw new NotFoundException('Id not provided');
    let chats;
    if (userType === MessageSenderType.USER) {
      chats = await this._ChatModel.aggregate([
        {
          $match: { userId: new Types.ObjectId(id) },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
          },
        },
        {
          $unwind: { path: '$userId', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'agencies',
            localField: 'agencyId',
            foreignField: '_id',
            as: 'agencyId',
          },
        },
        {
          $unwind: { path: '$agencyId', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'messages',
            localField: 'lastMessageId',
            foreignField: '_id',
            as: 'lastMessageId',
          },
        },
        {
          $unwind: { path: '$lastMessageId', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'messages',
            localField: '_id',
            foreignField: 'chatId',
            as: 'messages',
            pipeline: [
              {
                $match: {
                  isRead: false,
                  senderId: { $ne: new Types.ObjectId(id) },
                },
              },
            ],
          },
        },
        {
          $project: {
            'userId.password': 0,
            'agencyId.password': 0,
          },
        },
      ]);
    } else if (userType === MessageSenderType.AGENCY) {
      chats = await this._ChatModel.aggregate([
        {
          $match: { agencyId: new Types.ObjectId(id) },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
          },
        },
        {
          $unwind: { path: '$userId', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'agencies',
            localField: 'agencyId',
            foreignField: '_id',
            as: 'agencyId',
          },
        },
        {
          $unwind: { path: '$agencyId', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'messages',
            localField: 'lastMessageId',
            foreignField: '_id',
            as: 'lastMessageId',
          },
        },
        {
          $unwind: { path: '$lastMessageId', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'messages',
            localField: '_id',
            foreignField: 'chatId',
            as: 'messages',
            pipeline: [
              {
                $match: {
                  isRead: false,
                  senderId: { $ne: new Types.ObjectId(id) },
                },
              },
            ],
          },
        },
        {
          $project: {
            'userId.password': 0,
            'agencyId.password': 0,
          },
        },
      ]);
    }
    return chats;
  }

  async getAllMessages(chatId: string) {
    if (!chatId) throw new BadRequestException('Chat id not provided');
    const messages = await this._MessageModel.find({
      chatId: new Types.ObjectId(chatId),
    });
    return messages;
  }

  async getUsersOrAgenciesToChat(userType: MessageSenderType) {
    try {
      if (userType === MessageSenderType.AGENCY) {
        return await this._UserModel.find(
          { isActive: true },
          { username: 1, _id: 1, profilePicture: 1 },
        );
      } else {
        return await this._AgencyModel
          .find({ isConfirmed: true, isActive: true }, { name: 1, _id: 1 })
          .sort({ name: 1 });
      }
    } catch (error) {
      console.error('Error fetching users or agencies:', error.message);
      throw new Error('Failed to fetch users or agencies.');
    }
  }

  async initializeChat(userId: string, agencyId: string) {
    const newChat = await new this._ChatModel({
      userId: new Types.ObjectId(userId),
      agencyId: new Types.ObjectId(agencyId),
      lastMessageId: null,
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

  async addMessage(
    userId: string,
    chatId: string,
    userType: MessageSenderType,
    content: string,
  ) {
    if (!chatId || !content) {
      throw new BadRequestException(
        !chatId ? 'Chat ID is required' : 'Message content is required',
      );
    }
    try {
      const newMessage = await new this._MessageModel({
        chatId: new Types.ObjectId(chatId),
        senderId: new Types.ObjectId(userId),
        senderType: userType,
        content,
      }).save();

      const chatUpdateResult = await this._ChatModel.updateOne(
        { _id: new Types.ObjectId(chatId) },
        {
          $set: {
            lastMessageId: new Types.ObjectId(newMessage._id as string),
          },
        },
      );

      if (chatUpdateResult.modifiedCount === 0) {
        throw new InternalServerErrorException(
          'Failed to update chat with the last message ID.',
        );
      }

      return newMessage;
    } catch (error) {
      console.error('Error while adding message:', error.message);
      throw new InternalServerErrorException(
        'An error occurred while adding the message.',
      );
    }
  }

  async makeMessageRead(chatId: string, userType: string) {
    const result = await this._MessageModel.updateMany(
      {
        chatId: new Types.ObjectId(chatId),
        isRead: false,
        senderType: { $ne: userType },
      },
      { isRead: true },
    );
    return result.modifiedCount > 0 ? { result: true, chatId } : false;
  }
}
