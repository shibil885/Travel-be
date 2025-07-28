export interface IAdminRepository {
  findOne<T>(email: string, password: string): Promise<T | null>;
}
