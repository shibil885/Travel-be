import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Patch,
  Res,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Agency } from './schema/agency.schema';
import { Model, Types } from 'mongoose';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { mailsenderFunc } from 'src/utils/mailSender.util';
import { Otp } from '../otp/schema/otp.schema';

@Injectable()
export class AgencyService {
  constructor(
    @InjectModel(Agency.name) private _AgencyModel: Model<Agency>,
    @InjectModel(Otp.name) private _OtpModel: Model<Otp>,
  ) {}

  async findEmail(res: Response, email: string) {
    try {
      const isExisting = await this._AgencyModel.findOne({
        email: email,
      });
      if (isExisting) {
        return res.status(HttpStatus.OK).json({ isExisting: true });
      }

      return res.status(HttpStatus.OK).json({ isExisting: false });
    } catch (error) {
      console.log('Error occured while fetching Agency email:', error);
      throw new InternalServerErrorException();
    }
  }

  async findName(res: Response, name: string) {
    try {
      const isExisting = await this._AgencyModel.findOne({
        name: name,
      });
      if (isExisting) {
        return res.status(HttpStatus.OK).json({ isExisting: true });
      }

      return res.status(HttpStatus.OK).json({ isExisting: false });
    } catch (error) {
      console.log('Error occured while fetching Agency name:', error);
      throw new InternalServerErrorException();
    }
  }

  async isConfirmed(req, res: Response) {
    try {
      const isConfirmed = await this._AgencyModel.findOne({
        email: req.agency.email,
        isConfirmed: true,
      });
      if (isConfirmed) {
        console.log(isConfirmed);
        return res.status(HttpStatus.OK).json({ isConfirmed: true });
      }
      return res.status(HttpStatus.OK).json({ isConfirmed: false });
    } catch (error) {
      console.log('error while checking agency confirmed or not:', error);
      throw new InternalServerErrorException();
    }
  }

  async signup(res: Response, agencyData, file: Express.Multer.File) {
    try {
      const { password, email, place, phone, agencyName } = agencyData;
      const saltRound = 10;
      const hashedPassword = await bcrypt.hash(password, saltRound);
      const createdAgency = new this._AgencyModel({
        name: agencyName,
        email: email,
        password: hashedPassword,
        place: place,
        phone: phone,
        document: file.filename,
      });

      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log('Generated OTP:', otp);
      const subject = 'Verification email from "Travel"';

      await Promise.all([
        mailsenderFunc(email, subject, 'otp', { otp }),
        new this._OtpModel({ email: email, otp: otp }).save(),
        createdAgency.save(),
      ])
        .then(async () => {
          const agency = await this._AgencyModel.findOne({
            email: agencyData.email,
          });
          return res.status(HttpStatus.CREATED).json({
            agency: agency,
          });
        })
        .catch((err) => {
          console.log('Error:', err);
          throw new InternalServerErrorException();
        });
    } catch (error) {
      console.error('Error during agency creation:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal Server Error', success: false });
    }
  }

  async findOne(email: string) {
    try {
      const agency = await this._AgencyModel.findOne({
        email: email,
        isActive: true,
      });
      if (!agency) return null;
      return agency;
    } catch (error) {
      console.log('Error occured while fetching Agency:', error);
      throw new InternalServerErrorException();
    }
  }

  @Patch('logout')
  userLogout(@Res() res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'strict',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'strict',
    });
    return res.status(200).json({
      message: 'Logout successful',
    });
  }
  async agencyPasswordRest(agencyId: string, password: string) {
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);
    const updateResult = await this._AgencyModel.updateOne(
      {
        _id: new Types.ObjectId(agencyId),
      },
      { $set: { password: hashedPassword } },
    );
    return updateResult.modifiedCount > 0 ? true : false;
  }

  findAgencyById(id: string) {
    return this._AgencyModel.findById(id);
  }
}
