import { Test, TestingModule } from '@nestjs/testing';
import { AgencyDashboardController } from './agency-dashboard.controller';

describe('AgencyDashboardController', () => {
  let controller: AgencyDashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgencyDashboardController],
    }).compile();

    controller = module.get<AgencyDashboardController>(
      AgencyDashboardController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
