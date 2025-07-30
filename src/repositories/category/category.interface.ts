import { CategoryDocument } from 'src/modules/category/schema/category.schema';
import { IBaseRepository } from '../base/base.interface';

export interface ICategoryRepository extends IBaseRepository<CategoryDocument> {
  findByNameExcludingId(
    name: string,
    excludeId?: string,
  ): Promise<CategoryDocument | null>;
  findActiveCategories(): Promise<CategoryDocument[]>;
  updateStatus(id: string, isActive: boolean): Promise<CategoryDocument | null>;
}
