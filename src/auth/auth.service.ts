import {
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
@Injectable()
export class AuthService {
  constructor(
    private userservice: UserService,
    private jwtService: JwtService,
    private agencyService: AgencyService,
    private adminService: AdminService,
    @InjectModel(Otp.name) private OtpModel: Model<Otp>,
  ) {}
  async signIn(userData: LoginUserDto) {
    const user = await this.userservice.findOne(userData.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isMatched = await bcrypt.compare(userData.password, user.password);
    if (!isMatched) {
      throw new UnauthorizedException('Invalid email or password llllll');
    } else if (user.isVerified === false) {
      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log('Generated OTP:', otp);
      const subject = 'Verification Mail from "TRAVEL"';

      await Promise.all([
        mailsenderFunc(userData.email, subject, 'otp', { otp }),
        new this.OtpModel({ email: userData.email, otp }).save(),
      ]);
      throw new NotAcceptableException();
    }
    const payload = { sub: user.userId, email: userData.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
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

    if (!isMatched) {
      throw new UnauthorizedException('Invalid email or password llllll');
    } else if (agency.isVerified === false) {
      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log('Generated OTP:', otp);
      const subject = 'Verification Mail from "TRAVEL"';

      await Promise.all([
        mailsenderFunc(agencyData.email, subject, 'otp', { otp }),
        new this.OtpModel({ email: agencyData.email, otp }).save(),
      ]);
      throw new NotAcceptableException();
    }
    const payload = { sub: agency.agencyId, email: agency.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
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
    const payload = { sub: admin.id, email: adminData.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
