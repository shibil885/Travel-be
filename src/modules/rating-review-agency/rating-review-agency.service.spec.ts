import { Test, TestingModule } from '@nestjs/testing';
import { RatingReviewAgencyService } from './rating-review-agency.service';

describe('RatingReviewAgencyService', () => {
  let service: RatingReviewAgencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RatingReviewAgencyService],
    }).compile();

    service = module.get<RatingReviewAgencyService>(RatingReviewAgencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
