import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from 'src/common/dtos/loginUser.dto';
import { UserService } from 'src/modules/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { mailsenderFunc } from 'src/utils/mailSender.util';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from 'src/modules/otp/schema/otp.schema';
import { Model } from 'mongoose';
import { LoginAgencyDto } from 'src/common/dtos/loginAgency.dto';
import { AgencyService } from 'src/modules/agency/agency.service';
import { AdminDto } from 'src/common/dtos/admin.dto';
import { AdminService } from 'src/modules/admin/admin.service';
import { JwtPayload } from 'jsonwebtoken';
@Injectable()
export class AuthService {
  constructor(
    private userservice: UserService,
    private jwtService: JwtService,
    private agencyService: AgencyService,
    private adminService: AdminService,
    @InjectModel(Otp.name) private OtpModel: Model<Otp>,
  ) {}

  async generateTokens(payload: any) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
    console.log('accc ->', accessToken, 're =>', refreshToken);
    return {
      accessToken,
      refreshToken,
    };
  }
  async validateToken(token: string): Promise<{ valid: boolean }> {
    try {
      console.log('token from validate : ', token);
      const decodedData: JwtPayload = this.jwtService.verify(token);
      console.log('decode =>', decodedData);
      let entity;

      switch (decodedData.role) {
        case 'user':
          entity = await this.userservice.findOne(decodedData.email);
          break;
        case 'agency':
          entity = await this.agencyService.findOne(decodedData.email);
          break;
        case 'admin':
          entity = await this.adminService.findAdmin(decodedData.email);
          break;
        default:
          console.log('Unknown role in token');
          return { valid: false };
      }
      if (!entity) {
        return { valid: false };
      }
      return { valid: true };
    } catch (error) {
      console.error('Error occurred while validating token', error);
      return { valid: false };
    }
  }

  async signIn(userData: LoginUserDto) {
    const user = await this.userservice.findOne(userData.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
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
        new this.OtpModel({ email: userData.email, otp }).save(),
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
    const agency = await this.agencyService.findOne(agencyData.email);
    if (!agency) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isMatched = await bcrypt.compare(
      agencyData.password,
      agency.password,
    );
    console.log(isMatched);
    if (!isMatched) {
      throw new UnauthorizedException('Invalid email or password');
    } else if (agency.isVerified === false) {
      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log('Generated OTP:', otp);
      const subject = 'Verification Mail from "TRAVEL"';

      await Promise.all([
        mailsenderFunc(agencyData.email, subject, 'otp', { otp }),
        new this.OtpModel({ email: agencyData.email, otp }).save(),
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
    const admin = await this.adminService.findOne(
      adminData.email,
      adminData.password,
    );
    if (!admin) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: admin.id,
      email: admin.email,
      role: 'admin',
    };
    const tokens = await this.generateTokens(payload);
    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      admin: admin,
      success: true,
      message: true,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      console.log('refreshhhhhhh  =>', refreshToken);
      const decodedData: JwtPayload = this.jwtService.verify(refreshToken);
      let entity;
      switch (decodedData.role) {
        case 'user':
          entity = await this.userservice.findOne(decodedData.email);
          break;
        case 'agency':
          entity = await this.agencyService.findOne(decodedData.email);
          break;
        case 'admin':
          entity = await this.adminService.findAdmin(decodedData.email);
          break;
        default:
          console.log('Unknown role in token');
          return { valid: false };
      }
      console.log('entity:', entity);
      console.log('decodedData:', decodedData);
      if (!entity) {
        throw new ForbiddenException('Entity not found or inactive');
      }
      const payload = {
        sub: entity._id,
        email: entity.email,
        role: decodedData.role,
      };
      console.log('payload', payload);

      const tokens = await this.generateTokens(payload);
      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };
    } catch (error) {
      console.log('Error while refreshing token:', error);
      throw new ForbiddenException('Invalid or expired refresh token');
    }
  }
}
