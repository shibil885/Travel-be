import { Test, TestingModule } from '@nestjs/testing';
import { RatingReviewPackageService } from './rating-review-package.service';

describe('RatingReviewPackageService', () => {
  let service: RatingReviewPackageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RatingReviewPackageService],
    }).compile();

    service = module.get<RatingReviewPackageService>(
      RatingReviewPackageService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
