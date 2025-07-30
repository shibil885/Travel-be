// import {
//   HttpException,
//   HttpStatus,
//   Injectable,
//   InternalServerErrorException,
//   NotFoundException,
//   Patch,
//   Res,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Agency } from './schema/agency.schema';
// import { Model, Types } from 'mongoose';
// import { Response } from 'express';
// import * as bcrypt from 'bcryptjs';
// import { mailsenderFunc } from 'src/utils/mailSender.util';
// import { Otp } from '../otp/schema/otp.schema';
// import { AgencyRepository } from './repositories/agency.repository';
// import {
//   AgencyErrorMessages,
//   AgencySuccessMessages,
// } from 'src/common/constants/messages';

// @Injectable()
// export class AgencyService {
//   constructor(
//     @InjectModel(Agency.name) private _AgencyModel: Model<Agency>,
//     @InjectModel(Otp.name) private _OtpModel: Model<Otp>,
//     private readonly _agencyRepository: AgencyRepository,
//   ) {}

//   async getAllAgencies(currentPage: number = 1, limit: number = 5) {
//     try {
//       const skip: number = currentPage * limit;
//       const agencies = await this._agencyRepository.findAllAgenciesWithReviews(
//         skip,
//         limit,
//       );
//       if (!agencies.length)
//         throw new NotFoundException(AgencyErrorMessages.AGENCY_NOT_FOUND);
//       return { agencies, message: AgencySuccessMessages.AGENCY_LIST_FETCHED };
//     } catch (error) {
//       if (error instanceof HttpException) throw error;
//       throw new InternalServerErrorException();
//     }
//   }

//   async findEmail(res: Response, email: string) {
//     try {
//       const isExisting = await this._AgencyModel.findOne({
//         email: email,
//         isVerified: true,
//       });
//       if (isExisting) {
//         return res.status(HttpStatus.OK).json({ isExisting: true });
//       }

//       return res.status(HttpStatus.OK).json({ isExisting: false });
//     } catch (error) {
//       console.log('Error occured while fetching Agency email:', error);
//       throw new InternalServerErrorException();
//     }
//   }

//   async findName(res: Response, name: string) {
//     try {
//       const isExisting = await this._AgencyModel.findOne({
//         name: name,
//         isVerified: true,
//       });
//       if (isExisting) {
//         return res.status(HttpStatus.OK).json({ isExisting: true });
//       }

//       return res.status(HttpStatus.OK).json({ isExisting: false });
//     } catch (error) {
//       console.log('Error occured while fetching Agency name:', error);
//       throw new InternalServerErrorException();
//     }
//   }

//   async isConfirmed(req, res: Response) {
//     try {
//       const isConfirmed = await this._AgencyModel.findOne({
//         email: req.agency.email,
//         isConfirmed: true,
//       });
//       if (isConfirmed) {
//         console.log(isConfirmed);
//         return res.status(HttpStatus.OK).json({ isConfirmed: true });
//       }
//       return res.status(HttpStatus.OK).json({ isConfirmed: false });
//     } catch (error) {
//       console.log('error while checking agency confirmed or not:', error);
//       throw new InternalServerErrorException();
//     }
//   }

//   async signup(res: Response, agencyData, file: Express.Multer.File) {
//     try {
//       const { password, email, place, phone, agencyName } = agencyData;
//       const saltRound = 10;
//       const hashedPassword = await bcrypt.hash(password, saltRound);
//       const createdAgency = new this._AgencyModel({
//         name: agencyName,
//         email: email,
//         password: hashedPassword,
//         place: place,
//         phone: phone,
//         document: file.filename,
//       });

//       const otp = Math.floor(1000 + Math.random() * 9000);
//       console.log('Generated OTP:', otp);
//       const subject = 'Verification email from "Travel"';

//       await Promise.all([
//         mailsenderFunc(email, subject, 'otp', { otp }),
//         new this._OtpModel({ email: email, otp: otp }).save(),
//         createdAgency.save(),
//       ])
//         .then(async () => {
//           const agency = await this._AgencyModel.findOne({
//             email: agencyData.email,
//           });
//           return res.status(HttpStatus.CREATED).json({
//             agency: agency,
//           });
//         })
//         .catch((err) => {
//           console.log('Error:', err);
//           throw new InternalServerErrorException();
//         });
//     } catch (error) {
//       console.error('Error during agency creation:', error);
//       return res
//         .status(HttpStatus.INTERNAL_SERVER_ERROR)
//         .json({ message: 'Internal Server Error', success: false });
//     }
//   }

//   async findOne(email: string) {
//     try {
//       const agency = await this._AgencyModel.findOne({
//         email: email,
//         isActive: true,
//       });
//       if (!agency) return null;
//       return agency;
//     } catch (error) {
//       console.log('Error occured while fetching Agency:', error);
//       throw new InternalServerErrorException();
//     }
//   }

//   @Patch('logout')
//   userLogout(@Res() res: Response) {
//     res.clearCookie('access_token', {
//       httpOnly: true,
//       sameSite: 'strict',
//     });

//     res.clearCookie('refresh_token', {
//       httpOnly: true,
//       sameSite: 'strict',
//     });
//     return res.status(200).json({
//       message: 'Logout successful',
//     });
//   }
//   async agencyPasswordRest(agencyId: string, password: string) {
//     const saltRound = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRound);
//     const updateResult = await this._AgencyModel.updateOne(
//       {
//         _id: new Types.ObjectId(agencyId),
//       },
//       { $set: { password: hashedPassword } },
//     );
//     return updateResult.modifiedCount > 0 ? true : false;
//   }

//   findAgencyById(id: string) {
//     return this._AgencyModel.findById(id);
//   }
// }

import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { mailsenderFunc } from 'src/utils/mailSender.util';
import {
  AgencyErrorMessages,
  AgencySuccessMessages,
  GeneralErrorMessages,
} from 'src/common/constants/messages';
import { IAgencyRepository } from 'src/repositories/agency/agency.interface';
import { IOtpRepository } from 'src/repositories/otp/otp.interface';
import { ResetPasswordDto } from 'src/common/dtos/reset-password.dto';
import { CreateAgencyDto } from 'src/common/dtos/createAgency.dto';

@Injectable()
export class AgencyService {
  constructor(
    @Inject('IAgencyRepository')
    private readonly _agencyRepository: IAgencyRepository,
    @Inject('IOtpRepository')
    private readonly _otpRepository: IOtpRepository,
  ) {}

  async getAllAgencies(page: number = 1, limit: number = 5) {
    try {
      const skip = (page - 1) * limit;
      const [agencies, totalAgencies] = await Promise.all([
        this._agencyRepository.findAllAgenciesWithReviews(skip, limit),
        this._agencyRepository.countActiveVerifiedConfirmedAgencies(),
      ]);

      if (!totalAgencies) {
        throw new NotFoundException(AgencyErrorMessages.AGENCY_NOT_FOUND);
      }

      return {
        agencies,
        totalAgencies,
        currentPage: page,
        totalPages: Math.ceil(totalAgencies / limit),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  async checkEmailExists(email: string) {
    const existingAgency = await this._agencyRepository.findOne({
      email: email,
      isVerified: true,
    });
    return { isExisting: !!existingAgency };
  }

  async checkNameExists(name: string) {
    const existingAgency = await this._agencyRepository.findOne({
      name: name,
      isVerified: true,
    });
    return { isExisting: !!existingAgency };
  }

  async checkAgencyConfirmation(agencyEmail: string) {
    const confirmedAgency = await this._agencyRepository.findOne({
      email: agencyEmail,
      isActive: true,
    });
    return { isConfirmed: !!confirmedAgency };
  }

  async createAgency(
    agencyData: CreateAgencyDto,
    document: Express.Multer.File,
  ) {
    try {
      if (!document) {
        throw new BadRequestException('Document is required');
      }

      const { password, email, place, phone, agencyName } = agencyData;

      const existingAgency = await this._agencyRepository.findOne({
        email: email,
        isVerified: true,
      });
      if (existingAgency) {
        throw new ConflictException(AgencyErrorMessages.AGENCY_ALREADY_EXISTS);
      }

      const saltRound = 10;
      const hashedPassword = await bcrypt.hash(password, saltRound);

      const otp = Math.floor(1000 + Math.random() * 9000);
      const subject = 'Verification email from "Travel"';

      const [savedAgency] = await Promise.all([
        this._agencyRepository.createAgency({
          name: agencyName,
          email,
          password: hashedPassword,
          place,
          phone,
          document: document.filename,
        }),
        this._otpRepository.createOtp(email, otp),
        mailsenderFunc(email, subject, 'otp', { otp }),
      ]);

      return {
        agency: {
          id: savedAgency._id,
          name: savedAgency.name,
          email: savedAgency.email,
          place: savedAgency.place,
          phone: savedAgency.phone,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  async findActiveAgencyByEmail(email: string) {
    try {
      const agency = await this._agencyRepository.findOne({
        email: email,
        isActive: true,
      });
      if (!agency) {
        throw new NotFoundException(AgencyErrorMessages.AGENCY_NOT_FOUND);
      }
      return agency;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  async resetPassword(resetPasswordData: ResetPasswordDto) {
    try {
      const { id, password } = resetPasswordData;

      const agency = await this._agencyRepository.findById(id);
      if (!agency) {
        throw new NotFoundException(AgencyErrorMessages.AGENCY_NOT_FOUND);
      }

      // Hash new password
      const saltRound = 10;
      const hashedPassword = await bcrypt.hash(password, saltRound);

      // Update password
      const updated = await this._agencyRepository.updatePassword(
        id,
        hashedPassword,
      );

      if (!updated) {
        throw new InternalServerErrorException('Failed to update password');
      }

      return { message: AgencySuccessMessages.PASSWORD_RESET_SUCCESS };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  async findAgencyById(id: string) {
    try {
      const agency = await this._agencyRepository.findById(id);
      if (!agency) {
        throw new NotFoundException(AgencyErrorMessages.AGENCY_NOT_FOUND);
      }
      return agency;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  async verifyOtp(email: string, otpCode: number) {
    try {
      const validOtp = await this._otpRepository.findValidOtp(email, otpCode);
      if (!validOtp) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      await this._otpRepository.deleteByEmail(email);

      return { message: 'OTP verified successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  async resendOtp(email: string) {
    try {
      const agency = await this._agencyRepository.findOne({
        email: email,
        isVerified: false,
      });
      if (!agency) {
        throw new NotFoundException(AgencyErrorMessages.AGENCY_NOT_FOUND);
      }

      await this._otpRepository.deleteByEmail(email);

      const otp = Math.floor(1000 + Math.random() * 9000);
      const subject = 'Verification email from "Travel"';

      await Promise.all([
        this._otpRepository.createOtp(email, otp),
        mailsenderFunc(email, subject, 'otp', { otp }),
      ]);

      return { message: 'OTP sent successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }
}
