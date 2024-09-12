import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Agency } from './schema/agency.schema';
import { Model } from 'mongoose';
import { Response } from 'express';
import { CreateAgencyDto } from 'src/common/dtos/CreateAgency.dto';
import * as bcrypt from 'bcrypt';
import { mailsenderFunc } from 'src/utils/mailSender.util';
import { Otp } from '../otp/schema/otp.schema';
@Injectable()
export class AgencyService {
  constructor(
    @InjectModel(Agency.name) private AgencyModel: Model<Agency>,
    @InjectModel(Otp.name) private OtpModel: Model<Otp>,
  ) {}

  async signup(res: Response, agencyData: CreateAgencyDto) {
    try {
      const isExisting = await this.AgencyModel.findOne({
        name: agencyData.name,
      });

      if (isExisting) {
        return res
          .status(HttpStatus.CONFLICT)
          .json({ message: 'Name Already taken' });
      } else if (isExisting && isExisting.contact.email === agencyData.email) {
        return res
          .status(HttpStatus.CONFLICT)
          .json({ message: 'Email already exist' });
      }

      const saltRound = 10;
      const hashedPassword = await bcrypt.hash(agencyData.password, saltRound);
      console.log(agencyData);
      const createdAgency = new this.AgencyModel({
        ...agencyData,
        password: hashedPassword,
        contact: {
          email: agencyData.email,
          place: agencyData.place,
          phone: agencyData.phone,
          document: agencyData.document,
        },
      });

      const otp = Math.floor(1000 + Math.random() * 9000);

      const subject = 'Verification email from "Travel"';

      await Promise.all([
        mailsenderFunc(agencyData.email, subject, 'otp', { otp }),
        new this.OtpModel({ email: agencyData.email, otp: otp }).save(),
        createdAgency.save(),
      ])
        .then(() => {
          return res.status(HttpStatus.CREATED).json({
            message: 'Agency Created and OTP sent to email',
            email: agencyData.email,
          });
        })
        .catch((err) => {
          console.log('Error:', err);
          throw new InternalServerErrorException();
        });
    } catch (error) {
      console.error('Error during user creation:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal Server Error' });
    }
  }
}
