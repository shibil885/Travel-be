import { Document, FilterQuery, Model } from 'mongoose';

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async countDocument(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async findAllWithPaginationAndFilter(
    filter: FilterQuery<T>,
    skip: number,
    limit: number,
  ): Promise<T[]> {
    return this.model.find(filter).skip(skip).limit(limit).exec();
  }
}
