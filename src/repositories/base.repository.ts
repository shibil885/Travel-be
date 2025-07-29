import { Document, FilterQuery, Model, ProjectionType } from 'mongoose';

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
  ): Promise<T | null> {
    return this.model.findOne(filter, projection).exec();
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
    projection?: ProjectionType<T>,
  ): Promise<T[]> {
    return this.model.find(filter, projection).skip(skip).limit(limit).exec();
  }
}
