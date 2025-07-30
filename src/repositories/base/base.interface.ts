import { FilterQuery, ProjectionType, UpdateQuery } from 'mongoose';

export interface IBaseRepository<T> {
  findAll(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T>,
  ): Promise<T[]>;

  findById(id: string): Promise<T | null>;

  findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
  ): Promise<T | null>;

  create(data: Partial<T>): Promise<T>;

  update(id: string, data: UpdateQuery<T>): Promise<T | null>;

  delete(id: string): Promise<T | null>;

  countDocument(filter: FilterQuery<T>): Promise<number>;

  findAllWithPaginationAndFilter(
    filter: FilterQuery<T>,
    skip: number,
    limit: number,
    projection?: ProjectionType<T>,
  ): Promise<T[]>;
}
