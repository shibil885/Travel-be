import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../schema/category.schema';
import { BaseRepository } from 'src/repositories/base/base.repository';
import { ICategoryRepository } from 'src/repositories/category/category.interface';

@Injectable()
export class CategoryRepository
  extends BaseRepository<CategoryDocument>
  implements ICategoryRepository
{
  constructor(
    @InjectModel(Category.name) private _categoryModel: Model<CategoryDocument>,
  ) {
    super(_categoryModel);
  }

  async findByNameExcludingId(
    name: string,
    excludeId?: string,
  ): Promise<CategoryDocument | null> {
    const filter: any = { name: name.toLowerCase().trim() };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    return this.findOne(filter);
  }

  async findActiveCategories(): Promise<CategoryDocument[]> {
    return this.findAll({ isActive: true });
  }

  async updateStatus(
    id: string,
    isActive: boolean,
  ): Promise<CategoryDocument | null> {
    return this.update(id, { isActive });
  }
}
