import { Test, TestingModule } from '@nestjs/testing';
import { RatingReviewPackageController } from './rating-review-package.controller';

describe('RatingReviewPackageController', () => {
  let controller: RatingReviewPackageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingReviewPackageController],
    }).compile();

    controller = module.get<RatingReviewPackageController>(RatingReviewPackageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
