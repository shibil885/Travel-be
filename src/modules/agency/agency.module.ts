import { Module } from '@nestjs/common';
import { AgencyController } from './agency.controller';
import { AgencyService } from './agency.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Agency, AgencySchema } from './schema/agency.schema';
import { Otp, OtpSchema } from '../otp/schema/otp.schema';
import { MulterModule } from '@nestjs/platform-express';
import { AgencyRepository } from './repositories/agency.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Agency.name, schema: AgencySchema },
      { name: Otp.name, schema: OtpSchema },
    ]),
    MulterModule.register({
      dest: './src/uploads',
    }),
  ],
  controllers: [AgencyController],
  providers: [AgencyService, AgencyRepository],
  exports: [AgencyService],
})
export class AgencyModule {}
