import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, Wallet } from './schema/wallet.schema';
import { Model, Types } from 'mongoose';
import { ErrorMessages } from 'src/common/enum/error.enum';

@Injectable()
export class WalletService {
  constructor(@InjectModel(Wallet.name) private _WalletModel: Model<Wallet>) {}

  async getOrCreateUserWallet(userId: Types.ObjectId) {
    try {
      let userWallet = await this._WalletModel
        .findOne({ userId: new Types.ObjectId(userId) })
        .exec();
      if (!userWallet) {
        userWallet = await this._WalletModel.create({
          userId: new Types.ObjectId(userId),
        });
      }
      return userWallet;
    } catch (error) {
      console.error('Error in getOrCreateUserWallet:', error.message);
      throw new Error(ErrorMessages.WALLET_CREATION_FAILED);
    }
  }

  async updateBalanceAndTransaction(
    userId: Types.ObjectId,
    newBalance: number,
    newTransaction: Transaction,
  ) {
    if (newTransaction.amount > 0) {
      const walletUpdationResult = await this._WalletModel.updateOne(
        { userId: new Types.ObjectId(userId) },
        {
          $set: { balance: newBalance },
          $push: { history: newTransaction },
        },
      );
      console.log('walletUpdationResult --->', walletUpdationResult);
      return walletUpdationResult.modifiedCount > 0 ? true : false;
    }
    return true;
  }
}
