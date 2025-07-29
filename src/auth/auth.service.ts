import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from 'src/common/dtos/loginUser.dto';
import { UserService } from 'src/modules/user/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { mailsenderFunc } from 'src/utils/mailSender.util';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from 'src/modules/otp/schema/otp.schema';
import { Model, Types } from 'mongoose';
import { LoginAgencyDto } from 'src/common/dtos/loginAgency.dto';
import { AgencyService } from 'src/modules/agency/agency.service';
import { AdminDto } from 'src/common/dtos/admin.dto';
import { AdminService } from 'src/modules/admin/admin.service';
import { JwtPayload } from 'jsonwebtoken';
import { Role } from 'src/common/constants/enum/role.enum';
import { AuthSuccessMessages } from 'src/common/constants/messages';
@Injectable()
export class AuthService {
  constructor(
    private _userservice: UserService,
    private _jwtService: JwtService,
    private _agencyService: AgencyService,
    private _adminService: AdminService,
    @InjectModel(Otp.name) private _OtpModel: Model<Otp>,
  ) {}

  async generateTokens(payload: {
    sub: Types.ObjectId;
    email: string;
    role: string;
  }) {
    const accessToken = this._jwtService.sign(payload, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = this._jwtService.sign(payload, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async validateToken(
    token: string,
  ): Promise<{ valid: boolean; role: string; id: string }> {
    try {
      const decodedData: JwtPayload = this._jwtService.verify(token);
      let entity;
      switch (decodedData.role) {
        case Role.USER:
          entity = await this._userservice.findOne(decodedData.email);
          break;
        case Role.AGENCY:
          entity = await this._agencyService.findOne(decodedData.email);
          break;
        case Role.ADMIN:
          entity = await this._adminService.getAdminWithMail(decodedData.email);
          break;
        default:
          return { valid: false, role: decodedData.role, id: decodedData.sub };
      }
      return entity
        ? { valid: true, role: decodedData.role, id: decodedData.sub }
        : { valid: false, role: decodedData.role, id: decodedData.sub };
    } catch (error) {
      console.error('Error occurred while validating token:', error.message);
      return { valid: false, role: '', id: '' };
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const decodedData: JwtPayload = this._jwtService.verify(refreshToken);
      let entity;

      switch (decodedData.role) {
        case Role.USER:
          entity = await this._userservice.findOne(decodedData.email);
          break;
        case Role.AGENCY:
          entity = await this._agencyService.findOne(decodedData.email);
          break;
        case Role.ADMIN:
          entity = await this._adminService.getAdminWithMail(decodedData.email);
          break;
        default:
          console.log('Unknown role in token');
          throw new ForbiddenException('Unknown role');
      }

      if (!entity) {
        throw new UnauthorizedException('Entity not found or inactive');
      }

      const payload = {
        sub: entity._id,
        email: entity.email,
        role: decodedData.role,
      };
      const tokens = await this.generateTokens(payload);
      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        role: payload.role,
        id: decodedData.sub,
      };
    } catch (error) {
      console.log('Error while refreshing token:', error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async signIn(userData: LoginUserDto) {
    const user = await this._userservice.findOne(userData.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    } else if (!user.isActive) {
      throw new ForbiddenException('You were temporarily blocked');
    }
    const isMatched = await bcrypt.compare(userData.password, user.password);
    if (!isMatched) {
      throw new UnauthorizedException('Invalid email or password');
    } else if (user.isVerified === false) {
      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log('Generated OTP:', otp);
      const subject = 'Verification Mail from "TRAVEL"';

      await Promise.all([
        mailsenderFunc(userData.email, subject, 'otp', { otp }),
        new this._OtpModel({ email: userData.email, otp }).save(),
      ]);
      throw new NotAcceptableException(user);
    }
    const payload = { sub: user._id, email: userData.email, role: 'user' };
    const tokens = await this.generateTokens(payload);
    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user,
      success: true,
      message: '',
    };
  }

  async agencySignIn(agencyData: LoginAgencyDto) {
    const agency = await this._agencyService.findOne(agencyData.email);
    if (!agency) {
      throw new UnauthorizedException('Invalid email or password');
    } else if (!agency.isActive) {
      throw new ForbiddenException('You were temporarily blocked');
    }
    const isMatched = await bcrypt.compare(
      agencyData.password,
      agency.password,
    );
    if (!isMatched) {
      throw new UnauthorizedException('Invalid email or password');
    } else if (agency.isVerified === false) {
      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log('Generated OTP:', otp);
      const subject = 'Verification Mail from "TRAVEL"';

      await Promise.all([
        mailsenderFunc(agencyData.email, subject, 'otp', { otp }),
        new this._OtpModel({ email: agencyData.email, otp }).save(),
      ]);
      throw new NotAcceptableException(agency);
    }
    const payload = {
      sub: agency._id,
      email: agency.email,
      role: 'agency',
    };
    const tokens = await this.generateTokens(payload);
    return {
      agency: agency,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      success: true,
      message: '',
    };
  }

  async adminSignIn(adminData: AdminDto) {
    const admin = await this._adminService.getAdmin(
      adminData.email,
      adminData.password,
    );

    const payload = {
      sub: admin._id,
      email: admin.email,
      role: Role.ADMIN,
    };
    const tokens = await this.generateTokens(payload);
    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      admin: admin,
      success: true,
      message: AuthSuccessMessages.LOGIN_SUCCESS,
    };
  }

  async generateLink(email: string, role: Role) {
    if (!email || !role)
      throw new NotFoundException(
        !email ? 'User email not provided' : 'User role not provided',
      );
    let isExistingUser;
    let token: string;

    if (role === Role.USER) {
      isExistingUser = await this._userservice.findOne(email);
      token = this._jwtService.sign(
        { id: isExistingUser._id },
        {
          expiresIn: process.env.RESET_TOKEN_EXPIRATION,
        },
      );
      console.log('token', token);
      return this._sendResetMail(email, token, isExistingUser.username);
    } else if (role === Role.AGENCY) {
      isExistingUser = await this._agencyService.findOne(email);
      token = this._jwtService.sign(
        { id: isExistingUser._id },
        {
          expiresIn: process.env.RESET_TOKEN_EXPIRATION,
        },
      );
    }
    if (!isExistingUser) throw new NotFoundException('User not exist');
  }

  private async _sendResetMail(email: string, token: string, name: string) {
    const url = `${process.env.FRONTEND_URL}/${process.env.RESET_PASSWORD}/${token}`;
    const mailsended = await mailsenderFunc(
      email,
      'Password Reset Request for Your Account',
      'generatLink',
      { name: name, url: url },
    );
    if (mailsended) {
      return true;
    }
  }

  async validatePasswordResetLink(token: string): Promise<boolean> {
    if (!token) throw new NotFoundException('Token not provided');
    try {
      this._jwtService.verify(token);
      return true;
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return false;
    }
  }

  resetPassword(token: string, password: string, role: Role) {
    if (!token || !password || !role)
      throw new NotFoundException(
        !token
          ? 'token not provided. try again'
          : !password
            ? 'password not provided'
            : 'Role is not provided',
      );
    const parsedId = this._jwtService.decode(token);
    if (role === Role.USER) {
      return this._userservice.userPasswordRest(parsedId, password);
    } else if (role == Role.AGENCY) {
      return this._agencyService.agencyPasswordRest(parsedId, password);
    }
  }
}
