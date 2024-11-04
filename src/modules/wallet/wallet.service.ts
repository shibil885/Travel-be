import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, Wallet } from './schema/wallet.schema';
import { Model } from 'mongoose';

@Injectable()
export class WalletService {
  constructor(@InjectModel(Wallet.name) private _WalletModel: Model<Wallet>) {}

  async createWallet(userId: string) {
    const newWalletOfUser = await new this._WalletModel({
      userId: userId,
    }).save();
    return newWalletOfUser ? true : false;
  }

  async getUserWallet(userId: string) {
    const userWallet = await this._WalletModel.findOne({ userId: userId });
    console.log('userWallet -->', userWallet);
    return userWallet ? userWallet : null;
  }

  async updateBalanceAndTransaction(
    userId: string,
    newBalance: string,
    newTransaction: Transaction,
  ) {
    const walletUpdationResult = await this._WalletModel.updateOne(
      { userId: userId },
      {
        $set: { balance: newBalance },
        $push: { history: newTransaction },
      },
    );
    return walletUpdationResult.modifiedCount > 0 ? true : false;
  }
}
