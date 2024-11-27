import { Test, TestingModule } from '@nestjs/testing';
import { AgencyDashboardService } from './agency-dashboard.service';

describe('AgencyDashboardService', () => {
  let service: AgencyDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgencyDashboardService],
    }).compile();

    service = module.get<AgencyDashboardService>(AgencyDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
